<script setup>
import { ref, onMounted } from 'vue';
import { cmsAPI } from '../../api/client';

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
      services.value = response.services || [];
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
        <h1>One Way In. Two Ways Forward.</h1>
        <p class="hero-description">
          Every engagement starts with the $500 AI Opportunity Audit: five business days,
          your top three operational leaks quantified in writing, and a full refund if we
          cannot find at least $5,000 in annual savings.
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
            <div class="service-icon" v-if="service.icon">{{ service.icon }}</div>
            <h2>{{ service.title }}</h2>
            <p class="service-description">{{ service.shortDescription }}</p>

            <div class="service-benefits" v-if="service.benefits && service.benefits.length">
              <h3>Key Benefits</h3>
              <ul>
                <li v-for="(benefit, index) in service.benefits" :key="index">
                  {{ benefit }}
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
          <h2>The 5-Day Precision Delivery Schedule</h2>
          <p>
            An owner-operator cannot disappear into a discovery phase. The audit goes from
            tool inventory to ROI sizing in a single business week, on-site, with you present.
          </p>

          <div class="process-steps">
            <div class="process-step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>Discovery</h3>
                <p>Workflow walks and tool inventory, on-site. We watch the work actually move rather than reading a diagram of it.</p>
              </div>
            </div>

            <div class="process-step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h3>Analysis</h3>
                <p>Bottleneck scoring and internal logic review — where does a task stop and wait for a human who is already busy?</p>
              </div>
            </div>

            <div class="process-step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h3>Sizing</h3>
                <p>ROI opportunity sizing and cost projections, using standard labor and time assumptions you can verify yourself.</p>
              </div>
            </div>

            <div class="process-step">
              <div class="step-number">4</div>
              <div class="step-content">
                <h3>Strategy</h3>
                <p>Drafting the 90-day roadmap: what ships first, what it plugs into, and what it is measured against.</p>
              </div>
            </div>

            <div class="process-step">
              <div class="step-number">5</div>
              <div class="step-content">
                <h3>Delivery</h3>
                <p>Your Readiness Score, the top three bottlenecks, and the roadmap — in writing, with the math shown.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <h2>Identify Your $5,000 in Savings</h2>
        <p>
          Thirty-minute discovery session, then the five-day schedule. Flat $500 — credited
          in full toward your build, or refunded if the numbers are not there.
        </p>
        <div class="cta-buttons">
          <router-link to="/contact" class="primary-button">Book the $500 Audit</router-link>
          <router-link to="/blog" class="secondary-button">Read the Leak Diagnostics</router-link>
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
  text-align: center;
}

.page-hero h1 {
  font-size: 3rem;
  color: var(--dark-blue);
  margin-bottom: 1rem;
}

.hero-description {
  max-width: 700px;
  margin: 0 auto;
  font-size: 1.2rem;
  color: var(--light-text);
}

/* Services Content */
.services-content {
  padding: 80px 0;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
  font-size: 3rem;
  margin-bottom: 20px;
}

.service-card h2 {
  font-size: 1.5rem;
  color: var(--dark-blue);
  margin-bottom: 15px;
}

.service-description {
  color: var(--light-text);
  margin-bottom: 20px;
  flex-grow: 1;
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
  padding-left: 25px;
  position: relative;
  margin-bottom: 8px;
  color: var(--light-text);
}

.service-benefits li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: var(--primary-color);
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
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
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
</style>
