<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { cmsAPI } from '../../api/client';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const error = ref(null);
const service = ref(null);
const otherServices = ref([]);

// Get service slug from route
const slug = computed(() => route.params.slug);

// Fallback data for services if CMS has no content yet
const fallbackServices = {
  'safety-testing': {
    id: 'safety',
    title: 'AI Safety Testing',
    slug: 'safety-testing',
    icon: '🔒',
    shortDescription: 'Rigorous testing methodologies to ensure your AI systems operate safely and reliably.',
    fullDescription: `
      <p>Our AI Safety Testing service provides comprehensive evaluation and verification of your AI systems to ensure they operate reliably, safely, and in alignment with your business objectives.</p>
      
      <p>We employ a suite of advanced testing methodologies specifically designed for machine learning and generative AI models, focusing on identifying potential vulnerabilities, hallucinations, and compliance issues before they impact your business.</p>
      
      <h3>The Agent See Safety Protocol</h3>
      
      <p>Our proprietary testing methodology includes:</p>
      
      <ul>
        <li><strong>Red Team Testing:</strong> Adversarial prompting to uncover potential vulnerabilities</li>
        <li><strong>Output Validation:</strong> Systematic verification of AI-generated content and code</li>
        <li><strong>Compliance Checking:</strong> Ensuring outputs meet regulatory and ethical standards</li>
        <li><strong>Edge Case Analysis:</strong> Stress testing with unusual or boundary inputs</li>
        <li><strong>Continuous Monitoring:</strong> Ongoing evaluation during deployment</li>
      </ul>
    `,
    benefits: [
      'Identify and mitigate hallucination risks',
      'Reduce security vulnerabilities',
      'Ensure compliance with standards and regulations',
      'Improve reliability of AI-generated outputs',
      'Prevent costly errors and brand damage'
    ],
    featuredImage: '/img/ai-safety-testing.jpg',
    pricing: 'Starting at $15,000 per assessment'
  },
  'parallelization': {
    id: 'parallel',
    title: 'Parallelization Infrastructure',
    slug: 'parallelization',
    icon: '⚡',
    shortDescription: 'Speed up your AI workflows with state-of-the-art parallelization techniques and infrastructure.',
    fullDescription: `
      <p>Our Parallelization Infrastructure service helps organizations dramatically accelerate their AI workflows through advanced orchestration, batching, and resource optimization strategies.</p>
      
      <p>Whether you're running large language models, training complex neural networks, or processing vast amounts of data, our solutions can help you achieve up to 10x performance improvements while optimizing resource utilization.</p>
      
      <h3>The 10x Output Speed Methodology</h3>
      
      <p>Our approach to parallelization includes:</p>
      
      <ul>
        <li><strong>Workflow Analysis:</strong> Identifying bottlenecks and parallelization opportunities</li>
        <li><strong>Architecture Design:</strong> Creating scalable infrastructure tailored to your needs</li>
        <li><strong>Resource Orchestration:</strong> Intelligent allocation of computing resources</li>
        <li><strong>Batch Processing Systems:</strong> Optimized handling of large-scale workloads</li>
        <li><strong>Performance Monitoring:</strong> Continuous evaluation and tuning</li>
      </ul>
    `,
    benefits: [
      'Accelerate processing times by up to 10x',
      'Reduce infrastructure costs through optimization',
      'Scale seamlessly with demand',
      'Improve team productivity and output',
      'Enable more complex AI applications'
    ],
    featuredImage: '/img/parallelization.jpg',
    pricing: 'Custom pricing based on infrastructure needs'
  },
  'critical-thinking': {
    id: 'critical',
    title: 'Critical Thinking Education',
    slug: 'critical-thinking',
    icon: '🧠',
    shortDescription: 'Equip your team with the critical thinking skills needed to work effectively with AI systems.',
    fullDescription: `
      <p>Our Critical Thinking Education service builds the essential cognitive skills your team needs to effectively evaluate, refine, and leverage AI-generated outputs in your business processes.</p>
      
      <p>As AI becomes increasingly integrated into workflows, the ability to think critically about its outputs becomes a crucial competitive advantage. Our training programs focus on developing practical skills that immediately enhance your team's effectiveness with AI tools.</p>
      
      <h3>The AI Intuition Framework</h3>
      
      <p>Our education programs cover:</p>
      
      <ul>
        <li><strong>Prompt Engineering:</strong> Crafting effective prompts to achieve desired outcomes</li>
        <li><strong>Output Evaluation:</strong> Systematic approaches to assessing AI-generated content</li>
        <li><strong>Error Recognition:</strong> Identifying subtle inaccuracies and hallucinations</li>
        <li><strong>Content Refinement:</strong> Techniques for enhancing and correcting AI outputs</li>
        <li><strong>Ethical Considerations:</strong> Navigating the moral implications of AI use</li>
      </ul>
    `,
    benefits: [
      'Enhance team members\' ability to work effectively with AI',
      'Improve prompt engineering capabilities',
      'Develop failure analysis skills',
      'Reduce dependence on external consultants',
      'Create a culture of responsible AI use'
    ],
    featuredImage: '/img/critical-thinking.jpg',
    pricing: 'Workshop packages starting at $5,000'
  }
};

// Fetch service data
async function fetchServiceData() {
  try {
    loading.value = true;
    error.value = null;
    
    // Try to fetch from API
    const response = await cmsAPI.getServiceBySlug(slug.value);
    
    if (response.success && response.service) {
      service.value = response.service;
    } else {
      // Use fallback data if service not found in CMS
      if (fallbackServices[slug.value]) {
        service.value = fallbackServices[slug.value];
      } else {
        error.value = 'Service not found';
        return;
      }
    }
    
    // Fetch other services for related section
    const servicesResponse = await cmsAPI.getServices();
    if (servicesResponse.success && servicesResponse.services) {
      otherServices.value = servicesResponse.services.filter(s => s.id !== service.value.id).slice(0, 2);
    } else {
      // Use fallback services if API doesn't return services
      otherServices.value = Object.values(fallbackServices)
        .filter(s => s.slug !== slug.value)
        .slice(0, 2);
    }
    
    loading.value = false;
  } catch (err) {
    console.error('Error fetching service data:', err);
    error.value = 'Failed to load service details';
    loading.value = false;
  }
}

onMounted(() => {
  fetchServiceData();
});
</script>

<template>
  <div class="service-detail-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading service details...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="container">
        <h1>Service Not Found</h1>
        <p>{{ error }}</p>
        <div class="error-actions">
          <router-link to="/services" class="primary-button">View All Services</router-link>
          <button @click="router.back()" class="secondary-button">Go Back</button>
        </div>
      </div>
    </div>
    
    <!-- Service Content -->
    <div v-else>
      <!-- Hero Section -->
      <section class="service-hero" :class="`service-${service.slug}-hero`">
        <div class="container">
          <div class="service-hero-content">
            <div v-if="service.icon" class="service-icon">{{ service.icon }}</div>
            <h1>{{ service.title }}</h1>
            <p class="service-intro">{{ service.shortDescription }}</p>
            <router-link to="/contact" class="primary-button">Request This Service</router-link>
          </div>
          <div class="service-hero-image" v-if="service.featuredImage">
            <img :src="service.featuredImage" :alt="service.title" />
          </div>
        </div>
      </section>
      
      <!-- Main Content Section -->
      <section class="service-main-content">
        <div class="container">
          <div class="service-content-grid">
            <div class="service-description">
              <div v-html="service.fullDescription"></div>
            </div>
            
            <div class="service-sidebar">
              <div class="service-benefits">
                <h3>Key Benefits</h3>
                <ul>
                  <li v-for="(benefit, index) in service.benefits" :key="index">
                    {{ benefit }}
                  </li>
                </ul>
              </div>
              
              <div class="service-pricing" v-if="service.pricing">
                <h3>Pricing</h3>
                <p>{{ service.pricing }}</p>
              </div>
              
              <div class="service-cta">
                <h3>Ready to Get Started?</h3>
                <router-link to="/contact" class="primary-button">Contact Us</router-link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Related Services -->
      <section class="related-services">
        <div class="container">
          <h2>Explore Other Services</h2>
          
          <div class="related-services-grid">
            <div 
              v-for="otherService in otherServices" 
              :key="otherService.id" 
              class="service-card"
            >
              <div class="service-icon" v-if="otherService.icon">{{ otherService.icon }}</div>
              <h3>{{ otherService.title }}</h3>
              <p>{{ otherService.shortDescription }}</p>
              <router-link :to="`/services/${otherService.slug}`" class="service-link">
                Learn More
              </router-link>
            </div>
          </div>
        </div>
      </section>
      
      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <h2>Ready to Transform Your AI Implementation?</h2>
          <p>Schedule a free consultation with our experts to discuss your needs.</p>
          <div class="cta-buttons">
            <router-link to="/contact" class="primary-button">Request Consultation</router-link>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.service-detail-page {
  min-height: calc(100vh - 80px - 300px);
}

/* Loading and Error States */
.loading-state,
.error-state {
  padding: 100px 0;
  text-align: center;
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

.error-actions {
  margin-top: 30px;
  display: flex;
  gap: 15px;
  justify-content: center;
}

/* Service Hero */
.service-hero {
  padding: 80px 0;
  background-color: var(--light-blue);
}

.service-hero .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.service-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.service-hero-content h1 {
  font-size: 2.8rem;
  color: var(--dark-blue);
  margin-bottom: 15px;
}

.service-intro {
  font-size: 1.2rem;
  color: var(--light-text);
  margin-bottom: 30px;
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

.service-hero-image img {
  width: 100%;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

/* Service Content */
.service-main-content {
  padding: 80px 0;
}

.service-content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

.service-description {
  font-size: 1.05rem;
  color: var(--text-color);
}

.service-description :deep(h3) {
  font-size: 1.6rem;
  color: var(--dark-blue);
  margin: 30px 0 15px;
}

.service-description :deep(p) {
  margin-bottom: 20px;
  line-height: 1.7;
}

.service-description :deep(ul) {
  margin-bottom: 20px;
  padding-left: 20px;
}

.service-description :deep(li) {
  margin-bottom: 10px;
}

/* Service Sidebar */
.service-sidebar {
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 30px;
  position: sticky;
  top: 100px;
}

.service-benefits {
  margin-bottom: 30px;
}

.service-sidebar h3 {
  font-size: 1.3rem;
  color: var(--dark-blue);
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.service-benefits ul {
  list-style-type: none;
  padding: 0;
}

.service-benefits li {
  padding-left: 25px;
  position: relative;
  margin-bottom: 12px;
  color: var(--text-color);
}

.service-benefits li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: var(--primary-color);
}

.service-pricing {
  margin-bottom: 30px;
}

.service-pricing p {
  color: var(--text-color);
}

.service-cta {
  text-align: center;
  background-color: var(--light-blue);
  padding: 20px;
  border-radius: var(--border-radius);
}

.service-cta h3 {
  border-bottom: none;
}

.service-cta .primary-button {
  width: 100%;
  text-align: center;
}

/* Related Services */
.related-services {
  padding: 60px 0;
  background-color: var(--light-blue);
}

.related-services h2 {
  text-align: center;
  font-size: 2rem;
  color: var(--dark-blue);
  margin-bottom: 30px;
}

.related-services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.service-card {
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 30px;
  transition: transform 0.3s;
}

.service-card:hover {
  transform: translateY(-5px);
}

.service-card h3 {
  font-size: 1.4rem;
  color: var(--dark-blue);
  margin: 15px 0 10px;
}

.service-card p {
  color: var(--light-text);
  margin-bottom: 20px;
}

.service-link {
  color: var(--primary-color);
  font-weight: 500;
  display: inline-block;
}

.service-link:hover {
  text-decoration: underline;
}

/* CTA Section */
.cta-section {
  padding: 60px 0;
  background-color: var(--dark-blue);
  color: var(--white);
  text-align: center;
}

.cta-section h2 {
  font-size: 2rem;
  margin-bottom: 15px;
}

.cta-section p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  justify-content: center;
}

.secondary-button {
  background-color: transparent;
  border: 1px solid var(--white);
  color: var(--white);
  padding: 12px 24px;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
}

.secondary-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Service-specific styling */
.service-safety-testing-hero {
  background: linear-gradient(135deg, #edf2f7, #e2e8f0);
}

.service-parallelization-hero {
  background: linear-gradient(135deg, #ebf8ff, #bee3f8);
}

.service-critical-thinking-hero {
  background: linear-gradient(135deg, #f0fff4, #c6f6d5);
}

/* Responsive */
@media (max-width: 992px) {
  .service-hero .container,
  .service-content-grid {
    grid-template-columns: 1fr;
  }
  
  .service-hero-content {
    text-align: center;
  }
  
  .service-hero-content h1 {
    font-size: 2.3rem;
  }
}

@media (max-width: 768px) {
  .service-sidebar {
    position: static;
  }
  
  .error-actions {
    flex-direction: column;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
