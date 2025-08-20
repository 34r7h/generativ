<script setup>
import { ref, onMounted } from 'vue';
import { cmsAPI } from '../../api/client';
import heroImage from '../../assets/images/hero-image.svg';
import placeholderPerson from '../../assets/images/placeholder-person.svg';

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
        services.value = servicesResponse.services || [];
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
                <h1>{{ section.title }}</h1>
                <p>{{ section.content }}</p>
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
              <div class="hero-image">
                <img :src="heroImage" alt="AI Safety and Performance" />
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
                  <div class="service-icon" v-if="service.icon">{{ service.icon }}</div>
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
              
              <!-- Value Points -->
              <div v-if="section.settings?.valuePoints" class="value-points">
                <div 
                  v-for="point in section.settings.valuePoints" 
                  :key="point.title"
                  class="value-point"
                >
                  <div class="value-icon">✓</div>
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
                {{ section.settings.ctaText }} →
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
                <div
                  v-for="member in teamMembers.slice(0, section.settings?.showMembers || 3)"
                  :key="member.id"
                  class="team-card"
                >
                  <div class="member-photo">
                    <img :src="member.photo?.filePath || placeholderPerson" :alt="member.name" />
                  </div>
                  <h3>{{ member.name }}</h3>
                  <p class="member-position">{{ member.position }}</p>
                  <p class="member-bio">{{ member.bio }}</p>
                </div>
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
  padding: 80px 0;
  background: linear-gradient(135deg, var(--light-blue), #f0f7ff);
}

.hero-section .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.hero-content h1 {
  font-size: 3rem;
  line-height: 1.2;
  margin-bottom: 24px;
  color: var(--black);
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
  max-width: 800px;
  margin: 0 auto 40px auto;
  line-height: 1.7;
  color: var(--text-color);
}

.content-section .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.content-section h2 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  color: var(--black);
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
  text-align: center;
  margin-bottom: 60px;
}

.section-intro {
  max-width: 600px;
  margin: 0 auto;
  font-size: 1.2rem;
  color: var(--light-text);
}

.services-section h2,
.team-section h2 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  color: var(--black);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.service-card {
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
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.service-card h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: var(--dark-blue);
}

.service-card p {
  color: var(--light-text);
  margin-bottom: 20px;
}

.service-link {
  display: inline-block;
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
  color: var(--black);
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
  text-align: center;
  margin-bottom: 16px;
  color: var(--black);
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.team-card {
  background-color: var(--white);
  padding: 30px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  text-align: center;
}

.member-photo {
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
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
  text-align: center;
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
  background-color: rgba(76, 111, 255, 0.1);
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
  display: inline-block;
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
  color: var(--black);
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
</style>
