<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { cmsAPI } from '../../api/client';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const error = ref(null);
const currentResource = ref(null);

const slug = computed(() => route.params.slug);

// Load currentResource data
async function loadResource() {
  try {
    loading.value = true;
    
    // Try to get as blog post first
    const blogResponse = await cmsAPI.getBlogPostBySlug(slug.value);
    if (blogResponse.success && blogResponse.post) {
      currentResource.value = {
        ...blogResponse.post,
        type: 'Report',
        date: new Date(blogResponse.post.publishedAt || blogResponse.post.createdAt).toLocaleDateString()
      };
    } else {
      error.value = 'Resource not found';
    }
  } catch (err) {
    console.error('Error loading currentResource:', err);
    error.value = 'Failed to load currentResource';
  } finally {
    loading.value = false;
  }
}

// Fallback currentResource data
const currentResourceData = {
  'disruption-radar': {
    title: 'Disruption Radar: Q3 2023',
    type: 'Report',
    date: 'September 2023',
    summary: 'A comprehensive analysis of industries facing high AI disruption risk and strategies to navigate these changes.',
    content: `
      <h2>Executive Summary</h2>
      <p>The Q3 2023 Disruption Radar identifies financial services, healthcare, and content creation as the sectors experiencing the most significant AI-driven disruption. Organizations in these sectors face both substantial risks and opportunities, with the potential for AI to dramatically reshape job functions, workflows, and competitive dynamics.</p>
      
      <h2>Key Findings</h2>
      
      <h3>Financial Services</h3>
      <p>AI systems are increasingly handling complex financial analysis previously performed by human analysts. Organizations that effectively implement AI safety protocols show 35% fewer errors in AI-generated financial advice compared to those without such protocols.</p>
      
      <h3>Healthcare</h3>
      <p>Diagnostic AI systems continue to approach or exceed human-level performance in specific domains. Healthcare providers using parallelized AI architectures report processing speeds up to 8x faster than conventional implementations.</p>
      
      <h3>Content Creation</h3>
      <p>AI-generated content now accounts for approximately 28% of first-draft marketing materials across surveyed organizations. Teams with strong critical thinking training demonstrate 40% better ability to effectively refine AI outputs.</p>
      
      <h2>Recommendations</h2>
      
      <ul>
        <li>Implement comprehensive safety testing for all customer-facing AI systems</li>
        <li>Invest in parallelization infrastructure to maintain competitive processing speeds</li>
        <li>Develop critical thinking training programs focused on effectively working with AI</li>
        <li>Create clear workflows that combine AI capabilities with human expertise</li>
      </ul>
    `,
    relatedResources: ['critical-thinking-playbook', 'financial-services-case-study']
  },
  'critical-thinking-playbook': {
    title: 'Critical Thinking in AI: A Playbook',
    type: 'Playbook',
    date: 'July 2023',
    summary: 'A practical guide to developing the critical thinking skills needed to effectively work with AI systems.',
    content: `
      <h2>Introduction</h2>
      <p>As AI becomes more integrated into workflows across organizations, the ability to think critically about AI outputs becomes increasingly valuable. This playbook provides exercises, frameworks, and best practices to help teams develop these essential skills.</p>
      
      <h2>Core Skill Areas</h2>
      
      <h3>AI Output Evaluation</h3>
      <p>The ability to critically assess AI-generated content is fundamental. This section provides a structured framework for evaluating outputs based on accuracy, relevance, coherence, and potential biases.</p>
      
      <h3>Effective Prompt Engineering</h3>
      <p>Crafting clear, specific prompts is essential for getting optimal results from AI systems. This section covers principles and techniques for effective prompt design across different AI applications.</p>
      
      <h3>Context Recognition</h3>
      <p>Understanding when to rely on AI and when human judgment is necessary requires contextual intelligence. We provide guidelines for identifying scenarios where AI limitations necessitate greater human oversight.</p>
      
      <h2>Training Exercises</h2>
      
      <p>The playbook includes practical exercises for teams to develop these skills:</p>
      
      <ul>
        <li>AI Output Comparison: Evaluating outputs from different prompts</li>
        <li>Bias Detection Workshop: Identifying subtle biases in AI-generated content</li>
        <li>Prompt Optimization Lab: Iteratively improving prompts for better results</li>
        <li>Context Scenario Role-Play: Practicing decision-making about AI use</li>
      </ul>
    `,
    relatedResources: ['disruption-radar', 'healthcare-case-study']
  },
  'financial-services-case-study': {
    title: 'Financial Services: Reducing Hallucinations in Customer Advice',
    type: 'Case Study',
    date: 'August 2023',
    summary: 'How a major financial institution improved the safety and accuracy of their AI advisory systems.',
    content: `
      <h2>Client Background</h2>
      <p>A leading financial services firm was implementing AI-powered advisory systems to provide personalized financial guidance to clients. However, they encountered concerning instances of "hallucinations" where the AI provided plausible but factually incorrect information.</p>
      
      <h2>Challenge</h2>
      <p>The firm needed to significantly reduce hallucinations while maintaining the personalization and efficiency benefits of their AI system. Incorrect financial advice could lead to regulatory issues, financial losses, and damaged client relationships.</p>
      
      <h2>Solution</h2>
      
      <p>Our team implemented a comprehensive approach:</p>
      
      <ul>
        <li><strong>Safety Protocol Implementation:</strong> We developed a custom version of our Agent See Safety Protocol specifically for financial advisory content.</li>
        <li><strong>Red Team Testing:</strong> We established adversarial testing processes designed to identify potential hallucinations before they reached clients.</li>
        <li><strong>Critical Thinking Training:</strong> We trained human advisors to effectively evaluate AI-generated content before client delivery.</li>
        <li><strong>Feedback Loop System:</strong> We implemented mechanisms to capture and utilize client and advisor feedback to continuously improve the system.</li>
      </ul>
      
      <h2>Results</h2>
      
      <p>After implementing our approach:</p>
      
      <ul>
        <li>Hallucinations in financial advice decreased by 92%</li>
        <li>Human advisor time spent reviewing AI outputs decreased by 45%</li>
        <li>Client satisfaction with advice increased by 27%</li>
        <li>The firm maintained full regulatory compliance</li>
      </ul>
    `,
    relatedResources: ['disruption-radar', 'critical-thinking-playbook']
  },
  'healthcare-case-study': {
    title: 'Healthcare: 10x Performance for Diagnostic Systems',
    type: 'Case Study',
    date: 'July 2023',
    summary: 'Parallelization techniques that dramatically improved processing time for medical imaging.',
    content: `
      <h2>Client Background</h2>
      <p>A healthcare network operating multiple hospitals and imaging centers was using AI for medical image analysis but experiencing processing delays that were impacting patient care timelines.</p>
      
      <h2>Challenge</h2>
      <p>The client's existing AI infrastructure required an average of 45 minutes to process complex imaging studies, creating bottlenecks in care delivery and limiting the system's usefulness in time-sensitive scenarios.</p>
      
      <h2>Solution</h2>
      
      <p>We implemented our parallelization methodology:</p>
      
      <ul>
        <li><strong>Workflow Analysis:</strong> We identified bottlenecks and parallelization opportunities in their existing system.</li>
        <li><strong>Infrastructure Redesign:</strong> We implemented a hybrid parallelization approach combining data, model, and pipeline parallelism.</li>
        <li><strong>Resource Orchestration:</strong> We developed a dynamic currentResource allocation system to optimize computing currentResource utilization.</li>
        <li><strong>Safety Integration:</strong> Throughout implementation, we maintained rigorous testing to ensure accuracy remained high.</li>
      </ul>
      
      <h2>Results</h2>
      
      <p>After implementing our approach:</p>
      
      <ul>
        <li>Average processing time decreased from 45 minutes to 4.2 minutes (10.7x improvement)</li>
        <li>System was able to handle 860% more concurrent requests</li>
        <li>Diagnostic accuracy remained at pre-optimization levels (99.3%)</li>
        <li>Infrastructure costs decreased by 32% due to more efficient currentResource utilization</li>
        <li>Emergency department wait times decreased by an average of 27 minutes</li>
      </ul>
    `,
    relatedResources: ['disruption-radar', 'critical-thinking-playbook']
  }
};





// Related currentResources
const relatedResources = computed(() => {
  if (!currentResource.value || !currentResource.value.relatedResources) return [];
  
  return currentResource.value.relatedResources
    .map(slug => ({
      slug,
      ...currentResourceData[slug]
    }))
    .slice(0, 2);
});

function goBack() {
  router.push('/currentResources');
}

onMounted(() => {
  loadResource();
});
</script>

<template>
  <div class="currentResource-detail-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading currentResource...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <h2>Resource Not Found</h2>
      <p>{{ error }}</p>
      <button @click="goBack" class="btn btn-primary">Back to Resources</button>
    </div>
    
    <div v-else-if="resource || currentResource">
      <!-- Resource Header -->
      <section class="resource-header">
        <div class="container">
          <div class="resource-meta">
            <span class="resource-type">{{ (resource || currentResource).type }}</span>
            <span class="resource-date">{{ (resource || currentResource).date }}</span>
          </div>
          <h1>{{ (resource || currentResource).title }}</h1>
          <p class="resource-summary">{{ (resource || currentResource).summary }}</p>
          <button class="download-button">
            Download {{ (resource || currentResource).type }}
          </button>
        </div>
      </section>
      
      <!-- Resource Content -->
      <section class="resource-content">
        <div class="container">
          <div class="resource-body" v-html="(resource || currentResource).content"></div>
          
          <div class="resource-navigation">
            <button @click="goBack" class="back-button">
              ← Back to Resources
            </button>
          </div>
        </div>
      </section>
      
      <!-- Related Resources -->
      <section class="related-currentResources" v-if="relatedResources.length">
        <div class="container">
          <h2>Related Resources</h2>
          
          <div class="related-currentResources-grid">
            <div 
              v-for="related in relatedResources" 
              :key="related.slug" 
              class="related-currentResource-card"
            >
              <div class="currentResource-type">{{ related.type }}</div>
              <h3>{{ related.title }}</h3>
              <p class="currentResource-summary">{{ related.summary }}</p>
              <router-link :to="`/currentResources/${related.slug}`" class="currentResource-link">
                View Resource
              </router-link>
            </div>
          </div>
        </div>
      </section>
    </div>
    
    <!-- Not Found -->
    <div v-else class="not-found">
      <div class="container">
        <h1>Resource Not Found</h1>
        <p>The currentResource you're looking for doesn't exist or has been removed.</p>
        <button @click="goBack" class="primary-button">
          Back to Resources
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.currentResource-detail-page {
  min-height: calc(100vh - 80px - 300px);
}

/* Resource Header */
.currentResource-header {
  padding: 60px 0;
  background-color: var(--light-blue);
}

.currentResource-meta {
  margin-bottom: 20px;
}

.currentResource-type {
  display: inline-block;
  background-color: var(--primary-color);
  color: var(--white);
  font-size: 0.8rem;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 15px;
  margin-right: 15px;
}

.currentResource-date {
  color: var(--light-text);
  font-size: 0.9rem;
}

.currentResource-header h1 {
  font-size: 2.8rem;
  color: var(--dark-blue);
  margin-bottom: 20px;
  line-height: 1.2;
}

.currentResource-summary {
  font-size: 1.2rem;
  color: var(--light-text);
  max-width: 800px;
  margin-bottom: 30px;
}

.download-button {
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  padding: 12px 24px;
  border-radius: var(--border-radius);
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition);
}

.download-button:hover {
  background-color: #3a5ad9;
}

/* Resource Content */
.currentResource-content {
  padding: 60px 0;
}

.currentResource-body {
  max-width: 800px;
  margin: 0 auto;
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--text-color);
}

.currentResource-body :deep(h2) {
  font-size: 1.8rem;
  color: var(--dark-blue);
  margin: 40px 0 20px;
}

.currentResource-body :deep(h3) {
  font-size: 1.4rem;
  color: var(--dark-blue);
  margin: 30px 0 15px;
}

.currentResource-body :deep(p) {
  margin-bottom: 20px;
}

.currentResource-body :deep(ul) {
  margin-bottom: 20px;
  padding-left: 20px;
}

.currentResource-body :deep(li) {
  margin-bottom: 10px;
}

.currentResource-navigation {
  max-width: 800px;
  margin: 40px auto 0;
  text-align: center;
}

.back-button {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
  padding: 10px 15px;
  font-size: 1rem;
  transition: var(--transition);
}

.back-button:hover {
  color: var(--dark-blue);
  text-decoration: underline;
}

/* Related Resources */
.related-currentResources {
  padding: 60px 0;
  background-color: var(--light-blue);
}

.related-currentResources h2 {
  text-align: center;
  font-size: 2rem;
  color: var(--dark-blue);
  margin-bottom: 40px;
}

.related-currentResources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.related-currentResource-card {
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 25px;
  transition: transform 0.3s;
}

.related-currentResource-card:hover {
  transform: translateY(-5px);
}

.related-currentResource-card h3 {
  font-size: 1.3rem;
  color: var(--dark-blue);
  margin: 10px 0;
  line-height: 1.3;
}

.related-currentResource-card .currentResource-summary {
  font-size: 0.95rem;
  margin-bottom: 20px;
}

.currentResource-link {
  color: var(--primary-color);
  font-weight: 500;
  font-size: 0.9rem;
}

.currentResource-link:hover {
  text-decoration: underline;
}

/* Not Found */
.not-found {
  text-align: center;
  padding: 100px 0;
}

.not-found h1 {
  font-size: 2.5rem;
  color: var(--dark-blue);
  margin-bottom: 20px;
}

.not-found p {
  color: var(--light-text);
  margin-bottom: 30px;
}

.primary-button {
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  padding: 12px 24px;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
}

.primary-button:hover {
  background-color: #3a5ad9;
}

/* Responsive */
@media (max-width: 768px) {
  .currentResource-header h1 {
    font-size: 2rem;
  }
  
  .currentResource-body {
    font-size: 1rem;
  }
}
</style>
