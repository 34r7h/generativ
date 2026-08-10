/**
 * Stripe integration.
 *
 * Talks to the Stripe REST API directly over fetch — no SDK, so there is no
 * dependency to keep current and nothing between the secret key and the wire
 * that we have not read.
 *
 * Two rules hold everywhere in this file:
 *
 *   1. The secret key is read from the database inside this module and is never
 *      returned to any caller. `getAdminView` is the only shape the admin
 *      screen receives, and it carries a fingerprint rather than a key.
 *   2. Prices are taken from the stored Service record, never from the request.
 *      A client sends a service slug; what it costs is decided here.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import * as cmsDB from './db.js';
import type { PaymentSettings, Service } from './schema';

const STRIPE_API = 'https://api.stripe.com/v1';

const DEFAULTS: Omit<PaymentSettings, 'updatedAt'> = {
  provider: 'stripe',
  enabled: false,
  publishableKey: '',
  secretKey: '',
  webhookSecret: '',
  currency: 'usd',
  successUrl: 'https://www.generativ.cc/checkout/success',
  cancelUrl: 'https://www.generativ.cc/checkout/cancel'
};

export async function loadSettings(): Promise<PaymentSettings> {
  const stored = await cmsDB.getPaymentSettings();
  return { ...DEFAULTS, updatedAt: '', ...(stored || {}) };
}

/**
 * What the admin screen is allowed to see: everything except the secrets
 * themselves. `secretKeyHint` is the last four characters, which is enough to
 * confirm which key is installed without being enough to use it.
 */
export async function getAdminView() {
  const s = await loadSettings();
  return {
    provider: s.provider,
    enabled: s.enabled,
    publishableKey: s.publishableKey,
    currency: s.currency,
    successUrl: s.successUrl,
    cancelUrl: s.cancelUrl,
    updatedAt: s.updatedAt,
    hasSecretKey: !!s.secretKey,
    secretKeyHint: s.secretKey ? `••••${s.secretKey.slice(-4)}` : '',
    secretKeyMode: s.secretKey.startsWith('sk_live') ? 'live'
      : s.secretKey.startsWith('sk_test') ? 'test' : '',
    hasWebhookSecret: !!s.webhookSecret,
    webhookSecretHint: s.webhookSecret ? `••••${s.webhookSecret.slice(-4)}` : ''
  };
}

/** What the public site is allowed to see. */
export async function getPublicConfig() {
  const s = await loadSettings();
  return {
    enabled: s.enabled && !!s.secretKey,
    publishableKey: s.publishableKey,
    currency: s.currency
  };
}

function validateKey(value: string, prefixes: string[], label: string): string | null {
  if (!value) return null;
  if (!prefixes.some((p) => value.startsWith(p))) {
    return `${label} does not look like a Stripe key (expected ${prefixes.join(' or ')}…)`;
  }
  return null;
}

/**
 * Updates configuration. A blank secret field means "leave the stored value
 * alone" — the admin screen never receives the key, so it cannot send it back,
 * and a save from a form that only changed the currency must not wipe it.
 */
export async function updateSettings(input: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  const current = await loadSettings();

  const publishableKey = typeof input.publishableKey === 'string'
    ? input.publishableKey.trim() : current.publishableKey;
  const secretKey = input.secretKey ? String(input.secretKey).trim() : current.secretKey;
  const webhookSecret = input.webhookSecret ? String(input.webhookSecret).trim() : current.webhookSecret;

  const problem =
    validateKey(publishableKey, ['pk_test_', 'pk_live_'], 'Publishable key') ||
    validateKey(secretKey, ['sk_test_', 'sk_live_', 'rk_test_', 'rk_live_'], 'Secret key') ||
    validateKey(webhookSecret, ['whsec_'], 'Webhook signing secret');
  if (problem) return { success: false, error: problem };

  const enabled = typeof input.enabled === 'boolean' ? input.enabled : current.enabled;
  if (enabled && !(publishableKey && secretKey)) {
    return { success: false, error: 'Both a publishable key and a secret key are required before payments can be enabled' };
  }

  // Live and test keys must not be mixed; a live secret behind a test
  // publishable key produces confusing failures at checkout rather than here.
  const mode = (k: string) => (k.includes('_live_') ? 'live' : k.includes('_test_') ? 'test' : '');
  if (publishableKey && secretKey && mode(publishableKey) && mode(secretKey)
      && mode(publishableKey) !== mode(secretKey)) {
    return { success: false, error: 'Publishable and secret keys are from different modes (one live, one test)' };
  }

  await cmsDB.savePaymentSettings({
    provider: 'stripe',
    enabled,
    publishableKey,
    secretKey,
    webhookSecret,
    currency: (input.currency || current.currency || 'usd').toLowerCase(),
    successUrl: input.successUrl || current.successUrl,
    cancelUrl: input.cancelUrl || current.cancelUrl
  });

  return { success: true };
}

// Stripe takes form-encoded bodies with bracket notation for nested fields.
function encodeForm(data: Record<string, any>, prefix = ''): string[] {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    const name = prefix ? `${prefix}[${key}]` : key;
    if (typeof value === 'object' && !Array.isArray(value)) {
      parts.push(...encodeForm(value, name));
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === 'object') parts.push(...encodeForm(item, `${name}[${i}]`));
        else parts.push(`${encodeURIComponent(`${name}[${i}]`)}=${encodeURIComponent(String(item))}`);
      });
    } else {
      parts.push(`${encodeURIComponent(name)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts;
}

async function stripeRequest(secretKey: string, path: string, body: Record<string, any>) {
  const response = await fetch(`${STRIPE_API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': '2024-06-20'
    },
    body: encodeForm(body).join('&')
  });

  const payload = await response.json();
  if (!response.ok) {
    // Stripe's message is safe to surface; it describes configuration, not keys.
    throw new Error(payload?.error?.message || `Stripe request failed (${response.status})`);
  }
  return payload;
}

function describePrice(service: Service, fallbackCurrency: string) {
  const p = service.pricingDetail;
  if (!p || p.model === 'quote') return null;
  return {
    model: p.model,
    amount: p.amount ?? 0,
    currency: (p.currency || fallbackCurrency).toLowerCase(),
    interval: p.interval || 'month',
    intervalCount: p.intervalCount || 1,
    stripePriceId: p.stripePriceId || ''
  };
}

/**
 * Creates a Stripe Checkout Session for a service.
 *
 * The caller supplies a slug and, optionally, an email to prefill. Everything
 * that determines what is charged — amount, currency, interval, mode — comes
 * from the stored service record.
 */
export async function createCheckoutSession(
  input: { serviceSlug?: string; email?: string }
): Promise<{ success: boolean; url?: string; orderId?: string; error?: string }> {
  const settings = await loadSettings();

  if (!settings.enabled || !settings.secretKey) {
    return { success: false, error: 'Payments are not enabled' };
  }
  if (!input.serviceSlug) {
    return { success: false, error: 'Service slug is required' };
  }

  const service = await cmsDB.getServiceBySlug(input.serviceSlug);
  if (!service || !service.isPublished) {
    return { success: false, error: 'Service not found' };
  }
  if (!service.pricingDetail?.purchasable) {
    return { success: false, error: 'This service is not available for checkout' };
  }

  const price = describePrice(service, settings.currency);
  if (!price) {
    return { success: false, error: 'This service is quoted rather than priced' };
  }
  if (!price.stripePriceId && (!price.amount || price.amount < 50)) {
    return { success: false, error: 'This service has no usable price configured' };
  }

  const mode = price.model === 'subscription' ? 'subscription' : 'payment';

  const lineItem: Record<string, any> = price.stripePriceId
    ? { price: price.stripePriceId, quantity: 1 }
    : {
        quantity: 1,
        price_data: {
          currency: price.currency,
          unit_amount: price.amount,
          product_data: {
            name: service.title,
            description: service.shortDescription?.slice(0, 500)
          },
          ...(mode === 'subscription'
            ? { recurring: { interval: price.interval, interval_count: price.intervalCount } }
            : {})
        }
      };

  const session = await stripeRequest(settings.secretKey, '/checkout/sessions', {
    mode,
    line_items: [lineItem],
    success_url: `${settings.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: settings.cancelUrl,
    client_reference_id: service.slug,
    ...(input.email ? { customer_email: String(input.email).slice(0, 200) } : {}),
    metadata: { serviceId: service.id, serviceSlug: service.slug }
  });

  const orderId = await cmsDB.createOrder({
    serviceId: service.id,
    serviceSlug: service.slug,
    serviceTitle: service.title,
    mode,
    amount: session.amount_total ?? price.amount ?? 0,
    currency: price.currency,
    status: 'created',
    stripeSessionId: session.id,
    customerEmail: input.email || undefined
  });

  return { success: true, url: session.url, orderId };
}

/**
 * Verifies a Stripe webhook signature.
 *
 * Stripe signs `${timestamp}.${rawBody}` with the endpoint's signing secret.
 * The raw body matters: re-serialised JSON will not match.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  webhookSecret: string,
  toleranceSeconds = 300
): { valid: boolean; reason?: string } {
  if (!webhookSecret) return { valid: false, reason: 'No webhook signing secret configured' };
  if (!signatureHeader) return { valid: false, reason: 'Missing signature header' };

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((p) => p.split('=', 2) as [string, string])
  );
  const timestamp = parts.t;
  const provided = parts.v1;
  if (!timestamp || !provided) return { valid: false, reason: 'Malformed signature header' };

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSeconds) {
    return { valid: false, reason: 'Signature timestamp outside tolerance' };
  }

  const expected = createHmac('sha256', webhookSecret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');

  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(provided, 'utf8');
  if (a.length !== b.length) return { valid: false, reason: 'Signature mismatch' };
  if (!timingSafeEqual(a, b)) return { valid: false, reason: 'Signature mismatch' };

  return { valid: true };
}

/** Applies a verified webhook event to the order it refers to. */
export async function applyWebhookEvent(event: any): Promise<{ handled: boolean; note?: string }> {
  const type = event?.type;
  const object = event?.data?.object;
  if (!type || !object) return { handled: false, note: 'Event had no data object' };

  if (type === 'checkout.session.completed' || type === 'checkout.session.async_payment_succeeded') {
    const order = await cmsDB.getOrderBySessionId(object.id);
    if (!order) return { handled: false, note: `No order for session ${object.id}` };
    await cmsDB.updateOrder(order.id, {
      status: object.payment_status === 'paid' ? 'paid' : 'created',
      stripeCustomerId: object.customer || undefined,
      stripeSubscriptionId: object.subscription || undefined,
      stripePaymentIntentId: object.payment_intent || undefined,
      customerEmail: object.customer_details?.email || order.customerEmail,
      amount: object.amount_total ?? order.amount
    });
    return { handled: true };
  }

  if (type === 'checkout.session.expired' || type === 'checkout.session.async_payment_failed') {
    const order = await cmsDB.getOrderBySessionId(object.id);
    if (!order) return { handled: false, note: `No order for session ${object.id}` };
    await cmsDB.updateOrder(order.id, {
      status: type.endsWith('expired') ? 'canceled' : 'failed'
    });
    return { handled: true };
  }

  return { handled: false, note: `Unhandled event type ${type}` };
}
