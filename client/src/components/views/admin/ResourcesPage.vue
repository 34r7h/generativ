<script setup>
/**
 * Resources (/admin/resources).
 *
 * Read-only on purpose. The documents on /resources are code-owned: they live
 * in client/src/config/reports.js, are versioned with the site, render in full
 * at /resources/:slug, and download as a self-contained HTML file built from
 * that same content — so a reader downloads exactly what they were reading.
 *
 * This page used to present a full create/edit/delete UI backed by
 * `getAllResources`, `createResource`, `updateResource` and `deleteResource`.
 * Those operations are declared in the CMSOperation union but have no case in
 * the server's switch, so every one of them fell through to the unknown-
 * operation branch and returned 400 — which is why this screen opened with
 * "Error loading resources" in the console on every visit.
 *
 * Implementing those five operations would have been the larger mistake: the
 * public page does not read the CMS for resources, so the admin would have been
 * editing records nothing renders. Showing what is actually published, and
 * where to change it, is the honest version.
 */
import { computed } from 'vue';
import AdminSidebar from './components/AdminSidebar.vue';
import AdminHeader from './components/AdminHeader.vue';
import AppIcon from '../../shared/AppIcon.vue';
import { REPORTS } from '../../../config/reports';

const reports = computed(() =>
  REPORTS.map((report) => ({
    slug: report.slug,
    title: report.title,
    type: report.type,
    date: report.date,
    readingTime: report.readingTime,
    summary: report.summary,
    figures: (report.figures || []).length,
    sections: (report.sections || []).length
  }))
);
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar />

    <div class="admin-content">
      <AdminHeader
        title="Resources"
        subtitle="The documents published on /resources."
      />

      <div class="banner info">
        <AppIcon name="document" :size="20" />
        <p>
          These are versioned with the site rather than stored in the CMS, so they cannot be
          edited here. To change one, edit
          <code>client/src/config/reports.js</code> and deploy. Each document renders in full at
          its own page and downloads as a self-contained file built from the same content.
        </p>
      </div>

      <section class="panel">
        <div class="panel-head">
          <h2>Published documents <span class="count">{{ reports.length }}</span></h2>
          <a href="/resources" target="_blank" rel="noopener" class="ghost-button small">
            <AppIcon name="external" :size="15" />
            <span>View</span>
          </a>
        </div>

        <ul class="report-list">
          <li v-for="report in reports" :key="report.slug" class="report">
            <div class="report-head">
              <div>
                <strong>{{ report.title }}</strong>
                <span class="meta">
                  {{ report.type }} · {{ report.date }} · {{ report.readingTime }} read ·
                  {{ report.sections }} sections<template v-if="report.figures">, {{ report.figures }} figures</template>
                </span>
              </div>
              <a
                :href="`/resources/${report.slug}`"
                target="_blank"
                rel="noopener"
                class="ghost-button small"
              >
                <AppIcon name="external" :size="14" />
                <span>Open</span>
              </a>
            </div>
            <p class="summary">{{ report.summary }}</p>
            <code class="slug">/resources/{{ report.slug }}</code>
          </li>
        </ul>
      </section>
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

.banner {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-lg);
}

.banner.info {
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  color: var(--gray-700);
}

.banner p { margin: 0; line-height: 1.6; font-size: 0.9rem; }

.banner code {
  font-family: var(--font-mono);
  font-size: 0.85em;
  background: rgba(0, 0, 0, 0.05);
  padding: 1px 5px;
  border-radius: 3px;
}

.panel {
  background-color: #fff;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: var(--spacing-md);
}

.panel-head h2 { font-size: 1.1rem; margin: 0; }

.count {
  display: inline-block;
  margin-left: 8px;
  font-size: 0.8rem;
  color: var(--gray-500);
  font-weight: 500;
}

.ghost-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-md);
  background: #fff;
  color: var(--gray-700);
  text-decoration: none;
  cursor: pointer;
}

.ghost-button.small { padding: 6px 10px; font-size: 0.8rem; }

.ghost-button:hover { border-color: var(--gray-400); color: var(--gray-900); }

.report-list { list-style: none; margin: 0; padding: 0; }

.report {
  border-top: 1px solid var(--gray-200);
  padding: 16px 0;
}

.report:first-child { border-top: none; padding-top: 0; }

.report-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.meta {
  display: block;
  font-size: 0.8rem;
  color: var(--gray-500);
  margin-top: 3px;
}

.summary {
  margin: 10px 0 8px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--gray-600);
  max-width: 80ch;
}

.slug {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--gray-500);
}

@media (max-width: 768px) {
  .admin-layout { grid-template-columns: 1fr; }
}
</style>
