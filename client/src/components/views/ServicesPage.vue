<script setup>
import { ref, onMounted } from 'vue';
import { cmsAPI } from '../../api/client';
import AppIcon from '../shared/AppIcon.vue';
import { iconFor } from '../../config/icons';
import { formatPrice } from '../../config/pricing';

const loading = ref(true);
const error = ref(null);
const services = ref([]);

// Fetch services data
async function fetchServicesData() {
  try {
    loading.value = true;
    error.value = null;

    const response = await cmsAPI.getServices();
    if (response.success) {
      services.value = [...(response.services || [])]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    } else {
      console.error('Failed to load services:', response.error);
      error.value = 'Failed to load services';
      services.value = [];
    }

    loading.value = false;
  } catch (err) {
    console.error('Error fetching services:', err);
    error.value = 'Failed to load services';
    loading.value = false;
  }
}

onMounted(() => {
  fetchServicesData();
});
</script>

<template>
  <div class="services-page">
    <!-- Hero Section -->
    <section class="page-hero">
      <div class="container">
        <h1>Services</h1>
        <p class="hero-description">
          Engagements begin with an operational review and continue into implementation
          where the review identifies work worth automating.
        </p>
      </div>
    </section>

    <!-- Services Content -->
    <section class="services-content">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading services...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="fetchServicesData" class="secondary-button">Try Again</button>
        </div>

        <!-- Services List -->
        <div v-else class="services-grid">
          <div
            v-for="service in services"
            :key="service.id"
            class="service-card"
          >
            <div class="service-icon">
              <AppIcon :name="iconFor(service.title)" :size="26" />
            </div>
            <h2>{{ service.title }}</h2>
            <p class="service-price" v-if="formatPrice(service.pricingDetail)">
              {{ formatPrice(service.pricingDetail) }}
            </p>
            <p class="service-price quoted" v-else>Quoted</p>
            <p class="service-description">{{ service.shortDescription }}</p>

            <div class="service-benefits" v-if="service.benefits && service.benefits.length">
              <h3>Key Benefits</h3>
              <ul>
                <li v-for="(benefit, index) in service.benefits" :key="index">
                  <AppIcon name="check" :size="16" class="benefit-check" />
                  <span>{{ benefit }}</span>
                </li>
              </ul>
            </div>

            <router-link :to="`/services/${service.slug}`" class="primary-button">
              Learn More
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Approach Section -->
    <section class="approach-section">
      <div class="container">
        <div class="approach-content">
          <h2>How the review runs</h2>
          <p>
            Two days, on-site, from tool inventory through to the written report.
            The owner-operator is present on the first morning.
          </p>

          <div class="process-steps">
            <div class="process-step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>Day 1 — Discovery and analysis</h3>
                <p>
                  Workflow walks and tool inventory with the owner-operator present, then
                  bottleneck scoring and review of the internal logic each process depends on.
                </p>
              </div>
            </div>

            <div class="process-step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h3>Day 2 — Sizing, roadmap and delivery</h3>
                <p>
                  Opportunity sizing against stated labor and time assumptions, the 90-day
                  roadmap, and written delivery of the readiness assessment and the three
                  bottlenecks before we leave.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <h2>Inquiries</h2>
        <p>Scoping starts with a short conversation about how the practice currently runs.</p>
        <div class="cta-buttons">
          <router-link to="/contact" class="primary-button">Contact</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.services-page { min-height: 60vh; }

.services-content { padding: clamp(56px, 7vw, 92px) 0; }

/* auto-fit, not auto-fill: ten services across three declared tracks leaves
   two empty tracks on the last row, and an empty track still draws its gutter. */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.service-card {
  background: var(--g-ink-2);
  border: 1px solid var(--g-line);
  border-radius: var(--g-r);
  padding: 28px;
  display: flex;
  flex-direction: column;
  transition: border-color 180ms ease, background-color 180ms ease;
}

.service-card:hover {
  border-color: var(--g-volt-line);
  background: var(--g-ink-3);
}

.service-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--g-line-2);
  border-radius: var(--g-r);
  color: var(--g-volt);
  margin-bottom: 20px;
}

.service-card h2 {
  font-size: 1.25rem;
  letter-spacing: -0.025em;
  margin: 0 0 10px;
}

.service-price {
  font-family: var(--g-mono);
  font-size: 0.8125rem;
  letter-spacing: 0.04em;
  color: var(--g-volt);
  margin: 0 0 16px;
  font-variant-numeric: tabular-nums;
}

.service-price.quoted { color: var(--g-text-faint); }

.service-description {
  font-size: 0.9375rem;
  line-height: 1.65;
  margin: 0 0 22px;
}

.service-benefits {
  border-top: 1px solid var(--g-line);
  padding-top: 18px;
  margin-bottom: 24px;
}

.service-benefits h3 {
  font-family: var(--g-mono);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--g-text-faint);
  margin: 0 0 14px;
}

.service-benefits ul { list-style: none; margin: 0; padding: 0; }

.service-benefits li {
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 10px;
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--g-text-dim);
  margin-bottom: 10px;
}

.benefit-check { color: var(--g-volt); margin-top: 2px; }

/* Pushed to the card foot so every button in the row sits on one line, whatever
   the benefit lists do to the cards above them. */
.service-card .primary-button { margin-top: auto; align-self: flex-start; }

/* --- Approach ----------------------------------------------------------- */

.approach-section {
  padding: clamp(56px, 7vw, 92px) 0;
  border-top: 1px solid var(--g-line);
}

.approach-content h2 {
  font-size: var(--g-h2);
  line-height: 1.06;
  margin: 0 0 16px;
}

.approach-content > p {
  font-size: 1.0625rem;
  line-height: 1.7;
  max-width: 62ch;
  margin: 0 0 44px;
}

.process-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1px;
  background: var(--g-line);
  border: 1px solid var(--g-line);
  border-radius: var(--g-r);
  overflow: hidden;
}

.process-step {
  background: var(--g-ink);
  padding: 28px 26px;
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 18px;
}

.step-number {
  font-family: var(--g-mono);
  font-size: 1.25rem;
  color: var(--g-volt);
}

.step-content h3 { font-size: 1.0625rem; margin: 0 0 8px; }

.step-content p { font-size: 0.9375rem; line-height: 1.65; margin: 0; }
</style>
