/**
 * Price formatting, shared by the public pages and the admin editor so a price
 * reads the same wherever it appears.
 *
 * Amounts are stored in minor units (cents) to match Stripe. Nothing here ever
 * does arithmetic on a float.
 */

export const PRICING_MODELS = [
  { value: 'quote', label: 'Quoted — no self-serve price' },
  { value: 'one_time', label: 'One-time payment' },
  { value: 'subscription', label: 'Subscription' }
];

export const INTERVALS = [
  { value: 'month', label: 'per month' },
  { value: 'year', label: 'per year' }
];

export function formatAmount(minorUnits, currency = 'usd') {
  if (typeof minorUnits !== 'number' || Number.isNaN(minorUnits)) return '';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currency || 'usd').toUpperCase(),
      minimumFractionDigits: minorUnits % 100 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    }).format(minorUnits / 100);
  } catch {
    return `${(minorUnits / 100).toFixed(2)} ${(currency || 'usd').toUpperCase()}`;
  }
}

/** The price as one line, e.g. "$500" or "$2,400 per month". */
export function formatPrice(pricing, fallbackCurrency = 'usd') {
  if (!pricing || pricing.model === 'quote') return '';
  const amount = formatAmount(pricing.amount, pricing.currency || fallbackCurrency);
  if (!amount) return '';
  if (pricing.model !== 'subscription') return amount;
  const every = pricing.intervalCount && pricing.intervalCount > 1
    ? `every ${pricing.intervalCount} ${pricing.interval}s`
    : `per ${pricing.interval || 'month'}`;
  return `${amount} ${every}`;
}

/** Whether the public site should offer a checkout button. */
export function isPurchasable(service) {
  const p = service?.pricingDetail;
  if (!p || !p.purchasable || p.model === 'quote') return false;
  return !!p.stripePriceId || (typeof p.amount === 'number' && p.amount >= 50);
}

export function checkoutLabel(service) {
  return service?.pricingDetail?.model === 'subscription' ? 'Start subscription' : 'Pay and book';
}

/** Parses a "1234.56" style admin input into minor units. */
export function toMinorUnits(input) {
  if (input === '' || input === null || input === undefined) return undefined;
  const cleaned = String(input).replace(/[^0-9.]/g, '');
  if (!cleaned) return undefined;
  return Math.round(Number.parseFloat(cleaned) * 100);
}

/** Renders minor units back into an editable major-unit string. */
export function toMajorUnits(minorUnits) {
  if (typeof minorUnits !== 'number' || Number.isNaN(minorUnits)) return '';
  return (minorUnits / 100).toFixed(2).replace(/\.00$/, '');
}
