<script setup>
import { ref, onMounted } from 'vue';
import { cmsAPI } from '../../api/client';
import AppIcon from '../shared/AppIcon.vue';
import { iconFor } from '../../config/icons';

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
.services-page {
  min-height: calc(100vh - 80px - 300px);
}

/* Hero Section */
.page-hero {
  background-color: var(--light-blue);
  padding: 80px 0;
}

.page-hero h1 {
  font-size: 3rem;
  color: var(--dark-blue);
  margin-bottom: 1rem;
}

.hero-description {
  max-width: 760px;
  margin: 0;
  font-size: 1.2rem;
  color: var(--light-text);
}

/* Services Content */
.services-content {
  padding: 80px 0;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.service-card {
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 30px;
  transition: transform 0.3s;
  display: flex;
  flex-direction: column;
}

.service-card:hover {
  transform: translateY(-5px);
}

.service-icon {
  width: 54px;
  height: 54px;
  border-radius: var(--border-radius);
  background-color: var(--primary-color);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.service-card h2 {
  font-size: 1.5rem;
  color: var(--dark-blue);
  margin-bottom: 15px;
  min-height: 2.4em;
}

.service-description {
  color: var(--light-text);
  margin-bottom: 20px;
  min-height: 8em;
}

.service-benefits {
  margin-top: 20px;
  margin-bottom: 25px;
}


.service-benefits h3 {
  font-size: 1rem;
  color: var(--dark-blue);
  margin-bottom: 10px;
}

.service-benefits ul {
  list-style-type: none;
  padding: 0;
}

.service-benefits li {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-bottom: 8px;
  color: var(--light-text);
}

.benefit-check {
  color: var(--primary-color);
  margin-top: 4px;
}

.primary-button {
  background-color: var(--primary-color);
  color: var(--white);
  padding: 10px 20px;
  border-radius: var(--border-radius);
  font-weight: 500;
  text-align: center;
  display: inline-block;
  align-self: flex-start;
  margin-top: auto;
}

.primary-button:hover {
  background-color: #3a5ad9;
  color: var(--white);
}

/* Approach Section */
.approach-section {
  padding: 80px 0;
  background-color: var(--light-blue);
}

.approach-content {
  max-width: 820px;
  margin: 0;
}

.approach-content h2 {
  font-size: 2.5rem;
  color: var(--dark-blue);
  margin-bottom: 20px;
}

.approach-content > p {
  font-size: 1.1rem;
  color: var(--light-text);
  margin-bottom: 50px;
}

.process-steps {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-top: 40px;
}

.process-step {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  text-align: left;
}

.step-number {
  background-color: var(--primary-color);
  color: var(--white);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.step-content h3 {
  font-size: 1.3rem;
  color: var(--dark-blue);
  margin-bottom: 5px;
}

.step-content p {
  color: var(--light-text);
}

/* CTA Section */
.cta-section {
  padding: 60px 0;
  background-color: var(--dark-blue);
  color: var(--white);
  text-align: center;
}

.cta-section h2 {
  color: inherit;
  font-size: 2rem;
  margin-bottom: 15px;
}

.cta-section p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.secondary-button {
  background-color: transparent;
  border: 1px solid var(--white);
  color: var(--white);
  padding: 10px 20px;
  border-radius: var(--border-radius);
  font-weight: 500;
}

.secondary-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--white);
}

/* Loading and Error States */
.loading-state,
.error-state {
  text-align: center;
  padding: 50px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .cta-buttons {
    flex-direction: column;
    max-width: 300px;
    margin: 0 auto;
    gap: 10px;
  }

  .page-hero h1 {
    font-size: 2.5rem;
  }

  .approach-content h2 {
    font-size: 2rem;
  }
}

.cta-section .primary-button,
.request-section .primary-button {
  background-color: var(--white);
  color: var(--dark-blue);
}

.cta-section .primary-button:hover,
.request-section .primary-button:hover {
  background-color: var(--light-blue);
  color: var(--dark-blue);
}
</style>
