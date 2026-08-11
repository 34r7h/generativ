<script setup>
/**
 * Where Stripe returns the customer (/checkout/success, /checkout/cancel).
 *
 * This page reports what the customer did, not what was paid: the authority on
 * payment is the webhook, which Stripe calls server-to-server. A success URL
 * can be opened by anyone who guesses it, so nothing here is treated as proof
 * and nothing here writes to an order.
 */
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppIcon from '../shared/AppIcon.vue';

const route = useRoute();
const outcome = computed(() => (route.path.includes('cancel') ? 'cancel' : 'success'));
const sessionId = computed(() => route.query.session_id || '');
</script>

<template>
  <div class="checkout-page">
    <section class="checkout-panel">
      <div class="container">
        <div class="panel-inner">
          <div class="mark" :class="outcome">
            <AppIcon :name="outcome === 'success' ? 'check' : 'arrowLeft'" :size="30" />
          </div>

          <template v-if="outcome === 'success'">
            <h1>Payment received</h1>
            <p>
              Stripe has taken the payment and emailed you a receipt. We are notified at the same
              time and will be in touch within one business day to schedule the work.
            </p>
            <p v-if="sessionId" class="reference">
              Reference <code>{{ sessionId }}</code>
            </p>
          </template>

          <template v-else>
            <h1>Checkout cancelled</h1>
            <p>
              Nothing was charged. You can pick the engagement up again from the service page, or
              write to us if it would be easier to scope it in a conversation first.
            </p>
          </template>

          <div class="actions">
            <router-link to="/services" class="primary-button">Back to services</router-link>
            <router-link to="/contact" class="secondary-button">Contact us</router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.checkout-page {
  min-height: calc(100vh - 80px - 300px);
}

.checkout-panel {
  padding: 90px 0;
  background-color: var(--g-ink-2);
}

.panel-inner {
  max-width: 640px;
  margin: 0 auto;
  background-color: var(--g-ink-2);
  border: 1px solid var(--g-line);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 48px;
}

.mark {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: var(--white);
}

.mark.success { background-color: var(--success, #10b981); }
.mark.cancel { background-color: var(--light-text); }

h1 {
  font-size: 2rem;
  color: var(--dark-blue);
  margin-bottom: 16px;
}

p {
  color: var(--text-color);
  line-height: 1.7;
  margin-bottom: 16px;
}

.reference {
  color: var(--light-text);
  font-size: 0.9rem;
  word-break: break-all;
}

.reference code {
  font-family: var(--font-mono, monospace);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 28px;
}

@media (max-width: 640px) {
  .panel-inner {
    padding: 32px 24px;
  }
}
</style>
