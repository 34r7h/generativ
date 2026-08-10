<script setup>
import { computed, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppIcon from '../shared/AppIcon.vue';
import { REPORTS, findReport, downloadReport } from '../../config/reports';

const route = useRoute();
const router = useRouter();

const slug = computed(() => route.params.slug);
const report = computed(() => findReport(slug.value));
const others = computed(() => REPORTS.filter((item) => item.slug !== slug.value).slice(0, 2));

// Confirms to the reader that the file was produced, since a browser download
// gives no in-page feedback of its own.
const downloaded = ref(false);
let resetTimer = null;

function download() {
  downloadReport(report.value);
  downloaded.value = true;
  clearTimeout(resetTimer);
  resetTimer = setTimeout(() => { downloaded.value = false; }, 4000);
}

function goBack() {
  router.push('/resources');
}

watch(slug, () => {
  downloaded.value = false;
  window.scrollTo({ top: 0 });
});
</script>

<template>
  <div class="resource-page">
    <template v-if="report">
      <!-- Header -->
      <section class="resource-hero">
        <div class="container">
          <div class="resource-hero-text">
          <div class="resource-meta">
            <span class="resource-type">{{ report.type }}</span>
            <span class="resource-date">{{ report.date }}</span>
            <span class="resource-reading">{{ report.readingTime }} read</span>
          </div>
          <h1>{{ report.title }}</h1>
          <p class="resource-summary">{{ report.summary }}</p>

          <div class="hero-actions">
            <button type="button" class="download-button" @click="download">
              <AppIcon name="download" :size="18" />
              <span>Download report</span>
            </button>
            <span v-if="downloaded" class="download-note">
              Saved as {{ report.slug }}.html — opens in any browser, prints to PDF.
            </span>
          </div>
          </div>
        </div>
      </section>

      <!-- Figures -->
      <section class="figures-section" v-if="report.figures && report.figures.length">
        <div class="container">
          <div class="figures-grid">
            <div v-for="figure in report.figures" :key="figure.label" class="figure-card">
              <div class="figure-value">{{ figure.value }}</div>
              <div class="figure-label">{{ figure.label }}</div>
              <div class="figure-source">{{ figure.source }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Body -->
      <section class="resource-body">
        <div class="container">
          <aside class="report-rail">
            <h2>In this report</h2>
            <ol class="rail-list">
              <li v-for="section in report.sections" :key="section.heading">{{ section.heading }}</li>
            </ol>
          </aside>

          <article class="report-content">
            <section v-for="section in report.sections" :key="section.heading">
              <h2>{{ section.heading }}</h2>
              <p v-for="(text, index) in section.paragraphs || []" :key="index">{{ text }}</p>
              <ul v-if="section.list && section.list.length">
                <li v-for="(item, index) in section.list" :key="index">
                  <AppIcon name="check" :size="16" class="list-icon" />
                  <span>{{ item }}</span>
                </li>
              </ul>
            </section>
          </article>

          <div class="body-actions">
            <button type="button" class="download-button" @click="download">
              <AppIcon name="download" :size="18" />
              <span>Download report</span>
            </button>
            <button @click="goBack" class="back-button">
              <AppIcon name="arrowLeft" :size="18" />
              <span>Back to Resources</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Other reports -->
      <section class="other-reports" v-if="others.length">
        <div class="container">
          <h2>Other documents</h2>
          <div class="other-grid">
            <router-link
              v-for="other in others"
              :key="other.slug"
              :to="`/resources/${other.slug}`"
              class="other-card"
            >
              <div class="resource-type">{{ other.type }}</div>
              <h3>{{ other.title }}</h3>
              <p>{{ other.summary }}</p>
            </router-link>
          </div>
        </div>
      </section>
    </template>

    <!-- Not found -->
    <section v-else class="not-found">
      <div class="container">
        <h1>Resource Not Found</h1>
        <p>That document does not exist, or has been withdrawn.</p>
        <button @click="goBack" class="download-button">
          <AppIcon name="arrowLeft" :size="18" />
          <span>Back to Resources</span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.resource-page {
  min-height: calc(100vh - 80px - 300px);
}

/* Header */
.resource-hero {
  padding: 70px 0;
  background-color: var(--light-blue);
}

.resource-hero-text {
  max-width: 820px;
  margin: 0 auto;
}

.resource-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 18px;
  color: var(--light-text);
  font-size: 0.9rem;
}

.resource-type {
  background-color: var(--primary-color);
  color: var(--white);
  font-size: 0.8rem;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: 15px;
}

.resource-hero h1 {
  font-size: 2.6rem;
  color: var(--dark-blue);
  margin-bottom: 18px;
  max-width: 900px;
}

.resource-summary {
  font-size: 1.15rem;
  color: var(--text-color);
  max-width: 820px;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 28px;
}

.download-button {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--border-radius);
  padding: 12px 22px;
  font-size: 1rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
}

.download-button:hover {
  background-color: #3a5ad9;
}

.download-note {
  color: var(--light-text);
  font-size: 0.92rem;
}

/* Figures */
.figures-section {
  padding: 50px 0 10px;
}

.figures-grid {
  max-width: 820px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 24px;
}

.figure-card {
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 26px;
}

.figure-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.figure-label {
  color: var(--text-color);
  line-height: 1.5;
}

.figure-source {
  color: var(--light-text);
  font-size: 0.85rem;
  margin-top: 12px;
}

/* Body */
.resource-body {
  padding: 50px 0 70px;
}

.report-content {
  max-width: 820px;
  margin: 0 auto;
}

.report-rail {
  max-width: 820px;
  margin: 0 auto 44px;
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 22px 26px;
}

.report-rail h2 {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--light-text);
  margin-bottom: 14px;
}

.rail-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 8px 28px;
  margin: 0;
  padding-left: 18px;
  color: var(--text-color);
}

.rail-list li {
  line-height: 1.5;
}

.report-content h2 {
  font-size: 1.5rem;
  color: var(--dark-blue);
  margin: 40px 0 16px;
}

.report-content section:first-child h2 {
  margin-top: 0;
}

.report-content p {
  color: var(--text-color);
  line-height: 1.8;
  margin-bottom: 16px;
}

.report-content ul {
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
}

.report-content li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
  color: var(--text-color);
  line-height: 1.7;
}

.list-icon {
  color: var(--primary-color);
  margin-top: 5px;
}

.body-actions {
  max-width: 820px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 44px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 500;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  padding: 10px 0;
}

.back-button:hover {
  text-decoration: underline;
}

/* Other reports */
.other-reports {
  padding: 60px 0;
  background-color: var(--light-blue);
}

.other-reports h2 {
  max-width: 820px;
  margin: 0 auto 28px;
  font-size: 1.8rem;
  color: var(--dark-blue);
}

.other-grid {
  max-width: 820px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.other-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 26px;
  color: var(--text-color);
  transition: transform 0.3s;
}

.other-card:hover {
  transform: translateY(-5px);
}

.other-card h3 {
  font-size: 1.2rem;
  color: var(--dark-blue);
  margin: 14px 0 10px;
}

.other-card p {
  color: var(--light-text);
  line-height: 1.6;
  font-size: 0.95rem;
}

/* Not found */
.not-found {
  padding: 110px 0;
  text-align: center;
}

.not-found h1 {
  color: var(--dark-blue);
  margin-bottom: 12px;
}

.not-found p {
  color: var(--light-text);
  margin-bottom: 26px;
}

@media (max-width: 768px) {
  .resource-hero h1 {
    font-size: 2.1rem;
  }
}
</style>
