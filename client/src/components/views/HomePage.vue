<script setup>
import { ref, onMounted } from 'vue';
import { cmsAPI } from '../../api/client';

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
        // Fallback content if no home page exists yet
        pageData.value = {
          title: 'Generativ Consulting Company',
          content: 'The experts in AI safety and performance',
          sections: [
            {
              id: 'hero',
              type: 'hero',
              title: 'Where AI Speed Meets Human Trust',
              content: 'The foremost experts in AI safety and performance, accelerating industry progress through rigorous testing, parallelization, and critical-thinking education.',
              sortOrder: 1,
              settings: {
                ctaPrimary: {
                  text: 'Get Started',
                  url: '/contact'
                },
                ctaSecondary: {
                  text: 'Explore Services',
                  url: '/services'
                }
              }
            }
          ]
        };
        console.log('Using fallback home page data');
      }
    } catch (pageError) {
      console.error('Failed to load home page:', pageError);
      // Set fallback data
      pageData.value = {
        title: 'Generativ Consulting Company',
        content: 'The experts in AI safety and performance'
      };
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
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container">
          <div class="hero-content">
            <h1>Where AI Speed Meets Human Trust</h1>
            <p>The foremost experts in AI safety and performance, accelerating industry progress through rigorous testing, parallelization, and critical-thinking education.</p>
            <div class="hero-cta">
              <router-link to="/contact" class="primary-button">Get Started</router-link>
              <router-link to="/services" class="secondary-button">Explore Services</router-link>
            </div>
          </div>
          <div class="hero-image">
            <img src="/img/hero-image.svg" alt="AI Safety and Performance" />
          </div>
        </div>
      </section>
      
      <!-- Services Section -->
      <section class="services-section">
        <div class="container">
          <h2>Our Services</h2>
          <p class="section-intro">We help organizations navigate AI adoption safely and effectively.</p>
          
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
          
          <!-- Fallback if no services exist yet -->
          <div class="services-grid" v-else>
            <div class="service-card">
              <div class="service-icon">🔒</div>
              <h3>AI Safety Testing</h3>
              <p>Rigorous testing methodologies to ensure your AI systems operate safely and reliably.</p>
              <router-link to="/services/safety-testing" class="service-link">
                Learn More
              </router-link>
            </div>
            
            <div class="service-card">
              <div class="service-icon">⚡</div>
              <h3>Parallelization Infrastructure</h3>
              <p>Speed up your AI workflows with state-of-the-art parallelization techniques and infrastructure.</p>
              <router-link to="/services/parallelization" class="service-link">
                Learn More
              </router-link>
            </div>
            
            <div class="service-card">
              <div class="service-icon">🧠</div>
              <h3>Critical Thinking Education</h3>
              <p>Equip your team with the critical thinking skills needed to work effectively with AI systems.</p>
              <router-link to="/services/critical-thinking" class="service-link">
                Learn More
              </router-link>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Value Proposition -->
      <section class="value-prop-section">
        <div class="container">
          <div class="value-prop-content">
            <h2>Navigate AI Disruption With Confidence</h2>
            <p>In an era where AI adoption determines career trajectories and business outcomes, our expertise ensures you land on the right side of disruption.</p>
            <div class="value-points">
              <div class="value-point">
                <div class="value-icon">✓</div>
                <div class="value-text">
                  <h4>Testing Frameworks</h4>
                  <p>Comprehensive validation of AI outputs across code, text, and visual content.</p>
                </div>
              </div>
              
              <div class="value-point">
                <div class="value-icon">✓</div>
                <div class="value-text">
                  <h4>Output Acceleration</h4>
                  <p>10x productivity through intelligent parallelization techniques.</p>
                </div>
              </div>
              
              <div class="value-point">
                <div class="value-icon">✓</div>
                <div class="value-text">
                  <h4>Risk Mitigation</h4>
                  <p>Identify and address AI vulnerabilities before they impact your business.</p>
                </div>
              </div>
            </div>
            
            <router-link to="/about" class="text-button">Learn About Our Approach →</router-link>
          </div>
          <div class="value-prop-image">
            <img src="/img/value-prop.svg" alt="AI Value Proposition" />
          </div>
        </div>
      </section>
      
      <!-- Team Section -->
      <section class="team-section">
        <div class="container">
          <h2>Our Expert Team</h2>
          <p class="section-intro">Meet the minds behind our innovative approaches to AI safety and performance.</p>
          
          <div class="team-grid" v-if="teamMembers.length">
            <div 
              v-for="member in teamMembers.slice(0, 3)" 
              :key="member.id" 
              class="team-card"
            >
              <div class="member-photo">
                <img :src="member.photo?.filePath || '/img/placeholder-person.svg'" :alt="member.name" />
              </div>
              <h3>{{ member.name }}</h3>
              <p class="member-position">{{ member.position }}</p>
              <p class="member-bio">{{ member.bio }}</p>
            </div>
          </div>
          
          <!-- Fallback if no team members exist yet -->
          <div class="team-grid" v-else>
            <div class="team-card">
              <div class="member-photo">
                <img src="/img/placeholder-person.svg" alt="Team Member" />
              </div>
              <h3>Alex Rodriguez</h3>
              <p class="member-position">Chief AI Safety Officer</p>
              <p class="member-bio">Expert in building robust testing frameworks for generative AI models.</p>
            </div>
            
            <div class="team-card">
              <div class="member-photo">
                <img src="/img/placeholder-person.svg" alt="Team Member" />
              </div>
              <h3>Jamie Lee</h3>
              <p class="member-position">Director of Parallelization</p>
              <p class="member-bio">Specializes in architecting high-throughput systems for AI workloads.</p>
            </div>
            
            <div class="team-card">
              <div class="member-photo">
                <img src="/img/placeholder-person.svg" alt="Team Member" />
              </div>
              <h3>Morgan Chen</h3>
              <p class="member-position">Lead AI Educator</p>
              <p class="member-bio">Designs critical thinking curricula for technical and non-technical teams.</p>
            </div>
          </div>
          
          <div class="team-cta">
            <router-link to="/team" class="secondary-button">Meet The Full Team</router-link>
          </div>
        </div>
      </section>
      
      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <h2>Ready to Bulletproof Your AI Deployment?</h2>
          <p>Turn disruption from a threat into a career catalyst with our expert guidance.</p>
          <div class="cta-buttons">
            <router-link to="/contact" class="primary-button">Request Free Assessment</router-link>
            <router-link to="/resources/disruption-radar" class="secondary-button">Read Disruption Radar</router-link>
          </div>
        </div>
      </section>
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

/* Services Section */
.services-section {
  padding: 80px 0;
  background-color: var(--white);
}

.section-intro {
  max-width: 600px;
  margin: 0 auto 40px;
  text-align: center;
  font-size: 1.2rem;
  color: var(--light-text);
}

.services-section h2 {
  font-size: 2.5rem;
  text-align: center;
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
