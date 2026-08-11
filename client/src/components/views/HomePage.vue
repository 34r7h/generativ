<script setup>
import { ref, computed, onMounted } from 'vue';
import { cmsAPI } from '../../api/client';
import AppIcon from '../shared/AppIcon.vue';
import HeroAnimation from '../shared/HeroAnimation.vue';
import AvatarPortrait from '../shared/AvatarPortrait.vue';
import { memberSlug } from '../../config/people';

// Summary cards carry the opening sentences only.
function bioLead(bio) {
  const first = (bio || '').split(/\n\s*\n/)[0].trim();
  if (first.length <= 180) return first;
  // Cut on a sentence boundary — a lead clipped mid-clause reads as a bug.
  const cut = first.slice(0, 180);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
  return stop > 60 ? cut.slice(0, stop + 1) : cut.slice(0, cut.lastIndexOf(' ')).trimEnd() + '…';
}

const loading = ref(true);
const error = ref(null);
const pageData = ref(null);
const services = ref([]);
const teamMembers = ref([]);
const siteSettings = ref(null);

// Sections carry a sortOrder that the admin edits; the page has to honour it
// rather than rendering whatever order the records happen to be stored in.
const orderedSections = computed(() =>
  [...(pageData.value?.sections || [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
);

// Section index for the mono counter in each band header. Computed from the
// rendered order so inserting a section in the admin renumbers the rest.
function indexOf(section) {
  const i = orderedSections.value.findIndex((s) => s.id === section.id);
  return String(i + 1).padStart(2, '0');
}

const hero = computed(() => orderedSections.value.find((s) => s.type === 'hero'));
const bodySections = computed(() => orderedSections.value.filter((s) => s.type !== 'hero'));

/*
 * Price shown on a service row.
 *
 * The gate is the stored pricing model, exactly as `formatPrice` applies it on
 * the services page: anything quoted or not purchasable reads "On application".
 * An earlier version parsed the free-text `pricing` string as a fallback, which
 * printed "$1,500" for the Implementation Sprint (stored range $1,500–$3,500,
 * model `quote`) and "From $15,000" for AI Safety Testing — prices the service
 * pages themselves do not quote.
 */
function priceOf(service) {
  const detail = service.pricingDetail;
  if (!detail || !detail.purchasable || detail.model === 'quote') return 'On application';
  if (typeof detail.amount !== 'number') return 'On application';

  const formatted = `$${(detail.amount / 100).toLocaleString('en-US')}`;
  return detail.model === 'subscription' ? `${formatted}/mo` : formatted;
}

async function fetchPageData() {
  loading.value = true;
  error.value = null;

  try {
    const settingsResponse = await cmsAPI.getSiteSettings();
    if (settingsResponse.success && settingsResponse.settings) {
      siteSettings.value = settingsResponse.settings;
    }
  } catch (settingsError) {
    console.warn('Failed to load site settings:', settingsError);
  }

  try {
    const pageResponse = await cmsAPI.getPageBySlug('home');
    if (pageResponse.success && pageResponse.page) {
      pageData.value = pageResponse.page;
    } else {
      error.value = 'Home page content not found';
    }
  } catch (pageError) {
    console.error('Failed to load home page:', pageError);
    error.value = 'Failed to load home page content';
  }

  try {
    const servicesResponse = await cmsAPI.getServices();
    if (servicesResponse.success) {
      services.value = [...(servicesResponse.services || [])]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }
  } catch (servicesError) {
    console.error('Failed to load services:', servicesError);
  }

  try {
    const teamResponse = await cmsAPI.getTeamMembers();
    if (teamResponse.success) teamMembers.value = teamResponse.members || [];
  } catch (teamError) {
    console.error('Failed to load team members:', teamError);
  }

  loading.value = false;
}

onMounted(fetchPageData);
</script>

<template>
  <div class="home-page">
    <div v-if="loading" class="state-panel">
      <div class="spinner"></div>
    </div>

    <div v-else-if="error" class="state-panel">
      <p>{{ error }}</p>
      <button class="g-btn g-btn--ghost" @click="fetchPageData">Try again</button>
    </div>

    <template v-else-if="pageData">
      <!-- ================= HERO ================= -->
      <section v-if="hero" class="hero">
        <div class="hero-grid-lines" aria-hidden="true"></div>
        <div class="container hero-inner">
          <div class="hero-copy">
            <h1>{{ hero.title }}</h1>
            <p class="hero-subhead" v-if="hero.settings?.subhead">{{ hero.settings.subhead }}</p>
            <p class="hero-lede">{{ hero.content }}</p>

            <ul class="hero-serves" v-if="hero.settings?.serves">
              <li v-for="item in hero.settings.serves" :key="item" class="g-tag">{{ item }}</li>
            </ul>

            <div class="hero-cta">
              <router-link
                v-if="hero.settings?.ctaPrimary"
                :to="hero.settings.ctaPrimary.url"
                class="g-btn g-btn--primary"
              >
                {{ hero.settings.ctaPrimary.text }}
              </router-link>
              <router-link
                v-if="hero.settings?.ctaSecondary"
                :to="hero.settings.ctaSecondary.url"
                class="g-btn g-btn--ghost"
              >
                {{ hero.settings.ctaSecondary.text }}
              </router-link>
            </div>

            <p class="hero-terms" v-if="hero.settings?.terms">{{ hero.settings.terms }}</p>
          </div>

          <div class="hero-graphic">
            <HeroAnimation />
          </div>
        </div>

        <!-- Proof strip: three figures pinned to the bottom of the fold. -->
        <div class="container" v-if="hero.settings?.proof">
          <div class="proof-strip">
            <div v-for="item in hero.settings.proof" :key="item.label" class="proof-item">
              <span class="proof-value">{{ item.value }}</span>
              <span class="proof-label">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= BODY SECTIONS ================= -->
      <section
        v-for="section in bodySections"
        :key="section.id"
        class="g-band"
        :class="{ 'g-band--bone': section.settings?.invert }"
      >
        <div class="container">
          <header class="g-head g-reveal">
            <p class="g-eyebrow">{{ indexOf(section) }} — {{ section.settings?.eyebrow || section.type }}</p>
            <h2 class="g-title">{{ section.title }}</h2>
            <p class="g-sub" v-if="section.content" v-html="section.content"></p>
          </header>

          <!-- ---- Reference figures ---- -->
          <div v-if="section.settings?.stats" class="figures">
            <div v-for="stat in section.settings.stats" :key="stat.label" class="figure g-reveal">
              <div class="g-figure">{{ stat.value }}</div>
              <div class="figure-label">{{ stat.label }}</div>
              <p class="figure-detail" v-if="stat.detail">{{ stat.detail }}</p>
              <p class="figure-source" v-if="stat.source">{{ stat.source }}</p>
            </div>
          </div>
          <p class="figures-note" v-if="section.settings?.statsNote">{{ section.settings.statsNote }}</p>

          <!-- ---- Verticals, as rows rather than equal cards ---- -->
          <div v-if="section.settings?.verticals" class="verticals">
            <article
              v-for="(vertical, i) in section.settings.verticals"
              :key="vertical.title"
              class="vertical g-reveal"
            >
              <div class="vertical-index">{{ String(i + 1).padStart(2, '0') }}</div>
              <div class="vertical-body">
                <h3>{{ vertical.title }}</h3>
                <p class="vertical-leak">{{ vertical.leak }}</p>
                <p class="vertical-proof" v-if="vertical.proof">{{ vertical.proof }}</p>
              </div>
              <div class="vertical-shift">
                <span class="shift-before">{{ vertical.before }}</span>
                <span class="shift-rule" aria-hidden="true"></span>
                <span class="shift-after">{{ vertical.after }}</span>
              </div>
            </article>
          </div>

          <!-- ---- Offer ladder ---- -->
          <div v-if="section.settings?.tiers" class="tiers">
            <div
              v-for="(tier, index) in section.settings.tiers"
              :key="tier.name"
              class="tier g-card g-reveal"
              :class="{ 'tier--lead': index === 0 }"
            >
              <h3>{{ tier.name }}</h3>
              <div class="tier-price">{{ tier.price }}</div>
              <div class="g-mono tier-timeline">{{ tier.timeline }}</div>
              <p>{{ tier.objective }}</p>
            </div>
          </div>

          <!-- ---- Services ---- -->
          <div v-if="section.type === 'services'" class="service-rows">
            <router-link
              v-for="service in services"
              :key="service.id"
              :to="`/services/${service.slug}`"
              class="service-row g-reveal"
            >
              <span class="service-name">{{ service.title }}</span>
              <span class="service-desc">{{ service.shortDescription }}</span>
              <span class="service-price">{{ priceOf(service) }}</span>
              <span class="service-arrow"><AppIcon name="arrowRight" :size="16" /></span>
            </router-link>
          </div>

          <!-- ---- Delivery steps ---- -->
          <div v-if="section.settings?.steps" class="steps">
            <div v-for="(step, index) in section.settings.steps" :key="step.title" class="step g-reveal">
              <div class="step-number">{{ String(index + 1).padStart(2, '0') }}</div>
              <div class="step-body">
                <h3>{{ step.title }}</h3>
                <p>{{ step.description }}</p>
              </div>
            </div>
          </div>

          <!-- ---- Objections ---- -->
          <div v-if="section.settings?.faq" class="faq">
            <div v-for="item in section.settings.faq" :key="item.question" class="faq-row g-reveal">
              <h3>{{ item.question }}</h3>
              <p>{{ item.answer }}</p>
            </div>
          </div>

          <!-- ---- Value points ---- -->
          <div v-if="section.settings?.valuePoints" class="values">
            <div v-for="point in section.settings.valuePoints" :key="point.title" class="value g-reveal">
              <AppIcon name="check" :size="16" class="value-tick" />
              <div>
                <h4>{{ point.title }}</h4>
                <p>{{ point.description }}</p>
              </div>
            </div>
          </div>

          <!-- ---- Team ---- -->
          <div v-if="section.type === 'team' && teamMembers.length" class="team">
            <router-link
              v-for="member in teamMembers.slice(0, section.settings?.showMembers || 4)"
              :key="member.id"
              :to="`/team/${memberSlug(member)}`"
              class="member g-card g-card--link g-reveal"
            >
              <div class="member-photo">
                <img v-if="member.photo?.filePath" :src="member.photo.filePath" :alt="member.name" />
                <AvatarPortrait v-else :slug="memberSlug(member)" :name="member.name" />
              </div>
              <h3>{{ member.name }}</h3>
              <p class="member-position">{{ member.position }}</p>
              <p class="member-bio">{{ bioLead(member.bio) }}</p>
            </router-link>
          </div>

          <!-- ---- Closing call to action ---- -->
          <div v-if="section.type === 'cta'" class="cta-actions">
            <router-link
              v-if="section.settings?.ctaPrimary"
              :to="section.settings.ctaPrimary.url"
              class="g-btn g-btn--primary"
            >
              {{ section.settings.ctaPrimary.text }}
            </router-link>
            <router-link
              v-if="section.settings?.ctaSecondary"
              :to="section.settings.ctaSecondary.url"
              class="g-btn g-btn--ghost"
            >
              {{ section.settings.ctaSecondary.text }}
            </router-link>
          </div>

          <router-link
            v-else-if="section.settings?.ctaText && section.settings?.ctaUrl"
            :to="section.settings.ctaUrl"
            class="g-link section-link"
          >
            {{ section.settings.ctaText }}
            <AppIcon name="arrowRight" :size="15" />
          </router-link>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
/* ---------------------------------------------------------------------------
   States
   ------------------------------------------------------------------------ */
.state-panel {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.spinner {
  width: 26px;
  height: 26px;
  border: 1.5px solid var(--g-line-2);
  border-top-color: var(--g-volt);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ---------------------------------------------------------------------------
   Hero
   ------------------------------------------------------------------------ */
.hero {
  position: relative;
  padding: clamp(60px, 8vw, 104px) 0 0;
  overflow: hidden;
}

/* A faint vertical rhythm behind the fold — structure, not decoration. */
.hero-grid-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 12.5% 100%;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9), transparent 78%);
  -webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9), transparent 78%);
}

.hero-inner {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(0, 0.82fr);
  gap: clamp(32px, 5vw, 72px);
  align-items: center;
}

.hero-copy h1 {
  font-size: var(--g-display);
  line-height: 0.96;
  font-weight: 600;
  margin: 0;
  max-width: 13ch;
}

.hero-subhead {
  font-size: clamp(1.15rem, 1.8vw, 1.5rem);
  font-weight: 400;
  color: var(--g-volt);
  letter-spacing: -0.02em;
  margin: 16px 0 0;
}

.hero-lede {
  font-size: 1.0625rem;
  line-height: 1.68;
  color: var(--g-text-dim);
  max-width: 52ch;
  margin: 26px 0 0;
}

.hero-serves {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 26px 0 0;
}

.hero-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
}

.hero-terms {
  font-size: 0.8125rem;
  color: var(--g-text-faint);
  margin: 16px 0 0;
}

.hero-graphic {
  display: flex;
  justify-content: flex-end;
}

/* Proof strip — four hairline cells, flush with the container edges. */
.proof-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  border-top: 1px solid var(--g-line);
  margin-top: clamp(48px, 6vw, 84px);
}

.proof-item {
  padding: 22px 24px 22px 0;
  border-right: 1px solid var(--g-line);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.proof-item:last-child { border-right: none; }
.proof-item + .proof-item { padding-left: 24px; }

.proof-value {
  font-size: 1.375rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  color: var(--g-text);
  font-variant-numeric: tabular-nums;
}

.proof-label {
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--g-text-faint);
}

/* ---------------------------------------------------------------------------
   Reference figures
   ------------------------------------------------------------------------ */
.figures {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 1px;
  background: var(--g-line);
  border: 1px solid var(--g-line);
  border-radius: var(--g-r);
  overflow: hidden;
}

.figure {
  background: var(--g-ink);
  padding: 30px 26px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.figure-label {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--g-text);
  line-height: 1.4;
}

.figure-detail {
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--g-text-dim);
  margin: 0;
}

.figure-source {
  font-family: var(--g-mono);
  font-size: 0.6875rem;
  line-height: 1.5;
  color: var(--g-text-faint);
  margin: auto 0 0;
  padding-top: 10px;
}

.figures-note {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--g-text-faint);
  margin: 20px 0 0;
  max-width: 90ch;
}

/* ---------------------------------------------------------------------------
   Verticals
   ------------------------------------------------------------------------ */
.verticals {
  border-top: 1px solid var(--g-line);
}

.vertical {
  display: grid;
  grid-template-columns: 56px minmax(0, 1.35fr) minmax(0, 1fr);
  gap: clamp(20px, 3vw, 48px);
  padding: 30px 0;
  border-bottom: 1px solid var(--g-line);
  align-items: start;
}

.vertical-index {
  font-family: var(--g-mono);
  font-size: 0.75rem;
  color: var(--g-volt);
  padding-top: 5px;
}

.vertical-body h3 {
  font-size: 1.375rem;
  margin: 0 0 10px;
  letter-spacing: -0.025em;
}

.vertical-leak {
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--g-text-dim);
  margin: 0;
}

.vertical-proof {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--g-text-faint);
  margin: 10px 0 0;
}

.vertical-shift {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  padding-top: 4px;
}

.shift-before {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--g-text-faint);
  text-decoration: line-through;
  text-decoration-color: var(--g-text-faint);
}

.shift-rule {
  height: 1px;
  background: linear-gradient(90deg, var(--g-line-2), transparent);
}

.shift-after {
  font-size: 0.9375rem;
  line-height: 1.5;
  font-weight: 500;
  color: var(--g-volt);
}

/* ---------------------------------------------------------------------------
   Tiers
   ------------------------------------------------------------------------ */
.tiers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 16px;
}

.tier h3 { font-size: 1.0625rem; margin: 0 0 14px; }

.tier-price {
  font-size: 2rem;
  font-weight: 300;
  letter-spacing: -0.04em;
  color: var(--g-text);
}

.tier--lead .tier-price { color: var(--g-volt); }

.tier-timeline { margin: 6px 0 16px; display: block; }

.tier p { font-size: 0.875rem; line-height: 1.6; margin: 0; }

.tier--lead { border-color: var(--g-volt-line); }

/* ---------------------------------------------------------------------------
   Services — rows, priced
   ------------------------------------------------------------------------ */
.service-rows { border-top: 1px solid var(--g-line); }

.service-row {
  display: grid;
  grid-template-columns: minmax(200px, 0.9fr) minmax(0, 1.6fr) 150px 24px;
  gap: clamp(16px, 3vw, 40px);
  align-items: center;
  padding: 22px 0;
  border-bottom: 1px solid var(--g-line);
  text-decoration: none;
  transition: background-color 160ms ease, padding 160ms ease;
}

.service-row:hover {
  background: rgba(255, 255, 255, 0.025);
}

.service-name {
  font-size: 1.0625rem;
  font-weight: 500;
  color: var(--g-text);
  letter-spacing: -0.02em;
}

.service-row:hover .service-name { color: var(--g-volt); }

.service-desc {
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--g-text-dim);
}

.service-price {
  font-family: var(--g-mono);
  font-size: 0.8125rem;
  color: var(--g-text);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.service-arrow {
  color: var(--g-text-faint);
  display: flex;
  justify-content: flex-end;
  transition: transform 160ms ease, color 160ms ease;
}

.service-row:hover .service-arrow {
  color: var(--g-volt);
  transform: translateX(3px);
}

/* ---------------------------------------------------------------------------
   Steps
   ------------------------------------------------------------------------ */
.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1px;
  background: var(--g-line);
  border: 1px solid var(--g-line);
  border-radius: var(--g-r);
  overflow: hidden;
}

.step {
  background: var(--g-ink);
  padding: 30px 26px;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 18px;
}

.g-band--bone .step { background: var(--g-bone); }

.step-number {
  font-family: var(--g-mono);
  font-size: 1.25rem;
  color: var(--g-volt);
  line-height: 1.2;
}

.g-band--bone .step-number { color: var(--g-bone-text); }

.step-body h3 { font-size: 1.0625rem; margin: 0 0 8px; }

.step-body p { font-size: 0.9375rem; line-height: 1.65; margin: 0; }

/* ---------------------------------------------------------------------------
   Objections
   ------------------------------------------------------------------------ */
.faq { border-top: 1px solid var(--g-line); }

.g-band--bone .faq { border-color: var(--g-line-bone); }

.faq-row {
  display: grid;
  grid-template-columns: minmax(220px, 0.85fr) minmax(0, 1.6fr);
  gap: clamp(20px, 4vw, 56px);
  padding: 26px 0;
  border-bottom: 1px solid var(--g-line);
}

.g-band--bone .faq-row { border-color: var(--g-line-bone); }

.faq-row h3 {
  font-size: 1.0625rem;
  margin: 0;
  letter-spacing: -0.02em;
}

.faq-row p { font-size: 0.9375rem; line-height: 1.7; margin: 0; }

/* ---------------------------------------------------------------------------
   Value points
   ------------------------------------------------------------------------ */
.values {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 26px 40px;
}

.value { display: grid; grid-template-columns: 20px 1fr; gap: 14px; }

.value-tick { color: var(--g-volt); margin-top: 3px; }

.g-band--bone .value-tick { color: var(--g-bone-text); }

.value h4 { font-size: 1rem; margin: 0 0 6px; }

.value p { font-size: 0.9375rem; line-height: 1.65; margin: 0; }

/* ---------------------------------------------------------------------------
   Team
   ------------------------------------------------------------------------ */
.team {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 16px;
}

.member { text-decoration: none; display: block; }

.member-photo {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 18px;
  border: 1px solid var(--g-line-2);
}

.member-photo img { width: 100%; height: 100%; object-fit: cover; }

.member h3 { font-size: 1.0625rem; margin: 0 0 4px; }

.member-position {
  font-family: var(--g-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: var(--g-volt);
  margin: 0 0 12px;
}

.member-bio { font-size: 0.875rem; line-height: 1.6; margin: 0; }

/* ---------------------------------------------------------------------------
   Calls to action
   ------------------------------------------------------------------------ */
.cta-actions { display: flex; flex-wrap: wrap; gap: 12px; }

.section-link { margin-top: 32px; }

/* ---------------------------------------------------------------------------
   Responsive
   ------------------------------------------------------------------------ */
@media (max-width: 980px) {
  .hero-inner { grid-template-columns: 1fr; }
  .hero-copy h1 { max-width: none; }
  .hero-graphic { justify-content: flex-start; margin-top: 8px; }
  .vertical { grid-template-columns: 40px minmax(0, 1fr); }
  .vertical-shift { grid-column: 2; padding-top: 14px; }
  .service-row { grid-template-columns: minmax(0, 1fr) 120px 20px; }
  .service-desc { display: none; }
  .faq-row { grid-template-columns: 1fr; gap: 10px; }
}

@media (max-width: 640px) {
  .proof-item {
    border-right: none;
    border-bottom: 1px solid var(--g-line);
    padding: 16px 0 !important;
  }
  .proof-item:last-child { border-bottom: none; }
  .hero-cta .g-btn { flex: 1 1 auto; }
}
</style>
