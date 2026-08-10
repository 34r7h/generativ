<script setup>
import { ref, onMounted } from 'vue';
import { cmsAPI } from '../../api/client';
import AppIcon from '../shared/AppIcon.vue';
import BrandGraphic from '../shared/BrandGraphic.vue';
import HeroAnimation from '../shared/HeroAnimation.vue';
import AvatarPortrait from '../shared/AvatarPortrait.vue';
import { iconFor, verticalIcon } from '../../config/icons';
import { memberSlug } from '../../config/people';

// Summary cards carry the opening sentences only.
function bioLead(bio) {
  const first = (bio || '').split(/\n\s*\n/)[0].trim();
  if (first.length <= 210) return first;
  // Cut on a sentence boundary — a lead clipped mid-clause reads as a bug.
  const cut = first.slice(0, 210);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
  return stop > 60 ? cut.slice(0, stop + 1) : cut.slice(0, cut.lastIndexOf(' ')).trimEnd() + '\u2026';
}

const loading = ref(true);
const error = ref(null);
const pageData = ref(null);
const services = ref([]);
const teamMembers = ref([]);
const siteSettings = ref(null);

// Fetch page data
async function fetchPageData() {
  try {
    loading.value = true;
    console.log('Fetching home page data...');

    // Get site settings
    try {
      const settingsResponse = await cmsAPI.getSiteSettings();
      if (settingsResponse.success && settingsResponse.settings) {
        siteSettings.value = settingsResponse.settings;
        console.log('Site settings loaded:', siteSettings.value);
      }
    } catch (settingsError) {
      console.warn('Failed to load site settings:', settingsError);
    }

    // Get home page data
    try {
      const pageResponse = await cmsAPI.getPageBySlug('home');
      console.log('Home page response:', pageResponse);
      if (pageResponse.success && pageResponse.page) {
        pageData.value = pageResponse.page;
        console.log('Home page data loaded:', pageData.value);
      } else {
        error.value = 'Home page content not found';
      }
    } catch (pageError) {
      console.error('Failed to load home page:', pageError);
      error.value = 'Failed to load home page content';
    }

    // Get services
    try {
      const servicesResponse = await cmsAPI.getServices();
      console.log('Services response:', servicesResponse);
      if (servicesResponse.success) {
        services.value = [...(servicesResponse.services || [])]
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        console.log('Services loaded:', services.value);
      }
    } catch (servicesError) {
      console.error('Failed to load services:', servicesError);
    }

    // Get team members
    try {
      const teamResponse = await cmsAPI.getTeamMembers();
      console.log('Team members response:', teamResponse);
      if (teamResponse.success) {
        teamMembers.value = teamResponse.members || [];
        console.log('Team members loaded:', teamMembers.value);
      }
    } catch (teamError) {
      console.error('Failed to load team members:', teamError);
    }

    loading.value = false;
  } catch (err) {
    console.error('Error fetching page data:', err);
    error.value = 'Failed to load page content';
    loading.value = false;
  }
}

onMounted(() => {
  fetchPageData();
});
</script>

<template>
  <div class="home-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchPageData">Try Again</button>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Dynamic Page Content -->
      <div v-if="pageData">
        <!-- Render page sections dynamically -->
        <div v-for="section in pageData.sections" :key="section.id" class="page-section">
          
          <!-- Hero Section -->
          <section v-if="section.type === 'hero'" class="hero-section">
            <div class="container">
              <div class="hero-content">
                <p class="hero-eyebrow" v-if="section.settings?.eyebrow">
                  {{ section.settings.eyebrow }}
                </p>
                <h1>{{ section.title }}</h1>
                <p class="hero-lede">{{ section.content }}</p>
                <ul class="hero-serves" v-if="section.settings?.serves">
                  <li v-for="item in section.settings.serves" :key="item">
                    <AppIcon name="check" :size="15" />
                    <span>{{ item }}</span>
                  </li>
                </ul>
                <div class="hero-cta" v-if="section.settings?.ctaPrimary || section.settings?.ctaSecondary">
                  <router-link 
                    v-if="section.settings?.ctaPrimary" 
                    :to="section.settings.ctaPrimary.url" 
                    class="primary-button"
                  >
                    {{ section.settings.ctaPrimary.text }}
                  </router-link>
                  <router-link 
                    v-if="section.settings?.ctaSecondary" 
                    :to="section.settings.ctaSecondary.url" 
                    class="secondary-button"
                  >
                    {{ section.settings.ctaSecondary.text }}
                  </router-link>
                </div>
              </div>
              <div class="hero-graphic">
                <HeroAnimation />
              </div>
            </div>
          </section>

          <!-- Services Section -->
          <section v-else-if="section.type === 'services'" class="services-section">
            <div class="container">
              <div class="section-header">
                <h2>{{ section.title }}</h2>
                <p class="section-intro">{{ section.content }}</p>
              </div>

              <div class="services-grid" v-if="services.length">
                <div
                  v-for="service in services"
                  :key="service.id"
                  class="service-card"
                >
                  <div class="service-icon">
                    <AppIcon :name="iconFor(service.title)" :size="26" />
                  </div>
                  <h3>{{ service.title }}</h3>
                  <p>{{ service.shortDescription }}</p>
                  <router-link :to="`/services/${service.slug}`" class="service-link">
                    Learn More
                  </router-link>
                </div>
              </div>

              <div v-else class="no-services">
                <p>No services available yet.</p>
              </div>
            </div>
          </section>

          <!-- Content Section -->
          <section v-else-if="section.type === 'content'" class="content-section">
            <div class="container">
              <h2>{{ section.title }}</h2>
              <div class="content-text" v-html="section.content"></div>
              
              <!-- Stats (leak factors / measured impact) -->
              <div v-if="section.settings?.stats" class="stats-grid">
                <div
                  v-for="stat in section.settings.stats"
                  :key="stat.label"
                  class="stat-card"
                >
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                  <p class="stat-detail" v-if="stat.detail">{{ stat.detail }}</p>
                </div>
              </div>
              <p class="stats-note" v-if="section.settings?.statsNote">
                {{ section.settings.statsNote }}
              </p>

              <!-- Verticals (leak to fix, by industry) -->
              <div v-if="section.settings?.verticals" class="verticals-grid">
                <div
                  v-for="vertical in section.settings.verticals"
                  :key="vertical.title"
                  class="vertical-card"
                >
                  <div class="vertical-icon">
                    <AppIcon :name="verticalIcon(vertical.title)" :size="22" />
                  </div>
                  <h3>{{ vertical.title }}</h3>
                  <p class="vertical-leak">{{ vertical.leak }}</p>
                  <div class="vertical-shift">
                    <span class="shift-before">{{ vertical.before }}</span>
                    <AppIcon name="arrowRight" :size="18" class="shift-arrow" />
                    <span class="shift-after">{{ vertical.after }}</span>
                  </div>
                  <p class="vertical-proof" v-if="vertical.proof">{{ vertical.proof }}</p>
                </div>
              </div>

              <!-- Offer ladder -->
              <div v-if="section.settings?.tiers" class="tiers-grid">
                <div
                  v-for="(tier, index) in section.settings.tiers"
                  :key="tier.name"
                  class="tier-card"
                  :class="{ 'tier-featured': index === 0 }"
                >
                  <h3>{{ tier.name }}</h3>
                  <div class="tier-price">{{ tier.price }}</div>
                  <div class="tier-timeline">{{ tier.timeline }}</div>
                  <p class="tier-objective">{{ tier.objective }}</p>
                </div>
              </div>

              <!-- Steps (delivery schedule) -->
              <div v-if="section.settings?.steps" class="steps-list">
                <div
                  v-for="(step, index) in section.settings.steps"
                  :key="step.title"
                  class="step-item"
                >
                  <div class="step-number">{{ index + 1 }}</div>
                  <div class="step-content">
                    <h3>{{ step.title }}</h3>
                    <p>{{ step.description }}</p>
                  </div>
                </div>
              </div>

              <!-- Value Points -->
              <div v-if="section.settings?.valuePoints" class="value-points">
                <div 
                  v-for="point in section.settings.valuePoints" 
                  :key="point.title"
                  class="value-point"
                >
                  <div class="value-icon"><AppIcon name="check" :size="18" /></div>
                  <div class="value-text">
                    <h4>{{ point.title }}</h4>
                    <p>{{ point.description }}</p>
                  </div>
                </div>
              </div>

              <!-- CTA -->
              <router-link 
                v-if="section.settings?.ctaText && section.settings?.ctaUrl" 
                :to="section.settings.ctaUrl" 
                class="text-button"
              >
                <span>{{ section.settings.ctaText }}</span>
                <AppIcon name="arrowRight" :size="18" />
              </router-link>
            </div>
          </section>

          <!-- Team Section -->
          <section v-else-if="section.type === 'team'" class="team-section">
            <div class="container">
              <div class="section-header">
                <h2>{{ section.title }}</h2>
                <p class="section-intro">{{ section.content }}</p>
              </div>

              <div class="team-grid" v-if="teamMembers.length">
                <router-link
                  v-for="member in teamMembers.slice(0, section.settings?.showMembers || 3)"
                  :key="member.id"
                  :to="`/team/${memberSlug(member)}`"
                  class="team-card"
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

              <div v-else class="no-team">
                <p>No team members available yet.</p>
              </div>

              <div class="team-cta" v-if="section.settings?.ctaText && section.settings?.ctaUrl">
                <router-link :to="section.settings.ctaUrl" class="secondary-button">
                  {{ section.settings.ctaText }}
                </router-link>
              </div>
            </div>
          </section>

          <!-- CTA Section -->
          <section v-else-if="section.type === 'cta'" class="cta-section">
            <div class="container">
              <h2>{{ section.title }}</h2>
              <p>{{ section.content }}</p>
              <div class="cta-buttons" v-if="section.settings?.ctaPrimary || section.settings?.ctaSecondary">
                <router-link 
                  v-if="section.settings?.ctaPrimary" 
                  :to="section.settings.ctaPrimary.url" 
                  class="primary-button"
                >
                  {{ section.settings.ctaPrimary.text }}
                </router-link>
                <router-link 
                  v-if="section.settings?.ctaSecondary" 
                  :to="section.settings.ctaSecondary.url" 
                  class="secondary-button"
                >
                  {{ section.settings.ctaSecondary.text }}
                </router-link>
              </div>
            </div>
          </section>

        </div>

        <!-- Main Page Content (if any) -->
        <section v-if="pageData.content" class="page-content-section">
          <div class="container">
            <div class="page-content" v-html="pageData.content"></div>
          </div>
        </section>
      </div>

      <!-- Fallback if no page data -->
      <div v-else class="no-page-data">
        <div class="container">
          <h1>Welcome</h1>
          <p>Page content is loading...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hero Section */
.hero-section {
  padding: 72px 0 76px;
  background-color: var(--light-blue);
}

.hero-eyebrow {
  display: inline-block;
  margin-bottom: 18px;
  padding: 6px 13px;
  border-radius: var(--border-radius-full, 999px);
  background-color: var(--white);
  color: var(--primary-color);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.hero-lede {
  font-size: 1.2rem;
  line-height: 1.65;
  color: var(--text-color);
  max-width: 620px;
  margin-bottom: 26px;
}

.hero-serves {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 22px;
  list-style: none;
  padding: 0;
  margin: 0 0 30px;
}

.hero-serves li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--dark-blue);
  font-size: 0.95rem;
  font-weight: 500;
}

.hero-serves svg {
  color: var(--primary-color);
}

.hero-section .container {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 48px;
  align-items: center;
}

.hero-content {
  max-width: 760px;
}

.hero-graphic {
  display: flex;
  justify-content: flex-end;
}

.hero-content h1 {
  font-size: 3.1rem;
  line-height: 1.14;
  margin-bottom: 18px;
  color: var(--dark-blue);
  max-width: 15ch;
}

.hero-content p {
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 32px;
  color: var(--text-color);
}

.hero-cta {
  display: flex;
  gap: 16px;
}

.hero-image img {
  width: 100%;
  max-width: 500px;
}

/* Content Section */
.content-section {
  padding: 80px 0;
  background-color: var(--light-blue);
}

.content-text {
  max-width: 760px;
  margin: 0 0 40px;
  line-height: 1.7;
  color: var(--text-color);
}

.content-section .container {
  display: block;
}

.content-section h2 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  color: var(--dark-blue);
}

/* Alternate content sections so consecutive blocks stay legible */
.page-section:nth-child(even) .content-section {
  background-color: var(--white, #fff);
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
  margin: 40px 0 16px;
}

.stat-card {
  background-color: var(--white, #fff);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--border-radius, 8px);
  padding: 24px;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 600;
  line-height: 1.2;
  color: var(--dark-blue);
  margin-bottom: 8px;
}

.stat-label {
  font-weight: 600;
  color: var(--dark-blue);
  margin-bottom: 8px;
}

.stat-detail {
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--text-color);
  margin: 0;
}

.stats-note {
  text-align: left;
  font-size: 0.82rem;
  color: var(--text-color);
  opacity: 0.7;
  margin: 0;
}

/* Verticals */
.verticals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 40px;
}

.vertical-card {
  background-color: var(--white, #fff);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--border-radius, 8px);
  padding: 28px;
  display: flex;
  flex-direction: column;
}

.vertical-icon {
  width: 42px;
  height: 42px;
  border-radius: var(--border-radius);
  background-color: var(--light-blue);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.vertical-card h3 {
  margin: 0 0 12px;
  min-height: 2.6em;
  color: var(--dark-blue, #123);
}

.vertical-leak {
  line-height: 1.6;
  margin-bottom: 20px;
}

.vertical-shift {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 16px;
  border-radius: var(--border-radius, 8px);
  background-color: var(--light-blue);
  margin-bottom: 16px;
  font-size: 0.9rem;
}

.shift-before {
  opacity: 0.7;
  text-decoration: line-through;
}

.shift-arrow {
  color: var(--primary-color);
}

.shift-after {
  font-weight: 600;
  color: var(--dark-blue);
}

.vertical-proof {
  margin: auto 0 0;
  font-size: 0.9rem;
  font-style: italic;
  opacity: 0.85;
}

/* Offer ladder */
.tiers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-top: 40px;
}

.tier-card {
  background-color: var(--white, #fff);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: var(--border-radius, 8px);
  padding: 32px 28px;
}

.tier-featured {
  border: 2px solid var(--primary-color);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.tier-card h3 {
  margin: 0 0 16px;
  font-size: 1.15rem;
  color: var(--dark-blue, #123);
}

.tier-price {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
}

.tier-timeline {
  font-size: 0.9rem;
  opacity: 0.75;
  margin-bottom: 16px;
}

.tier-objective {
  line-height: 1.6;
  margin: 0;
}

/* Steps */
.steps-list {
  max-width: 820px;
  margin: 40px 0 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.step-number {
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: var(--white, #fff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.step-content h3 {
  margin: 0 0 6px;
  font-size: 1.1rem;
  color: var(--dark-blue);
}

.step-content p {
  margin: 0;
  line-height: 1.6;
}

/* No data states */
.no-services,
.no-team,
.no-page-data {
  text-align: center;
  padding: 40px 20px;
  color: var(--gray-600);
}

.no-page-data {
  padding: 80px 20px;
}

/* Services Section */
.services-section {
  padding: 80px 0;
  background-color: var(--white);
}

.section-header {
  margin-bottom: 48px;
}

.section-intro {
  max-width: 600px;
  margin: 0;
  font-size: 1.2rem;
  color: var(--light-text);
}

.services-section h2,
.team-section h2 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  color: var(--dark-blue);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.service-card {
  display: flex;
  flex-direction: column;
  background-color: var(--white);
  padding: 30px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  transition: transform 0.3s ease;
}

.service-card:hover {
  transform: translateY(-5px);
}

.service-icon {
  width: 52px;
  height: 52px;
  border-radius: var(--border-radius);
  background-color: var(--primary-color);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.service-card h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: var(--dark-blue);
  min-height: 2.4em;
}

.service-card p {
  color: var(--light-text);
  margin-bottom: 20px;
  flex-grow: 1;
}

.service-link {
  display: inline-block;
  align-self: flex-start;
  font-weight: 500;
}

/* Value Proposition Section */
.value-prop-section {
  padding: 80px 0;
  background-color: var(--light-blue);
}

.value-prop-section .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.value-prop-content h2 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: var(--dark-blue);
}

.value-prop-content > p {
  font-size: 1.2rem;
  margin-bottom: 30px;
  color: var(--light-text);
}

.value-points {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.value-point {
  display: flex;
  gap: 16px;
}

.value-icon {
  width: 30px;
  height: 30px;
  background-color: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  flex-shrink: 0;
}

.value-text h4 {
  font-size: 1.1rem;
  margin-bottom: 5px;
  color: var(--dark-blue);
}

.value-text p {
  color: var(--light-text);
}

.value-prop-image img {
  width: 100%;
  max-width: 500px;
}

/* Team Section */
.team-section {
  padding: 80px 0;
  background-color: var(--white);
}

.team-section h2 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  color: var(--dark-blue);
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.team-card {
  background-color: var(--white);
  padding: 30px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.member-photo {
  width: 110px;
  height: 110px;
  margin: 0 0 20px;
  border-radius: 50%;
  overflow: hidden;
}

.member-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.team-card h3 {
  font-size: 1.3rem;
  margin-bottom: 5px;
  color: var(--dark-blue);
}

.member-position {
  font-size: 0.9rem;
  color: var(--primary-color);
  margin-bottom: 15px;
  font-weight: 500;
}

.member-bio {
  color: var(--light-text);
  font-size: 0.95rem;
}

.team-cta {
  margin-top: 40px;
}

/* CTA Section */
.cta-section {
  padding: 60px 0;
  background-color: var(--dark-blue);
  color: var(--white);
  text-align: center;
}

.cta-section h2 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  color: var(--white);
}

.cta-section p {
  font-size: 1.2rem;
  margin-bottom: 30px;
  color: rgba(255, 255, 255, 0.8);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

/* Loading and Error States */
.loading-state,
.error-state {
  text-align: center;
  padding: 100px 0;
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

.error-state button {
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  padding: 10px 20px;
  border-radius: var(--border-radius);
  cursor: pointer;
  margin-top: 20px;
  font-weight: 500;
}

/* Buttons */
.primary-button {
  background-color: var(--primary-color);
  color: var(--white);
  padding: 14px 28px;
  border-radius: var(--border-radius);
  font-weight: 500;
  display: inline-block;
  transition: background-color 0.3s ease;
}

.primary-button:hover {
  background-color: #3a5ad9;
  color: var(--white);
}

.secondary-button {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 14px 28px;
  border-radius: var(--border-radius);
  font-weight: 500;
  display: inline-block;
  transition: background-color 0.3s ease;
}

.secondary-button:hover {
  background-color: rgba(76, 111, 255, 0.2);
  color: var(--primary-color);
}

.text-button {
  font-weight: 500;
  color: var(--primary-color);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* Page Content Section */
.page-content-section {
  padding: 60px 0;
  background-color: var(--white);
}

.page-content {
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.7;
  color: var(--text-color);
}

.page-content h1,
.page-content h2,
.page-content h3,
.page-content h4,
.page-content h5,
.page-content h6 {
  color: var(--dark-blue);
  margin-bottom: 1rem;
  margin-top: 2rem;
}

.page-content h1:first-child,
.page-content h2:first-child,
.page-content h3:first-child,
.page-content h4:first-child,
.page-content h5:first-child,
.page-content h6:first-child {
  margin-top: 0;
}

.page-content p {
  margin-bottom: 1.5rem;
}

.page-content ul,
.page-content ol {
  margin-bottom: 1.5rem;
  padding-left: 2rem;
}

.page-content li {
  margin-bottom: 0.5rem;
}

.page-content a {
  color: var(--primary-color);
  text-decoration: underline;
}

.page-content a:hover {
  color: #3a5ad9;
}

/* Responsive */
@media (max-width: 992px) {
  .hero-section .container,
  .value-prop-section .container {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-graphic {
    justify-content: center;
  }

  .hero-image,
  .value-prop-image {
    margin-top: 30px;
    display: flex;
    justify-content: center;
  }

  .value-point {
    justify-content: center;
  }

  .hero-cta {
    justify-content: center;
  }

  .hero-content h1 {
    font-size: 2.5rem;
  }

  .value-prop-content h2,
  .services-section h2,
  .team-section h2,
  .cta-section h2 {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .cta-buttons {
    flex-direction: column;
    gap: 16px;
    max-width: 300px;
    margin: 0 auto;
  }
}

/* On a phone the hero has to fit the first screen, so the type steps down and
   the graphic gives up height rather than the calls to action falling below
   the fold. */
@media (max-width: 640px) {
  .hero-section {
    padding: 40px 0 44px;
  }

  .hero-eyebrow {
    margin-bottom: 14px;
    font-size: 0.76rem;
    padding: 5px 11px;
  }

  .hero-content h1 {
    font-size: 1.95rem;
    line-height: 1.15;
    margin-bottom: 14px;
    max-width: none;
  }

  .hero-lede {
    font-size: 1.02rem;
    line-height: 1.55;
    margin-bottom: 18px;
  }

  .hero-serves {
    gap: 6px 16px;
    margin-bottom: 22px;
  }

  .hero-serves li {
    font-size: 0.87rem;
  }

  .hero-graphic {
    margin-top: 26px;
  }

  .hero-anim {
    max-width: 300px;
  }
}
</style>
