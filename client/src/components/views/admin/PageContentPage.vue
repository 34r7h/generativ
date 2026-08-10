<script setup>
/**
 * Content management for one public page (/admin/pages/:slug).
 *
 * The page record is loaded through getPageBySlug — the same call the public
 * site makes — so what you edit here is by construction the record visitors
 * see. That matters: several slugs have more than one record in the database,
 * and the generic page list happily hands you a shadowed one.
 *
 * Sections carry a `settings` object whose shape varies by section (steps[],
 * verticals[], stats[], ctaPrimary{}, showMembers…). Rather than pretend to a
 * form for every shape, structured settings are edited as JSON with validation
 * on save — honest about what it is, and it cannot silently corrupt the record.
 */
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminSidebar from './components/AdminSidebar.vue';
import AdminHeader from './components/AdminHeader.vue';
import RichTextEditor from './components/RichTextEditor.vue';
import AppIcon from '../../shared/AppIcon.vue';
import { cmsAPI } from '../../../api/client';

const route = useRoute();
const router = useRouter();

const slug = computed(() => route.params.slug);

const loading = ref(true);
const saving = ref(false);
const error = ref(null);
const notice = ref(null);
const page = ref(null);
const duplicateCount = ref(0);
const openSection = ref(null);

// Working copy. Saving writes this back; nothing edits `page` in place, so a
// failed save leaves the loaded record intact.
const form = ref({
  title: '',
  isPublished: true,
  seo: { title: '', description: '', keywords: [] },
  sections: []
});

// Per-section JSON text plus its parse error, keyed by section id.
const settingsText = ref({});
const settingsError = ref({});

const publicUrl = computed(() => (slug.value === 'home' ? '/' : `/${slug.value}`));

const hasSettingsError = computed(() =>
  Object.values(settingsError.value).some(Boolean)
);

function toEditable(record) {
  const sections = [...(record.sections || [])]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map(section => ({ ...section, settings: section.settings || {} }));

  settingsText.value = {};
  settingsError.value = {};
  for (const section of sections) {
    settingsText.value[section.id] = JSON.stringify(section.settings, null, 2);
  }

  return {
    title: record.title || '',
    isPublished: record.isPublished !== false,
    seo: {
      title: record.seo?.title || '',
      description: record.seo?.description || '',
      keywords: [...(record.seo?.keywords || [])]
    },
    sections
  };
}

async function loadPage() {
  try {
    loading.value = true;
    error.value = null;
    notice.value = null;

    const [bySlug, all] = await Promise.all([
      cmsAPI.getPageBySlug(slug.value),
      cmsAPI.getPages()
    ]);

    if (!bySlug.success || !bySlug.page) {
      error.value = `No page record found for "${slug.value}".`;
      page.value = null;
      return;
    }

    page.value = bySlug.page;
    form.value = toEditable(bySlug.page);
    openSection.value = form.value.sections[0]?.id || null;

    duplicateCount.value = all.success
      ? (all.pages || []).filter(p => p.slug === slug.value).length
      : 0;
  } catch (err) {
    console.error('Error loading page:', err);
    error.value = err.message || 'Failed to load page';
  } finally {
    loading.value = false;
  }
}

function parseSettings(section) {
  const raw = settingsText.value[section.id];
  if (raw === undefined || raw.trim() === '') return {};
  return JSON.parse(raw);
}

function validateSettings(section) {
  try {
    const parsed = parseSettings(section);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      settingsError.value[section.id] = 'Settings must be a JSON object.';
    } else {
      settingsError.value[section.id] = null;
    }
  } catch (err) {
    settingsError.value[section.id] = err.message;
  }
}

function move(index, delta) {
  const target = index + delta;
  const sections = form.value.sections;
  if (target < 0 || target >= sections.length) return;
  const [moved] = sections.splice(index, 1);
  sections.splice(target, 0, moved);
}

function toggleSection(id) {
  openSection.value = openSection.value === id ? null : id;
}

function addKeyword() {
  form.value.seo.keywords.push('');
}

function removeKeyword(index) {
  form.value.seo.keywords.splice(index, 1);
}

async function save() {
  for (const section of form.value.sections) validateSettings(section);
  if (hasSettingsError.value) {
    error.value = 'Fix the highlighted settings before saving.';
    return;
  }

  try {
    saving.value = true;
    error.value = null;
    notice.value = null;

    const sections = form.value.sections.map((section, index) => ({
      ...section,
      settings: parseSettings(section),
      sortOrder: index + 1
    }));

    const response = await cmsAPI.updatePage(page.value.id, {
      title: form.value.title,
      isPublished: form.value.isPublished,
      seo: {
        ...form.value.seo,
        keywords: form.value.seo.keywords.filter(k => k.trim())
      },
      sections
    });

    if (!response.success) throw new Error(response.error || 'Failed to save page');

    notice.value = 'Saved. Reload the public page to see the change.';
    await loadPage();
  } catch (err) {
    console.error('Error saving page:', err);
    error.value = err.message || 'Failed to save page';
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  if (!localStorage.getItem('authToken')) {
    router.push('/admin/login');
    return;
  }
  loadPage();
});

// The sidebar links /admin/pages/home and /admin/pages/about at the same
// component, so reload when the slug changes rather than showing stale content.
watch(slug, (value) => {
  if (value) loadPage();
});
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar />

    <div class="admin-content">
      <AdminHeader
        :title="page ? page.title : 'Page content'"
        :subtitle="`Editing the record the site serves at ${publicUrl}`"
      />

      <div v-if="loading" class="state-panel">
        <div class="spinner"></div>
        <p>Loading page…</p>
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

        <div v-if="duplicateCount > 1" class="banner warning">
          <AppIcon name="alert" :size="20" />
          <p>
            {{ duplicateCount }} records share the slug <code>{{ slug }}</code>.
            This editor is on the one the site actually serves; the others are inert.
          </p>
        </div>

        <div v-if="page" class="editor">
          <!-- Page-level fields -->
          <section class="panel">
            <div class="panel-head">
              <h2>Page</h2>
              <div class="panel-actions">
                <a :href="publicUrl" target="_blank" rel="noopener" class="ghost-button small">
                  <AppIcon name="external" :size="15" />
                  <span>View</span>
                </a>
                <button class="primary-button" type="button" :disabled="saving" @click="save">
                  <AppIcon name="check" :size="16" />
                  <span>{{ saving ? 'Saving…' : 'Save changes' }}</span>
                </button>
              </div>
            </div>

            <div class="field-row">
              <label class="field">
                <span class="field-label">Title</span>
                <input v-model="form.title" type="text" class="input" />
              </label>

              <label class="field checkbox-field">
                <input v-model="form.isPublished" type="checkbox" />
                <span>Published</span>
              </label>
            </div>

            <label class="field">
              <span class="field-label">SEO title</span>
              <input v-model="form.seo.title" type="text" class="input" />
            </label>

            <label class="field">
              <span class="field-label">SEO description</span>
              <textarea v-model="form.seo.description" rows="2" class="input"></textarea>
            </label>

            <div class="field">
              <span class="field-label">SEO keywords</span>
              <div v-for="(keyword, index) in form.seo.keywords" :key="index" class="keyword-row">
                <input v-model="form.seo.keywords[index]" type="text" class="input" />
                <button class="icon-button danger" type="button" aria-label="Remove keyword" @click="removeKeyword(index)">
                  <AppIcon name="trash" :size="16" />
                </button>
              </div>
              <button class="ghost-button small" type="button" @click="addKeyword">
                <AppIcon name="plus" :size="15" />
                <span>Add keyword</span>
              </button>
            </div>
          </section>

          <!-- Sections -->
          <section class="panel">
            <div class="panel-head">
              <h2>Sections</h2>
              <p class="panel-note">Order here is the order on the page.</p>
            </div>

            <p v-if="!form.sections.length" class="empty-note">This page record has no sections.</p>

            <div v-for="(section, index) in form.sections" :key="section.id" class="section-card">
              <div class="section-head">
                <button class="section-toggle" type="button" @click="toggleSection(section.id)">
                  <span class="section-index">{{ index + 1 }}</span>
                  <span class="section-name">{{ section.title || section.id }}</span>
                  <span class="section-type">{{ section.type }}</span>
                </button>

                <div class="section-controls">
                  <button
                    class="icon-button"
                    type="button"
                    aria-label="Move up"
                    :disabled="index === 0"
                    @click="move(index, -1)"
                  >
                    <AppIcon name="arrowLeft" :size="16" class="rotate-up" />
                  </button>
                  <button
                    class="icon-button"
                    type="button"
                    aria-label="Move down"
                    :disabled="index === form.sections.length - 1"
                    @click="move(index, 1)"
                  >
                    <AppIcon name="arrowLeft" :size="16" class="rotate-down" />
                  </button>
                </div>
              </div>

              <div v-if="openSection === section.id" class="section-body">
                <label class="field">
                  <span class="field-label">Heading</span>
                  <input v-model="section.title" type="text" class="input" />
                </label>

                <div class="field">
                  <span class="field-label">Content</span>
                  <RichTextEditor v-model="section.content" />
                </div>

                <div class="field">
                  <span class="field-label">
                    Structured settings
                    <span class="field-hint">JSON — lists of steps, stats, verticals, calls to action</span>
                  </span>
                  <textarea
                    v-model="settingsText[section.id]"
                    rows="10"
                    class="input mono"
                    spellcheck="false"
                    @blur="validateSettings(section)"
                  ></textarea>
                  <p v-if="settingsError[section.id]" class="field-error">
                    {{ settingsError[section.id] }}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
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
  border-radius: var(--border-radius-full);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Banners — solid brand surfaces carry white text. */
.banner {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-lg);
  color: #ffffff;
}

.banner p {
  margin: 0;
  font-size: 0.9375rem;
}

.banner code {
  font-family: var(--font-mono);
  background-color: rgba(255, 255, 255, 0.22);
  padding: 1px 6px;
  border-radius: var(--border-radius-sm);
}

.banner.danger { background-color: var(--danger); }
.banner.success { background-color: var(--success); }
.banner.warning { background-color: var(--warning); }

.editor {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.panel {
  background-color: #ffffff;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
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

.panel-note,
.empty-note {
  margin: 0;
  color: var(--gray-600);
  font-size: 0.875rem;
}

.panel-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* Fields */
.field {
  display: block;
  margin-bottom: var(--spacing-md);
}

.field-row {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.field-row .field {
  flex: 1;
  min-width: 240px;
}

.field-label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--gray-700);
}

.field-hint {
  display: block;
  font-weight: 400;
  color: var(--gray-500);
}

.checkbox-field {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: var(--gray-700);
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

.input.mono {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.field-error {
  margin: 6px 0 0;
  color: var(--danger);
  font-size: 0.8125rem;
}

.keyword-row {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

/* Sections */
.section-card {
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-md);
}

.section-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--gray-50);
  border-radius: var(--border-radius-md);
}

.section-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
  min-width: 0;
  padding: 6px 0;
  background: none;
  border: none;
  cursor: pointer;
  font: inherit;
  text-align: left;
  color: var(--gray-900);
}

.section-index {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: var(--border-radius-full);
  background-color: var(--primary);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 600;
}

.section-name {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.section-type {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--gray-600);
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-sm);
  padding: 1px 6px;
}

.section-controls {
  display: flex;
  gap: 4px;
}

.section-body {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--gray-200);
}

.rotate-up { transform: rotate(90deg); }
.rotate-down { transform: rotate(-90deg); }

/* Buttons */
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
  text-decoration: none;
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

.primary-button.small,
.ghost-button.small {
  padding: 6px 12px;
  font-size: 0.8125rem;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: #ffffff;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-md);
  color: var(--gray-600);
  cursor: pointer;
}

.icon-button:hover:not(:disabled) {
  background-color: var(--gray-100);
  color: var(--gray-900);
}

.icon-button:disabled {
  opacity: 0.4;
  cursor: default;
}

.icon-button.danger:hover {
  background-color: var(--danger);
  border-color: var(--danger);
  color: #ffffff;
}

@media (max-width: 992px) {
  .admin-content {
    padding: var(--spacing-md);
  }
}
</style>
