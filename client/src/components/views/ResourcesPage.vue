<script setup>
import { ref, onMounted } from 'vue';
import { cmsAPI } from '../../api/client';

const loading = ref(true);
const error = ref(null);
const blogPosts = ref([]);
const media = ref([]);

// Load resources from CMS 
async function loadResources() {
  try {
    loading.value = true;
    
    // Get blog posts as "reports"
    const blogResponse = await cmsAPI.getBlogPosts();
    if (blogResponse.success) {
      blogPosts.value = blogResponse.posts.filter(post => post.isPublished);
    }
    
    // Get media files as resources
    const mediaResponse = await cmsAPI.getAllMedia();
    if (mediaResponse.success) {
      media.value = mediaResponse.media || [];
    }
    
  } catch (err) {
    console.error('Error loading resources:', err);
    error.value = 'Failed to load resources';
  } finally {
    loading.value = false;
  }
}

// Fallback resources data for display structure
const resources = ref({
  reports: [
    {
      id: 1,
      title: 'Disruption Radar: Q3 2023',
      description: 'Analysis of industries facing the highest AI disruption risk and opportunities.',
      type: 'PDF',
      date: 'September 2023'
    },
    {
      id: 2,
      title: 'AI Safety Benchmarks',
      description: 'Industry standards for measuring and improving AI system safety.',
      type: 'PDF',
      date: 'August 2023'
    }
  ],
  playbooks: [
    {
      id: 1,
      title: 'Critical Thinking in AI: A Playbook',
      description: 'Practical exercises and frameworks for developing AI-complementary thinking skills.',
      type: 'Interactive',
      date: 'July 2023'
    }
  ],
  caseStudies: [
    {
      id: 1,
      title: 'Financial Services: Reducing Hallucinations in Customer Advice',
      description: 'How a major financial institution improved the safety and accuracy of their AI advisory systems.',
      type: 'Case Study',
      date: 'August 2023'
    },
    {
      id: 2,
      title: 'Healthcare: 10x Performance for Diagnostic Systems',
      description: 'Parallelization techniques that dramatically improved processing time for medical imaging.',
      type: 'Case Study',
      date: 'July 2023'
    }
  ]
});

onMounted(() => {
  loadResources();
});
</script>

<template>
  <div class="resources-page">
    <!-- Hero Section -->
    <section class="page-hero">
      <div class="container">
        <h1>Resources</h1>
        <p class="hero-description">
          Access our reports, playbooks, and case studies on AI safety, performance, and education.
        </p>
      </div>
    </section>
    
    <!-- Disruption Radar Section -->
    <section class="resources-section">
      <div class="container">
        <div class="section-header">
          <h2>Disruption Radar Reports</h2>
          <p class="section-description">
            Regular analysis of industries facing the highest AI disruption risk, with practical guidance on navigating these changes.
          </p>
        </div>
        
        <div class="resources-grid">
          <div 
            v-for="report in resources.reports" 
            :key="report.id" 
            class="resource-card"
          >
            <div class="resource-type">{{ report.type }}</div>
            <h3>{{ report.title }}</h3>
            <p class="resource-description">{{ report.description }}</p>
            <div class="resource-meta">
              <span class="resource-date">{{ report.date }}</span>
            </div>
            <a href="#" class="resource-download">
              Download Report
            </a>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Playbooks Section -->
    <section class="resources-section alt-bg">
      <div class="container">
        <div class="section-header">
          <h2>AI Education Playbooks</h2>
          <p class="section-description">
            Practical guides to developing critical thinking and AI literacy within your organization.
          </p>
        </div>
        
        <div class="resources-grid">
          <div 
            v-for="playbook in resources.playbooks" 
            :key="playbook.id" 
            class="resource-card"
          >
            <div class="resource-type">{{ playbook.type }}</div>
            <h3>{{ playbook.title }}</h3>
            <p class="resource-description">{{ playbook.description }}</p>
            <div class="resource-meta">
              <span class="resource-date">{{ playbook.date }}</span>
            </div>
            <a href="#" class="resource-download">
              Access Playbook
            </a>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Case Studies Section -->
    <section class="resources-section">
      <div class="container">
        <div class="section-header">
          <h2>Client Case Studies</h2>
          <p class="section-description">
            Real-world examples of how organizations have successfully implemented our methodologies.
          </p>
        </div>
        
        <div class="resources-grid">
          <div 
            v-for="caseStudy in resources.caseStudies" 
            :key="caseStudy.id" 
            class="resource-card"
          >
            <div class="resource-type">{{ caseStudy.type }}</div>
            <h3>{{ caseStudy.title }}</h3>
            <p class="resource-description">{{ caseStudy.description }}</p>
            <div class="resource-meta">
              <span class="resource-date">{{ caseStudy.date }}</span>
            </div>
            <a href="#" class="resource-download">
              Read Case Study
            </a>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Request Resources Section -->
    <section class="request-section">
      <div class="container">
        <h2>Need Customized Resources?</h2>
        <p>
          Our team can develop tailored resources for your organization's specific AI safety and performance needs.
        </p>
        <router-link to="/contact" class="primary-button">Contact Us</router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.resources-page {
  min-height: calc(100vh - 80px - 300px);
}

/* Hero Section */
.page-hero {
  padding: 80px 0;
  background-color: var(--light-blue);
  text-align: center;
}

.page-hero h1 {
  font-size: 3rem;
  color: var(--dark-blue);
  margin-bottom: 1rem;
}

.hero-description {
  max-width: 700px;
  margin: 0 auto;
  font-size: 1.2rem;
  color: var(--light-text);
}

/* Resources Sections */
.resources-section {
  padding: 80px 0;
}

.resources-section.alt-bg {
  background-color: var(--light-blue);
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-header h2 {
  font-size: 2rem;
  color: var(--dark-blue);
  margin-bottom: 15px;
}

.section-description {
  max-width: 700px;
  margin: 0 auto;
  font-size: 1.1rem;
  color: var(--light-text);
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.resource-card {
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 30px;
  transition: transform 0.3s;
}

.resource-card:hover {
  transform: translateY(-5px);
}

.resource-type {
  display: inline-block;
  background-color: var(--primary-color);
  color: var(--white);
  font-size: 0.8rem;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 15px;
  margin-bottom: 15px;
}

.resource-card h3 {
  font-size: 1.4rem;
  color: var(--dark-blue);
  margin-bottom: 15px;
  line-height: 1.3;
}

.resource-description {
  color: var(--light-text);
  margin-bottom: 20px;
  line-height: 1.6;
}

.resource-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--light-text);
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.resource-download {
  color: var(--primary-color);
  font-weight: 500;
  display: inline-block;
}

.resource-download:hover {
  text-decoration: underline;
}

/* Request Section */
.request-section {
  padding: 60px 0;
  background-color: var(--dark-blue);
  color: var(--white);
  text-align: center;
}

.request-section h2 {
  font-size: 2rem;
  margin-bottom: 15px;
}

.request-section p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.primary-button {
  background-color: var(--primary-color);
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

/* Responsive */
@media (max-width: 768px) {
  .page-hero h1,
  .request-section h2 {
    font-size: 2.5rem;
  }
  
  .section-header h2 {
    font-size: 1.8rem;
  }
}
</style>
