<script setup>
/**
 * Payments (/admin/payments).
 *
 * Stripe keys are entered here and stored server-side. Two things about the
 * secret fields are deliberate and worth knowing before editing this file:
 *
 *   - No API operation returns the secret key or the webhook signing secret.
 *     This screen is served a fingerprint (last four characters) so you can
 *     confirm which key is installed without the key ever reaching a browser.
 *   - Because of that, a blank secret field means "leave the stored value
 *     alone". Saving a change to the currency cannot wipe the key.
 *
 * Prices live on each service, not here; this screen only holds the connection
 * and shows what has been bought through it.
 */
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminSidebar from './components/AdminSidebar.vue';
import AdminHeader from './components/AdminHeader.vue';
import AppIcon from '../../shared/AppIcon.vue';
import { cmsAPI } from '../../../api/client';
import { formatAmount } from '../../../config/pricing';

const router = useRouter();
const loading = ref(true);
const saving = ref(false);
const error = ref(null);
const notice = ref(null);

const stored = ref({});
const orders = ref([]);

const form = ref({
  enabled: false,
  publishableKey: '',
  secretKey: '',
  webhookSecret: '',
  currency: 'usd',
  successUrl: '',
  cancelUrl: ''
});

const webhookUrl = computed(() => {
  const base = import.meta.env.VITE_API_URL || 'https://generativ.haxters.com';
  return `${base}/stripe/webhook`;
});

const modeLabel = computed(() => {
  if (!stored.value.hasSecretKey) return '';
  return stored.value.secretKeyMode === 'live' ? 'Live mode' : 'Test mode';
});

const readyToEnable = computed(
  () => !!(form.value.publishableKey && (form.value.secretKey || stored.value.hasSecretKey))
);

// Payments can be live and taking money while the site never learns that a
// charge succeeded: without the signing secret every webhook is rejected and
// orders sit at "created" forever. That state has to be visible here.
const settlementBroken = computed(
  () => !!stored.value.enabled && !!stored.value.hasSecretKey && !stored.value.hasWebhookSecret
);

const strandedOrders = computed(() => orders.value.filter((o) => o.status === 'created').length);

const paidTotal = computed(() =>
  orders.value
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + (o.amount || 0), 0)
);

async function load() {
  try {
    loading.value = true;
    error.value = null;

    const [settingsResponse, ordersResponse] = await Promise.all([
      cmsAPI.getPaymentSettings(),
      cmsAPI.getOrders().catch(() => ({ success: false }))
    ]);

    if (settingsResponse.success && settingsResponse.settings) {
      stored.value = settingsResponse.settings;
      form.value = {
        enabled: !!settingsResponse.settings.enabled,
        publishableKey: settingsResponse.settings.publishableKey || '',
        // Never prefilled — the server does not send them.
        secretKey: '',
        webhookSecret: '',
        currency: settingsResponse.settings.currency || 'usd',
        successUrl: settingsResponse.settings.successUrl || '',
        cancelUrl: settingsResponse.settings.cancelUrl || ''
      };
    }

    if (ordersResponse.success) {
      orders.value = ordersResponse.orders || [];
    }
  } catch (err) {
    console.error('Error loading payment settings:', err);
    error.value = err.message || 'Failed to load payment settings';
  } finally {
    loading.value = false;
  }
}

async function save() {
  try {
    saving.value = true;
    error.value = null;
    notice.value = null;

    const payload = {
      enabled: form.value.enabled,
      publishableKey: form.value.publishableKey.trim(),
      currency: form.value.currency.trim().toLowerCase(),
      successUrl: form.value.successUrl.trim(),
      cancelUrl: form.value.cancelUrl.trim()
    };
    // Only send secrets when the operator actually typed one.
    if (form.value.secretKey.trim()) payload.secretKey = form.value.secretKey.trim();
    if (form.value.webhookSecret.trim()) payload.webhookSecret = form.value.webhookSecret.trim();

    const response = await cmsAPI.updatePaymentSettings(payload);
    if (!response.success) throw new Error(response.error || 'Failed to save payment settings');

    stored.value = response.settings || stored.value;
    form.value.secretKey = '';
    form.value.webhookSecret = '';
    notice.value = 'Payment settings saved.';
  } catch (err) {
    console.error('Error saving payment settings:', err);
    error.value = err.message || 'Failed to save payment settings';
  } finally {
    saving.value = false;
  }
}

function copyWebhookUrl() {
  navigator.clipboard?.writeText(webhookUrl.value);
  notice.value = 'Webhook URL copied.';
}

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString();
}

onMounted(() => {
  if (!localStorage.getItem('authToken')) {
    router.push('/admin/login');
    return;
  }
  load();
});
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar />

    <div class="admin-content">
      <AdminHeader
        title="Payments"
        subtitle="Stripe connection and the orders taken through it."
      />

      <div v-if="loading" class="state-panel">
        <div class="spinner"></div>
        <p>Loading payment settings…</p>
      </div>

      <template v-else>
        <div v-if="error" class="banner danger">
          <AppIcon name="alert" :size="20" />
          <p>{{ error }}</p>
        </div>

        <div v-if="notice" class="banner success">
          <AppIcon name="check" :size="20" />
          <p>{{ notice }}</p>
        </div>

        <div v-if="settlementBroken" class="banner warn">
          <AppIcon name="alert" :size="20" />
          <div>
            <p><strong>Payments are live, but nothing will be marked paid.</strong></p>
            <p>
              No webhook signing secret is set, so every notification Stripe sends is rejected.
              Customers will be charged and receipted; orders here stay at “created”.
              <template v-if="strandedOrders">{{ strandedOrders }} order<template v-if="strandedOrders !== 1">s</template> currently in that state.</template>
              Add the endpoint below in Stripe, then paste its signing secret above.
            </p>
          </div>
        </div>

        <form class="panel" @submit.prevent="save">
          <div class="panel-head">
            <h2>Stripe connection</h2>
            <div class="panel-actions">
              <span v-if="modeLabel" class="mode-chip" :class="stored.secretKeyMode">{{ modeLabel }}</span>
              <button class="primary-button" type="submit" :disabled="saving">
                <AppIcon name="check" :size="16" />
                <span>{{ saving ? 'Saving…' : 'Save settings' }}</span>
              </button>
            </div>
          </div>

          <label class="toggle-row">
            <input type="checkbox" v-model="form.enabled" :disabled="!readyToEnable" />
            <span>
              <strong>Accept payments</strong>
              <small v-if="!readyToEnable">Add a publishable key and a secret key first.</small>
              <small v-else>Checkout buttons appear on services priced and marked purchasable.</small>
            </span>
          </label>

          <div class="field-grid">
            <label class="field">
              <span class="field-label"><AppIcon name="external" :size="15" /> Publishable key</span>
              <input
                v-model="form.publishableKey"
                type="text"
                class="input"
                autocomplete="off"
                spellcheck="false"
                placeholder="pk_test_… or pk_live_…"
              />
            </label>

            <label class="field">
              <span class="field-label"><AppIcon name="shield" :size="15" /> Secret key</span>
              <input
                v-model="form.secretKey"
                type="password"
                class="input"
                autocomplete="new-password"
                spellcheck="false"
                :placeholder="stored.hasSecretKey ? `Stored ${stored.secretKeyHint} — leave blank to keep` : 'sk_test_… or sk_live_…'"
              />
              <small class="hint">
                Stored on the server and never sent back to this screen. Leave blank to keep the
                current key; type a new one to replace it.
              </small>
            </label>
          </div>

          <div class="field-grid">
            <label class="field">
              <span class="field-label"><AppIcon name="database" :size="15" /> Currency</span>
              <input v-model="form.currency" type="text" class="input" maxlength="3" placeholder="usd" />
            </label>

            <label class="field">
              <span class="field-label"><AppIcon name="shield" :size="15" /> Webhook signing secret</span>
              <input
                v-model="form.webhookSecret"
                type="password"
                class="input"
                autocomplete="new-password"
                spellcheck="false"
                :placeholder="stored.hasWebhookSecret ? `Stored ${stored.webhookSecretHint} — leave blank to keep` : 'whsec_…'"
              />
            </label>
          </div>

          <div class="field-grid">
            <label class="field">
              <span class="field-label"><AppIcon name="check" :size="15" /> Success URL</span>
              <input v-model="form.successUrl" type="url" class="input" placeholder="https://www.generativ.cc/checkout/success" />
            </label>

            <label class="field">
              <span class="field-label"><AppIcon name="close" :size="15" /> Cancel URL</span>
              <input v-model="form.cancelUrl" type="url" class="input" placeholder="https://www.generativ.cc/checkout/cancel" />
            </label>
          </div>

          <div class="webhook-note">
            <div>
              <strong>Webhook endpoint</strong>
              <p>
                Add this URL in Stripe under Developers → Webhooks, subscribed to
                <code>checkout.session.completed</code>, then paste the signing secret above.
                Without it, orders stay as “created” after a successful payment.
              </p>
              <code class="url">{{ webhookUrl }}</code>
            </div>
            <button type="button" class="ghost-button small" @click="copyWebhookUrl">
              <AppIcon name="document" :size="15" />
              <span>Copy</span>
            </button>
          </div>
        </form>

        <section class="panel">
          <div class="panel-head">
            <h2>Orders</h2>
            <span class="total" v-if="paidTotal">{{ formatAmount(paidTotal, stored.currency) }} collected</span>
          </div>

          <p v-if="!orders.length" class="empty">
            No orders yet. One appears here as soon as a checkout is started, and turns to “paid”
            when Stripe confirms it through the webhook.
          </p>

          <div v-else class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Customer</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in orders" :key="order.id">
                  <td>{{ order.serviceTitle }}</td>
                  <td>{{ order.mode === 'subscription' ? 'Subscription' : 'One-time' }}</td>
                  <td>{{ formatAmount(order.amount, order.currency) }}</td>
                  <td><span class="status" :class="order.status">{{ order.status }}</span></td>
                  <td>{{ order.customerEmail || '—' }}</td>
                  <td>{{ formatDate(order.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: grid;
  grid-template-columns: auto 1fr;
  min-height: 100vh;
  background-color: var(--gray-100);
}

.admin-content {
  padding: var(--spacing-lg);
  min-width: 0;
}

.state-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-3xl);
  background-color: #ffffff;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-lg);
  color: var(--gray-600);
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--gray-200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.banner {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-md);
  color: #ffffff;
}

.banner p { margin: 0; }
.banner.danger { background-color: var(--danger); }
.banner.warn { background-color: var(--warning); color: var(--gray-900); align-items: flex-start; }
.banner.warn p { margin: 0 0 4px; }
.banner.warn p:last-child { margin: 0; font-size: 0.9375rem; }
.banner.success { background-color: var(--success); }

.panel {
  background-color: #ffffff;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  max-width: 980px;
  margin-bottom: var(--spacing-lg);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.panel-head h2 {
  margin: 0;
  font-size: 1.125rem;
  color: var(--gray-900);
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.mode-chip {
  padding: 5px 11px;
  border-radius: var(--border-radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  background-color: var(--gray-200);
  color: var(--gray-700);
}

.mode-chip.live {
  background-color: var(--success);
  color: #ffffff;
}

.toggle-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-md);
  background-color: var(--gray-50);
}

.toggle-row input {
  margin-top: 3px;
}

.toggle-row strong {
  display: block;
  color: var(--gray-900);
  font-size: 0.9375rem;
}

.toggle-row small {
  color: var(--gray-600);
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--spacing-md);
}

.field {
  display: block;
  margin-bottom: var(--spacing-md);
}

.field-label {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--gray-700);
}

.hint {
  display: block;
  margin-top: 6px;
  color: var(--gray-500);
  font-size: 0.75rem;
  line-height: 1.5;
}

.input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-md);
  background-color: #ffffff;
  color: var(--gray-900);
  font: inherit;
}

.input:focus {
  outline: none;
  border-color: var(--primary);
}

.webhook-note {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: 16px;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-md);
  background-color: var(--gray-50);
}

.webhook-note strong {
  color: var(--gray-900);
  font-size: 0.9375rem;
}

.webhook-note p {
  margin: 6px 0 10px;
  color: var(--gray-600);
  font-size: 0.8125rem;
  line-height: 1.6;
}

.webhook-note code {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
}

.webhook-note .url {
  display: inline-block;
  padding: 6px 10px;
  background-color: #ffffff;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-sm);
  color: var(--gray-800);
  word-break: break-all;
}

.total {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--gray-700);
}

.empty {
  margin: 0;
  color: var(--gray-600);
  font-size: 0.9375rem;
  line-height: 1.6;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9375rem;
}

th {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid var(--gray-200);
  color: var(--gray-600);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

td {
  padding: 12px;
  border-bottom: 1px solid var(--gray-100);
  color: var(--gray-800);
}

.status {
  display: inline-block;
  padding: 3px 10px;
  border-radius: var(--border-radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  background-color: var(--gray-200);
  color: var(--gray-700);
  text-transform: capitalize;
}

.status.paid {
  background-color: var(--success);
  color: #ffffff;
}

.status.failed,
.status.canceled {
  background-color: var(--danger);
  color: #ffffff;
}

.primary-button,
.ghost-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  border-radius: var(--border-radius-md);
  border: 1px solid transparent;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
}

.primary-button {
  background-color: var(--primary);
  color: #ffffff;
}

.primary-button:hover:not(:disabled) {
  background-color: var(--primary-dark);
}

.primary-button:disabled {
  opacity: 0.65;
  cursor: default;
}

.ghost-button {
  background-color: #ffffff;
  border-color: var(--gray-300);
  color: var(--gray-700);
}

.ghost-button:hover {
  background-color: var(--gray-100);
  color: var(--gray-900);
}

.ghost-button.small {
  padding: 6px 12px;
  font-size: 0.8125rem;
}

@media (max-width: 992px) {
  .admin-content {
    padding: var(--spacing-md);
  }

  .webhook-note {
    flex-direction: column;
  }
}
</style>
