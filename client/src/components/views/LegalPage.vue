<script setup>
/**
 * Renders a CMS page as plain prose: privacy, terms, and anything else of that
 * shape. The route supplies the slug, so one component covers all of them and a
 * new legal page needs a seed and a route entry, not a new file.
 *
 * These two used to be linked from the footer of every page and routed nowhere.
 */
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { cmsAPI } from '../../api/client';

const route = useRoute();
const slug = computed(() => route.meta?.pageSlug || route.path.replace(/^\//, ''));

const loading = ref(true);
const error = ref(null);
const page = ref(null);

const sections = computed(() =>
  [...(page.value?.sections || [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
);

const intro = computed(() => sections.value.find((s) => s.type === 'hero'));
const body = computed(() => sections.value.filter((s) => s.type !== 'hero'));

async function fetchPage() {
  loading.value = true;
  error.value = null;
  page.value = null;

  try {
    const response = await cmsAPI.getPageBySlug(slug.value);
    if (response.success && response.page) {
      page.value = response.page;
    } else {
      error.value = 'This page could not be found.';
    }
  } catch (err) {
    console.error('Failed to load page:', err);
    error.value = 'This page could not be loaded.';
  }

  loading.value = false;
}

onMounted(fetchPage);
// /privacy and /terms share this component, so navigating between them reuses
// the instance rather than remounting it.
watch(slug, fetchPage);
</script>

<template>
  <div class="legal-page">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <router-link to="/" class="g-btn g-btn--ghost">Back to the home page</router-link>
    </div>

    <template v-else>
      <section class="page-hero">
        <div class="container">
          <h1>{{ page.title }}</h1>
          <p class="hero-description" v-if="intro?.content">{{ intro.content }}</p>
          <p class="updated" v-if="intro?.settings?.updated">
            Last updated {{ intro.settings.updated }}
          </p>
        </div>
      </section>

      <section class="legal-body">
        <div class="container">
          <article class="prose">
            <section v-for="section in body" :key="section.id" class="clause">
              <h2>{{ section.title }}</h2>
              <div v-html="section.content"></div>
            </section>
          </article>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.legal-page { min-height: 60vh; }

.legal-body { padding: clamp(48px, 6vw, 80px) 0 clamp(64px, 8vw, 110px); }

.updated {
  font-family: var(--g-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--g-text-faint);
  margin: 20px 0 0;
}

/* One measure for the whole document: legal prose read at full container width
   is the thing nobody finishes. */
.prose { max-width: 72ch; }

.clause + .clause {
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid var(--g-line);
}

.clause h2 {
  font-size: 1.25rem;
  margin: 0 0 14px;
}

.clause :deep(p) { margin: 0 0 16px; }
.clause :deep(p:last-child) { margin-bottom: 0; }
.clause :deep(ul) { margin: 0 0 16px; padding-left: 20px; }
.clause :deep(li) { margin-bottom: 8px; }
.clause :deep(a) {
  color: var(--g-volt);
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
