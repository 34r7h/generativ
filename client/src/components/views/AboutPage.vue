<script setup>
import { ref, onMounted } from 'vue';
import { cmsAPI } from '../../api/client';

const loading = ref(true);
const error = ref(null);
const pageData = ref(null);
const teamMembers = ref([]);

// Fetch page data
async function fetchPageData() {
  try {
    loading.value = true;
    
    // Get about page data
    const pageResponse = await cmsAPI.getPageBySlug('about');
    if (pageResponse.success && pageResponse.page) {
      pageData.value = pageResponse.page;
    } else {
      error.value = 'About page content not found';
    }
    
    // Get team members
    const teamResponse = await cmsAPI.getTeamMembers();
    if (teamResponse.success) {
      teamMembers.value = teamResponse.members?.filter(member => member.isActive) || [];
    } else {
      console.error('Failed to load team members:', teamResponse.error);
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
  <div class="about-page">
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
          <section v-if="section.type === 'hero'" class="page-hero">
            <div class="container">
              <h1>{{ section.title }}</h1>
              <p class="hero-description">{{ section.content }}</p>
            </div>
          </section>

          <!-- Content Section -->
          <section v-else-if="section.type === 'content'" class="content-section">
            <div class="container">
              <h2>{{ section.title }}</h2>
              <div class="content-text" v-html="section.content"></div>
              
              <!-- Values -->
              <div v-if="section.settings?.values" class="values-grid">
                <div 
                  v-for="value in section.settings.values" 
                  :key="value.title"
                  class="value-card"
                >
                  <div class="value-icon">{{ value.icon }}</div>
                  <h3>{{ value.title }}</h3>
                  <p>{{ value.description }}</p>
                </div>
              </div>

              <!-- Steps -->
              <div v-if="section.settings?.steps" class="approach-steps">
                <div 
                  v-for="(step, index) in section.settings.steps" 
                  :key="step.title"
                  class="approach-step"
                >
                  <div class="step-number">{{ index + 1 }}</div>
                  <div class="step-content">
                    <h3>{{ step.title }}</h3>
                    <p>{{ step.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Team Section -->
          <section v-else-if="section.type === 'team'" class="leadership-section">
            <div class="container">
              <h2>{{ section.title }}</h2>
              <p class="section-intro">{{ section.content }}</p>
              
              <div class="team-grid">
                <div 
                  v-for="member in teamMembers" 
                  :key="member.id" 
                  class="team-card"
                >
                  <div class="member-photo">
                    <img :src="member.photo?.filePath || '/img/placeholder-person.svg'" :alt="member.name" />
                  </div>
                  <h3>{{ member.name }}</h3>
                  <p class="member-position">{{ member.position }}</p>
                  <p class="member-bio">{{ member.bio }}</p>
                  
                  <div class="member-expertise" v-if="member.expertise && member.expertise.length">
                    <div 
                      v-for="(skill, index) in member.expertise" 
                      :key="index" 
                      class="expertise-tag"
                    >
                      {{ skill }}
                    </div>
                  </div>
                </div>
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
          <h1>About Us</h1>
          <p>Page content is loading...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  min-height: calc(100vh - 80px - 300px);
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

/* Page Hero */
.page-hero {
  padding: 80px 0;
  background-color: var(--light-blue);
  text-align: center;
}

.page-hero h1 {
  font-size: 3rem;
  color: var(--dark-blue);
  margin-bottom: 20px;
}

.hero-description {
  max-width: 700px;
  margin: 0 auto;
  font-size: 1.2rem;
  color: var(--light-text);
}

/* Content Section */
.content-section {
  padding: 80px 0;
}

.content-section h2 {
  font-size: 2.5rem;
  color: var(--dark-blue);
  text-align: center;
  margin-bottom: 30px;
}

.content-text {
  max-width: 800px;
  margin: 0 auto 40px;
  font-size: 1.1rem;
  color: var(--text-color);
  line-height: 1.6;
}

/* Values Grid */
.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.value-card {
  background-color: var(--white);
  border-radius: var(--border-radius);
  padding: 30px;
  box-shadow: var(--box-shadow);
  text-align: center;
  transition: transform 0.3s;
}

.value-card:hover {
  transform: translateY(-5px);
}

.value-icon {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.value-card h3 {
  font-size: 1.5rem;
  color: var(--dark-blue);
  margin-bottom: 15px;
}

.value-card p {
  color: var(--light-text);
}

/* Approach Steps */
.approach-steps {
  max-width: 800px;
  margin: 0 auto;
}

.approach-step {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  position: relative;
}

.approach-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 40px;
  left: 20px;
  height: calc(100% + 20px);
  width: 2px;
  background-color: var(--primary-color);
  opacity: 0.3;
}

.step-number {
  width: 40px;
  height: 40px;
  background-color: var(--primary-color);
  color: var(--white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.step-content h3 {
  font-size: 1.3rem;
  color: var(--dark-blue);
  margin-bottom: 10px;
}

.step-content p {
  color: var(--light-text);
  line-height: 1.6;
}

/* Leadership Section */
.leadership-section {
  padding: 80px 0;
}

.leadership-section h2 {
  font-size: 2.5rem;
  color: var(--dark-blue);
  text-align: center;
  margin-bottom: 20px;
}

.section-intro {
  max-width: 700px;
  margin: 0 auto 50px;
  text-align: center;
  font-size: 1.2rem;
  color: var(--light-text);
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.team-card {
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 30px;
  text-align: center;
}

.member-photo {
  width: 150px;
  height: 150px;
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
  font-size: 1.5rem;
  color: var(--dark-blue);
  margin-bottom: 5px;
}

.member-position {
  font-size: 1rem;
  color: var(--primary-color);
  margin-bottom: 15px;
  font-weight: 500;
}

.member-bio {
  color: var(--light-text);
  font-size: 0.95rem;
  margin-bottom: 20px;
  line-height: 1.6;
}

.member-expertise {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.expertise-tag {
  background-color: var(--light-blue);
  color: var(--primary-color);
  font-size: 0.8rem;
  padding: 5px 10px;
  border-radius: 15px;
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
  color: var(--white);
  margin-bottom: 20px;
}

.cta-section p {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.primary-button {
  background-color: var(--primary-color);
  color: var(--white);
  padding: 12px 24px;
  border-radius: var(--border-radius);
  font-weight: 500;
  display: inline-block;
  text-decoration: none;
}

.secondary-button {
  background-color: transparent;
  border: 1px solid var(--white);
  color: var(--white);
  padding: 12px 24px;
  border-radius: var(--border-radius);
  font-weight: 500;
  display: inline-block;
  text-decoration: none;
}

.primary-button:hover {
  background-color: #3a5ad9;
  color: var(--white);
}

.secondary-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--white);
}

/* Page Content Section */
.page-content-section {
  padding: 80px 0;
}

.page-content {
  max-width: 800px;
  margin: 0 auto;
  font-size: 1.1rem;
  color: var(--text-color);
  line-height: 1.6;
}

/* No Page Data */
.no-page-data {
  text-align: center;
  padding: 100px 0;
}

.no-page-data h1 {
  font-size: 2.5rem;
  color: var(--dark-blue);
  margin-bottom: 20px;
}

.no-page-data p {
  font-size: 1.2rem;
  color: var(--light-text);
}

/* Responsive */
@media (max-width: 768px) {
  .page-hero h1,
  .content-section h2,
  .leadership-section h2,
  .cta-section h2 {
    font-size: 2rem;
  }
  
  .approach-step {
    gap: 20px;
  }
  
  .cta-buttons {
    flex-direction: column;
    max-width: 250px;
    margin: 0 auto;
  }
}
</style>
