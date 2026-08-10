<script setup>
import { computed } from 'vue';
import AppIcon from '../shared/AppIcon.vue';
import BrandGraphic from '../shared/BrandGraphic.vue';
import { REPORTS, reportsByCategory, downloadReport } from '../../config/reports';

// Reports are code-owned documents, versioned with the site.
const groups = computed(() => [
  {
    key: 'reports',
    title: 'Benchmarks',
    description:
      'Published figures behind the operational review, with the arithmetic that turns each one into an annual number.',
    items: reportsByCategory('reports')
  },
  {
    key: 'playbooks',
    title: 'Checklists',
    description:
      'The tests applied before an implementation is scoped, written so a practice can run them without us.',
    items: reportsByCategory('playbooks')
  },
  {
    key: 'caseStudies',
    title: 'Field Notes',
    description:
      'What goes wrong in automation programmes, and the checks that surface each failure mode early.',
    items: reportsByCategory('caseStudies')
  }
].filter((group) => group.items.length));

const total = computed(() => REPORTS.length);
</script>


<template>
  <div class="resources-page">
    <!-- Hero -->
    <section class="page-hero">
      <div class="container">
        <div class="hero-text">
          <h1>Resources</h1>
          <p class="hero-description">
            {{ total }} documents behind the operational review: the benchmarks it costs against,
            the checks it applies, and what those checks catch. Each one reads in full here and
            downloads as a standalone file.
          </p>
        </div>
        <div class="hero-graphic">
          <BrandGraphic name="report" />
        </div>
      </div>
    </section>

    <!-- Groups -->
    <section
      v-for="(group, index) in groups"
      :key="group.key"
      class="resources-section"
      :class="{ 'alt-bg': index % 2 === 1 }"
    >
      <div class="container">
        <div class="section-header">
          <h2>{{ group.title }}</h2>
          <p class="section-description">{{ group.description }}</p>
        </div>

        <div class="resources-grid">
          <article v-for="report in group.items" :key="report.slug" class="resource-card">
            <div class="resource-head">
              <div class="resource-icon">
                <AppIcon :name="report.icon" :size="22" />
              </div>
              <div class="resource-type">{{ report.type }}</div>
            </div>

            <h3>{{ report.title }}</h3>
            <p class="resource-description">{{ report.summary }}</p>

            <div class="resource-meta">
              <span class="resource-date">{{ report.date }}</span>
              <span class="resource-reading">{{ report.readingTime }} read</span>
            </div>

            <div class="resource-actions">
              <router-link :to="`/resources/${report.slug}`" class="resource-read">
                <span>Read</span>
                <AppIcon name="arrowRight" :size="16" />
              </router-link>
              <button type="button" class="resource-download" @click="downloadReport(report)">
                <AppIcon name="download" :size="16" />
                <span>Download</span>
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Request Section -->
    <section class="request-section">
      <div class="container">
        <h2>Need something specific?</h2>
        <p>
          Where a document does not cover the process in question, the review produces one that does.
        </p>
        <router-link to="/contact" class="primary-button">Contact</router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.resources-page {
  min-height: calc(100vh - 80px - 300px);
}

/* Hero Section */
.page-hero {
  padding: 80px 0;
  background-color: var(--light-blue);
}

.page-hero .container {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: 48px;
  align-items: center;
}

.hero-graphic {
  display: flex;
  justify-content: flex-end;
}

.page-hero h1 {
  font-size: 3rem;
  color: var(--dark-blue);
  margin-bottom: 1rem;
}

.hero-description {
  max-width: 700px;
  font-size: 1.2rem;
  color: var(--light-text);
}

/* Resources Sections */
.resources-section {
  padding: 80px 0;
}

.resources-section.alt-bg {
  background-color: var(--light-blue);
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-header h2 {
  font-size: 2rem;
  color: var(--dark-blue);
  margin-bottom: 15px;
}

.section-description {
  max-width: 700px;
  margin: 0 auto;
  font-size: 1.1rem;
  color: var(--light-text);
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.resource-card {
  display: flex;
  flex-direction: column;
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 30px;
  transition: transform 0.3s;
}

.resource-card:hover {
  transform: translateY(-5px);
}

.resource-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.resource-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius);
  background-color: var(--light-blue);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.resource-type {
  display: inline-block;
  background-color: var(--primary-color);
  color: var(--white);
  font-size: 0.8rem;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 15px;
}

.resource-card h3 {
  font-size: 1.4rem;
  color: var(--dark-blue);
  margin-bottom: 15px;
  line-height: 1.3;
}

.resource-description {
  color: var(--light-text);
  margin-bottom: 20px;
  line-height: 1.6;
  flex-grow: 1;
}

.resource-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--light-text);
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.resource-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.resource-read {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--primary-color);
  font-weight: 500;
}

.resource-read:hover {
  text-decoration: underline;
}

.resource-download {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--border-radius);
  padding: 9px 16px;
  font-size: 0.95rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
}

.resource-download:hover {
  background-color: #3a5ad9;
}

/* Request Section */
.request-section {
  padding: 60px 0;
  background-color: var(--dark-blue);
  color: var(--white);
  text-align: center;
}

.request-section h2 {
  color: inherit;
  font-size: 2rem;
  margin-bottom: 15px;
}

.request-section p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.primary-button {
  background-color: var(--primary-color);
  color: var(--white);
  padding: 12px 24px;
  border-radius: var(--border-radius);
  font-weight: 500;
  display: inline-block;
}

.primary-button:hover {
  background-color: #3a5ad9;
  color: var(--white);
}

/* Responsive */
@media (max-width: 900px) {
  .page-hero .container {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-graphic {
    justify-content: center;
  }

  .hero-description {
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .page-hero h1,
  .request-section h2 {
    font-size: 2.5rem;
  }
  
  .section-header h2 {
    font-size: 1.8rem;
  }
}
</style>
