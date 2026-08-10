<script setup>
/**
 * Admin overview.
 *
 * Organised around the public site: one card per page that visitors can reach,
 * each pointing at the one place that page's content is edited. The previous
 * version showed a permanently empty "Recent Activity" table (there is no
 * audit-log read operation in the API), a "contactSubmissions: 0" stat that was
 * never implemented, and Create Content / View Website / View All buttons with
 * no handlers. None of that is here.
 */
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminSidebar from './components/AdminSidebar.vue';
import AdminHeader from './components/AdminHeader.vue';
import AppIcon from '../../shared/AppIcon.vue';
import { cmsAPI } from '../../../api/client';

const router = useRouter();
const loading = ref(true);
const error = ref(null);

const pages = ref([]);
const services = ref([]);
const team = ref([]);
const posts = ref([]);
const mediaCount = ref(null);
const settings = ref(null);

// One entry per page a visitor can reach, and where its content is managed.
const sitePages = computed(() => [
  {
    name: 'Home',
    url: '/',
    admin: '/admin/pages/home',
    icon: 'home',
    detail: sectionCount('home')
  },
  {
    name: 'About',
    url: '/about',
    admin: '/admin/pages/about',
    icon: 'document',
    detail: sectionCount('about')
  },
  {
    name: 'Services',
    url: '/services',
    admin: '/admin/services',
    icon: 'wrench',
    detail: `${services.value.length} ${services.value.length === 1 ? 'service' : 'services'}`
  },
  {
    name: 'Team',
    url: '/team',
    admin: '/admin/team',
    icon: 'users',
    detail: `${team.value.length} ${team.value.length === 1 ? 'member' : 'members'}`
  },
  {
    name: 'Writing',
    url: '/blog',
    admin: '/admin/blog',
    icon: 'book',
    detail: `${publishedPosts.value} published, ${posts.value.length - publishedPosts.value} draft`
  },
  {
    name: 'Resources',
    url: '/resources',
    admin: '/admin/resources',
    icon: 'folder',
    detail: 'Reports and downloads'
  },
  {
    name: 'Contact',
    url: '/contact',
    admin: '/admin/contact',
    icon: 'mail',
    detail: settings.value?.contactEmail || 'No contact email set'
  }
]);

const publishedPosts = computed(() => posts.value.filter(p => p.isPublished).length);

const stats = computed(() => [
  { label: 'Page records', value: pages.value.length, to: '/admin/pages', icon: 'layers' },
  { label: 'Services', value: services.value.length, to: '/admin/services', icon: 'wrench' },
  { label: 'Team members', value: team.value.length, to: '/admin/team', icon: 'users' },
  { label: 'Posts', value: posts.value.length, to: '/admin/blog', icon: 'book' },
  {
    label: 'Media items',
    value: mediaCount.value === null ? '—' : mediaCount.value,
    to: '/admin/media',
    icon: 'image'
  }
]);

// Several page records share a slug in the live database. getPageBySlug picks
// one of them (published first, then most recently updated) and the public site
// only ever shows that one — so editing any other record silently does nothing.
// Surface it rather than let an editor lose an afternoon to it.
const duplicateSlugs = computed(() => {
  const bySlug = new Map();
  for (const page of pages.value) {
    if (!bySlug.has(page.slug)) bySlug.set(page.slug, []);
    bySlug.get(page.slug).push(page);
  }
  return [...bySlug.entries()]
    .filter(([, records]) => records.length > 1)
    .map(([slug, records]) => ({ slug, count: records.length }));
});

const contactFields = computed(() => [
  { label: 'Email', value: settings.value?.contactEmail, icon: 'mail' },
  { label: 'Phone', value: settings.value?.contactPhone, icon: 'phone' },
  { label: 'Address', value: settings.value?.address || settings.value?.contactAddress, icon: 'pin' },
  { label: 'Hours', value: settings.value?.contactHours, icon: 'clock' }
]);

function sectionCount(slug) {
  const page = pages.value.find(p => p.slug === slug);
  if (!page) return 'No page record';
  const count = page.sections?.length || 0;
  return `${count} ${count === 1 ? 'section' : 'sections'}`;
}

async function loadDashboardData() {
  try {
    loading.value = true;
    error.value = null;

    const [pagesRes, servicesRes, teamRes, postsRes, settingsRes] = await Promise.all([
      cmsAPI.getPages(),
      cmsAPI.getServices(),
      cmsAPI.getTeamMembers(),
      cmsAPI.getBlogPosts(),
      cmsAPI.getSiteSettings()
    ]);

    pages.value = pagesRes.success ? pagesRes.pages || [] : [];
    services.value = servicesRes.success ? servicesRes.services || [] : [];
    team.value = teamRes.success ? teamRes.members || [] : [];
    posts.value = postsRes.success ? postsRes.posts || [] : [];
    settings.value = settingsRes.success ? settingsRes.settings || null : null;

    // Media needs a valid token; a signed-out or expired session shows "—"
    // rather than a wrong zero.
    try {
      const mediaRes = await cmsAPI.getAllMedia();
      mediaCount.value = mediaRes.success ? (mediaRes.media || []).length : null;
    } catch {
      mediaCount.value = null;
    }
  } catch (err) {
    console.error('Error loading dashboard data:', err);
    error.value = 'Failed to load dashboard data';
  } finally {
    loading.value = false;
  }
}

function checkAuth() {
  if (!localStorage.getItem('authToken')) {
    router.push('/admin/login');
  }
}

onMounted(() => {
  checkAuth();
  loadDashboardData();
});
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar />

    <div class="admin-content">
      <AdminHeader title="Dashboard" subtitle="Every page on the site, and where its content lives." />

      <div v-if="loading" class="state-panel">
        <div class="spinner"></div>
        <p>Loading dashboard…</p>
      </div>

      <div v-else-if="error" class="state-panel error">
        <AppIcon name="alert" :size="28" />
        <p>{{ error }}</p>
        <button class="primary-button" @click="loadDashboardData">Try again</button>
      </div>

      <div v-else class="dashboard">
        <!-- Duplicate page records -->
        <div v-if="duplicateSlugs.length" class="notice">
          <AppIcon name="alert" :size="20" />
          <div>
            <p class="notice-title">Duplicate page records</p>
            <p class="notice-body">
              <template v-for="(dupe, index) in duplicateSlugs" :key="dupe.slug">
                <span v-if="index"> · </span>
                <code>{{ dupe.slug }}</code> has {{ dupe.count }} records
              </template>.
              The site shows the published record updated most recently; edits to the others have no
              visible effect. Review them under
              <router-link to="/admin/pages">page records</router-link>.
            </p>
          </div>
        </div>

        <!-- Counts -->
        <section class="section">
          <h2>At a glance</h2>
          <div class="stats-grid">
            <router-link v-for="stat in stats" :key="stat.label" :to="stat.to" class="stat-card">
              <span class="stat-icon"><AppIcon :name="stat.icon" :size="20" /></span>
              <span class="stat-value">{{ stat.value }}</span>
              <span class="stat-label">{{ stat.label }}</span>
            </router-link>
          </div>
        </section>

        <!-- One card per public page -->
        <section class="section">
          <h2>Site pages</h2>
          <p class="section-note">Each page on the public site, with the section that manages it.</p>

          <div class="pages-grid">
            <div v-for="page in sitePages" :key="page.name" class="page-card">
              <div class="page-card-head">
                <span class="page-icon"><AppIcon :name="page.icon" :size="20" /></span>
                <h3>{{ page.name }}</h3>
              </div>
              <p class="page-detail">{{ page.detail }}</p>
              <div class="page-actions">
                <router-link :to="page.admin" class="primary-button small">
                  <AppIcon name="pencil" :size="15" />
                  <span>Manage</span>
                </router-link>
                <a :href="page.url" target="_blank" rel="noopener" class="ghost-button small">
                  <AppIcon name="external" :size="15" />
                  <span>View</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- Contact details -->
        <section class="section">
          <div class="section-head">
            <h2>Contact details</h2>
            <router-link to="/admin/contact" class="ghost-button small">
              <AppIcon name="pencil" :size="15" />
              <span>Edit</span>
            </router-link>
          </div>
          <p class="section-note">Shown on the contact page and in the site footer.</p>

          <div class="contact-grid">
            <div v-for="field in contactFields" :key="field.label" class="contact-card">
              <span class="contact-icon"><AppIcon :name="field.icon" :size="18" /></span>
              <div>
                <p class="contact-label">{{ field.label }}</p>
                <p v-if="field.value" class="contact-value">{{ field.value }}</p>
                <p v-else class="contact-value empty">Not set</p>
              </div>
            </div>
          </div>
        </section>
      </div>
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

/* States */
.state-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-3xl) var(--spacing-lg);
  background-color: #ffffff;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-lg);
  color: var(--gray-600);
}

.state-panel.error {
  color: var(--danger);
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--gray-200);
  border-top-color: var(--primary);
  border-radius: var(--border-radius-full);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Layout */
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

.section h2 {
  margin: 0 0 var(--spacing-xs);
  font-size: 1.25rem;
  color: var(--gray-900);
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.section-note {
  margin: 0 0 var(--spacing-md);
  color: var(--gray-600);
  font-size: 0.875rem;
}

/* Notice — solid amber surface, white text (never dark text on colour). */
.notice {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--warning);
  color: #ffffff;
  border-radius: var(--border-radius-lg);
}

.notice-title {
  margin: 0 0 4px;
  font-weight: 600;
}

.notice-body {
  margin: 0;
  font-size: 0.875rem;
}

.notice-body code {
  font-family: var(--font-mono);
  background-color: rgba(255, 255, 255, 0.22);
  padding: 1px 6px;
  border-radius: var(--border-radius-sm);
}

.notice-body a {
  color: #ffffff;
  text-decoration: underline;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--spacing-md);
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--spacing-lg);
  background-color: #ffffff;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-lg);
  text-decoration: none;
  transition: border-color var(--transition-fast), transform var(--transition-fast);
}

.stat-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.stat-icon {
  color: var(--primary);
  margin-bottom: var(--spacing-sm);
}

.stat-value {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--gray-900);
  line-height: 1.1;
}

.stat-label {
  font-size: 0.8125rem;
  color: var(--gray-600);
}

/* Site pages */
.pages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--spacing-md);
}

.page-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background-color: #ffffff;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-lg);
}

.page-card-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-icon {
  display: flex;
  color: var(--primary);
}

.page-card h3 {
  margin: 0;
  font-size: 1.0625rem;
  color: var(--gray-900);
}

.page-detail {
  margin: 0;
  flex: 1;
  font-size: 0.875rem;
  color: var(--gray-600);
  overflow-wrap: anywhere;
}

.page-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

/* Contact */
.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--spacing-md);
}

.contact-card {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: #ffffff;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-lg);
}

.contact-icon {
  color: var(--primary);
  flex-shrink: 0;
}

.contact-label {
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gray-500);
}

.contact-value {
  margin: 2px 0 0;
  color: var(--gray-800);
  overflow-wrap: anywhere;
}

.contact-value.empty {
  color: var(--gray-400);
  font-style: italic;
}

/* Buttons */
.primary-button,
.ghost-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  border-radius: var(--border-radius-md);
  font-size: 0.9375rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid transparent;
}

.primary-button {
  background-color: var(--primary);
  color: #ffffff;
}

.primary-button:hover {
  background-color: var(--primary-dark);
  color: #ffffff;
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

.primary-button.small,
.ghost-button.small {
  padding: 6px 12px;
  font-size: 0.8125rem;
}

@media (max-width: 992px) {
  .admin-content {
    padding: var(--spacing-md);
  }
}
</style>
