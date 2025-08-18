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
      // Fallback content if no about page exists yet
      pageData.value = {
        title: 'About Generativ Consulting Company',
        content: 'The experts in AI safety and performance'
      };
    }
    
    // Get team members
    const teamResponse = await cmsAPI.getTeamMembers();
    if (teamResponse.success) {
      teamMembers.value = teamResponse.members?.filter(member => member.isActive) || [];
    } else {
      // Fallback team data
      teamMembers.value = [
        {
          id: 'leader1',
          name: 'Alex Rodriguez',
          position: 'Chief AI Safety Officer',
          bio: 'Expert in building robust testing frameworks for generative AI models with over 10 years of experience in AI safety research.',
          expertise: ['AI Testing', 'Machine Learning', 'Risk Assessment'],
          isActive: true,
          sortOrder: 1
        },
        {
          id: 'leader2',
          name: 'Jamie Lee',
          position: 'Director of Parallelization',
          bio: 'Specializes in architecting high-throughput systems for AI workloads with a background in distributed computing and cloud infrastructure.',
          expertise: ['Distributed Systems', 'Cloud Architecture', 'Performance Optimization'],
          isActive: true,
          sortOrder: 2
        },
        {
          id: 'leader3',
          name: 'Morgan Chen',
          position: 'Lead AI Educator',
          bio: 'Designs critical thinking curricula for technical and non-technical teams with a focus on responsible AI use and ethical considerations.',
          expertise: ['AI Education', 'Prompt Engineering', 'Ethical AI'],
          isActive: true,
          sortOrder: 3
        },
        {
          id: 'leader4',
          name: 'Taylor Johnson',
          position: 'Operations & Events Manager',
          bio: 'Oversees company operations and coordinates educational events and workshops with a background in project management and corporate education.',
          expertise: ['Operations', 'Event Planning', 'Project Management'],
          isActive: true,
          sortOrder: 4
        }
      ];
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
      <!-- Hero Section -->
      <section class="page-hero">
        <div class="container">
          <h1>About Us</h1>
          <p class="hero-description">
            Get to know the minds behind Generativ Consulting Company and our mission to
            accelerate industry progress through AI safety, performance, and education.
          </p>
        </div>
      </section>
      
      <!-- Mission Section -->
      <section class="mission-section">
        <div class="container">
          <div class="mission-grid">
            <div class="mission-content">
              <h2>Our Mission</h2>
              <p>
                Generativ Consulting Company exists to become the foremost experts in AI safety and performance, 
                accelerating industry progress through rigorous testing, parallelization, and critical-thinking education.
              </p>
              <p>
                We believe that AI adoption brings both tremendous opportunities and significant risks. Our mission is 
                to ensure our clients land on the right side of disruption, turning technological challenges into 
                competitive advantages.
              </p>
              <p>
                Through our comprehensive suite of services, we help organizations navigate the complexities of AI 
                implementation, ensuring their systems are not only powerful and efficient but also safe, reliable, 
                and aligned with business objectives.
              </p>
            </div>
            <div class="mission-image">
              <img src="/img/mission.jpg" alt="Our Mission" />
            </div>
          </div>
        </div>
      </section>
      
      <!-- Values Section -->
      <section class="values-section">
        <div class="container">
          <h2>Our Core Values</h2>
          <div class="values-grid">
            <div class="value-card">
              <div class="value-icon">🔍</div>
              <h3>Rigor</h3>
              <p>We approach every challenge with methodical attention to detail, ensuring our solutions are thoroughly tested and validated.</p>
            </div>
            
            <div class="value-card">
              <div class="value-icon">🚀</div>
              <h3>Innovation</h3>
              <p>We continuously explore new approaches and technologies to deliver cutting-edge solutions for our clients.</p>
            </div>
            
            <div class="value-card">
              <div class="value-icon">🤝</div>
              <h3>Partnership</h3>
              <p>We work alongside our clients as true partners, deeply understanding their needs to deliver tailored solutions.</p>
            </div>
            
            <div class="value-card">
              <div class="value-icon">🧠</div>
              <h3>Education</h3>
              <p>We believe in empowering our clients through knowledge transfer and skill building, not just providing solutions.</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Leadership Section -->
      <section class="leadership-section">
        <div class="container">
          <h2>Our Leadership Team</h2>
          <p class="section-intro">
            Meet the experts leading our initiatives in AI safety, performance, and education.
          </p>
          
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
      
      <!-- Approach Section -->
      <section class="approach-section">
        <div class="container">
          <h2>Our Approach</h2>
          <p class="section-intro">
            We follow a methodical process to ensure consistent, high-quality results.
          </p>
          
          <div class="approach-steps">
            <div class="approach-step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>Comprehensive Assessment</h3>
                <p>We begin with a thorough evaluation of your current AI systems, identifying strengths, weaknesses, and opportunities for improvement.</p>
              </div>
            </div>
            
            <div class="approach-step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h3>Strategic Planning</h3>
                <p>Based on our assessment, we develop a tailored roadmap that addresses your specific challenges and aligns with your business objectives.</p>
              </div>
            </div>
            
            <div class="approach-step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h3>Implementation</h3>
                <p>Our experts work alongside your team to implement solutions, ensuring knowledge transfer and building internal capabilities.</p>
              </div>
            </div>
            
            <div class="approach-step">
              <div class="step-number">4</div>
              <div class="step-content">
                <h3>Continuous Improvement</h3>
                <p>We maintain an ongoing relationship, providing support and regularly reassessing your systems as AI technology and your business evolve.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Timeline Section -->
      <section class="timeline-section">
        <div class="container">
          <h2>Our Journey</h2>
          
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <h3>Foundation</h3>
                <p class="timeline-date">2023</p>
                <p>Generativ Consulting Company was founded with a mission to address the growing need for AI safety and performance expertise.</p>
              </div>
            </div>
            
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <h3>Methodology Development</h3>
                <p class="timeline-date">2023</p>
                <p>Development of our proprietary "Agent See Safety Protocol" and "10x Output Speed" methodologies.</p>
              </div>
            </div>
            
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <h3>First Client Successes</h3>
                <p class="timeline-date">2024</p>
                <p>Successful implementation of our approaches with early clients, demonstrating significant improvements in AI safety and performance.</p>
              </div>
            </div>
            
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <h3>Expansion</h3>
                <p class="timeline-date">Present</p>
                <p>Growing our team and expanding our service offerings to meet the evolving needs of the AI industry.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <h2>Join Us on Our Mission</h2>
          <p>Ready to transform your AI implementation with industry-leading expertise?</p>
          <div class="cta-buttons">
            <router-link to="/contact" class="primary-button">Get in Touch</router-link>
            <router-link to="/services" class="secondary-button">Explore Our Services</router-link>
          </div>
        </div>
      </section>
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

/* Mission Section */
.mission-section {
  padding: 80px 0;
}

.mission-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.mission-content h2 {
  font-size: 2.5rem;
  color: var(--dark-blue);
  margin-bottom: 20px;
}

.mission-content p {
  margin-bottom: 20px;
  font-size: 1.1rem;
  color: var(--text-color);
  line-height: 1.6;
}

.mission-image img {
  width: 100%;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

/* Values Section */
.values-section {
  padding: 80px 0;
  background-color: var(--light-blue);
  text-align: center;
}

.values-section h2 {
  font-size: 2.5rem;
  color: var(--dark-blue);
  margin-bottom: 50px;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.value-card {
  background-color: var(--white);
  border-radius: var(--border-radius);
  padding: 30px;
  box-shadow: var(--box-shadow);
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

/* Leadership Section */
.leadership-section {
  padding: 80px 0;
}

.leadership-section h2,
.approach-section h2,
.timeline-section h2 {
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

/* Approach Section */
.approach-section {
  padding: 80px 0;
  background-color: var(--light-blue);
}

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

/* Timeline Section */
.timeline-section {
  padding: 80px 0;
}

.timeline {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50px;
  height: 100%;
  width: 2px;
  background-color: var(--primary-color);
  opacity: 0.3;
}

.timeline-item {
  margin-bottom: 50px;
  position: relative;
  padding-left: 100px;
}

.timeline-dot {
  position: absolute;
  left: 44px;
  width: 14px;
  height: 14px;
  background-color: var(--primary-color);
  border-radius: 50%;
  top: 30px;
  z-index: 2;
}

.timeline-content {
  background-color: var(--white);
  border-radius: var(--border-radius);
  padding: 25px;
  box-shadow: var(--box-shadow);
}

.timeline-content h3 {
  font-size: 1.3rem;
  color: var(--dark-blue);
  margin-bottom: 5px;
}

.timeline-date {
  font-size: 0.9rem;
  color: var(--primary-color);
  font-weight: 500;
  margin-bottom: 15px;
}

.timeline-content p:not(.timeline-date) {
  color: var(--light-text);
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
}

.secondary-button {
  background-color: transparent;
  border: 1px solid var(--white);
  color: var(--white);
  padding: 12px 24px;
  border-radius: var(--border-radius);
  font-weight: 500;
  display: inline-block;
}

.primary-button:hover {
  background-color: #3a5ad9;
  color: var(--white);
}

.secondary-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--white);
}

/* Responsive */
@media (max-width: 992px) {
  .mission-grid {
    grid-template-columns: 1fr;
  }
  
  .mission-content {
    order: 1;
  }
  
  .mission-image {
    order: 0;
    margin-bottom: 30px;
  }
  
  .page-hero h1,
  .mission-content h2,
  .values-section h2,
  .leadership-section h2,
  .approach-section h2,
  .timeline-section h2,
  .cta-section h2 {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .timeline::before {
    left: 30px;
  }
  
  .timeline-dot {
    left: 24px;
  }
  
  .timeline-item {
    padding-left: 70px;
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
