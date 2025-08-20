<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { cmsAPI } from '../../api/client';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const error = ref(null);
const blogPost = ref(null);
const relatedPosts = ref([]);

// Get blog post slug/ID from route
const postId = computed(() => route.params.id);
const blogPosts = {
  1: {
    id: 1,
    title: 'Understanding AI Safety: A Primer',
    content: `
      <p>Artificial Intelligence systems are becoming increasingly powerful and ubiquitous in our daily lives. As organizations adopt these technologies, ensuring their safe and reliable operation becomes paramount. This post serves as a primer on AI safety concepts that every organization should understand.</p>

      <h2>What is AI Safety?</h2>
      
      <p>AI safety encompasses the research and engineering practices aimed at ensuring that artificial intelligence systems behave as intended and do not cause harm. This includes preventing unintended consequences, aligning AI goals with human values, and building systems that are robust against manipulation or failure.</p>
      
      <h2>Key AI Safety Challenges</h2>
      
      <p>Several challenges make AI safety a complex field:</p>
      
      <ul>
        <li><strong>Alignment Problem:</strong> Ensuring AI systems pursue goals that align with human intentions and values.</li>
        <li><strong>Robustness:</strong> Building AI that performs well even under unexpected or adversarial conditions.</li>
        <li><strong>Monitoring and Control:</strong> Developing mechanisms to monitor AI behavior and intervene when necessary.</li>
        <li><strong>Transparency:</strong> Creating systems whose decisions can be understood and explained.</li>
        <li><strong>Value Specification:</strong> Clearly defining what we want AI systems to optimize for.</li>
      </ul>
      
      <p>Organizations implementing AI systems should consider each of these challenges and develop strategies to address them.</p>
    `,
    date: '2023-09-15',
    author: 'Alex Rodriguez',
    category: 'AI Safety',
    tags: ['safety', 'alignment', 'robustness', 'AI ethics']
  },
  2: {
    id: 2,
    title: 'Parallelization Techniques for Modern AI Workloads',
    content: `
      <p>As AI models grow in size and complexity, efficient parallelization becomes critical for organizations looking to maximize performance and minimize costs. This post explores key techniques for parallelizing AI workloads.</p>

      <h2>The Need for Parallelization</h2>
      
      <p>Modern AI workloads, particularly large language models and computer vision systems, demand enormous computational resources. Effective parallelization can reduce training time from weeks to days or even hours, dramatically improving development cycles and reducing costs.</p>
      
      <h2>Key Parallelization Strategies</h2>
      
      <p>Several strategies can be employed to parallelize AI workloads:</p>
      
      <ul>
        <li><strong>Data Parallelism:</strong> Dividing data across multiple processors, each running the same model.</li>
        <li><strong>Model Parallelism:</strong> Splitting a model across multiple devices when it's too large for a single device.</li>
        <li><strong>Pipeline Parallelism:</strong> Breaking the model into stages that can be processed in parallel.</li>
        <li><strong>Hybrid Approaches:</strong> Combining multiple parallelization strategies for optimal performance.</li>
      </ul>
      
      <p>The right approach depends on your specific model architecture, hardware constraints, and performance requirements.</p>
    `,
    date: '2023-08-22',
    author: 'Jamie Lee',
    category: 'Performance',
    tags: ['parallelization', 'performance', 'optimization', 'distributed computing']
  },
  3: {
    id: 3,
    title: 'Critical Thinking: The Human Edge in an AI World',
    content: `
      <p>As AI systems become more capable, the value of human critical thinking increases rather than decreases. This post explores how organizations can foster critical thinking skills to complement AI capabilities.</p>

      <h2>The Continued Relevance of Human Thinking</h2>
      
      <p>While AI excels at pattern recognition and processing vast amounts of data, humans still maintain an edge in areas such as contextual understanding, ethical reasoning, and creative problem-solving. These skills become more valuable, not less, in an AI-augmented workplace.</p>
      
      <h2>Critical Thinking Skills for the AI Age</h2>
      
      <p>Organizations should focus on developing these key critical thinking skills:</p>
      
      <ul>
        <li><strong>AI Output Evaluation:</strong> The ability to assess AI-generated content for accuracy, relevance, and potential biases.</li>
        <li><strong>Prompt Engineering:</strong> Crafting effective prompts to guide AI systems toward desired outcomes.</li>
        <li><strong>Contextual Intelligence:</strong> Understanding when to rely on AI and when human judgment is necessary.</li>
        <li><strong>Ethical Reasoning:</strong> Identifying and addressing ethical implications of AI applications.</li>
        <li><strong>Systems Thinking:</strong> Comprehending how AI fits into larger organizational and societal systems.</li>
      </ul>
      
      <p>By fostering these skills, organizations can leverage AI as a powerful tool while maintaining human judgment and values at the core of decision-making processes.</p>
    `,
    date: '2023-07-10',
    author: 'Morgan Chen',
    category: 'Education',
    tags: ['critical thinking', 'education', 'AI literacy', 'prompt engineering']
  }
};



// Get the current post
// Load blog post data
async function loadBlogPost() {
  try {
    loading.value = true;
    error.value = null;
    
    // Try to get blog post by slug first, then by ID
    let response;
    if (isNaN(postId.value)) {
      // It's a slug
      response = await cmsAPI.getBlogPostBySlug(postId.value);
    } else {
      // It's an ID - get all posts and find by ID
      const allPosts = await cmsAPI.getBlogPosts();
      if (allPosts.success) {
        const post = allPosts.posts.find(p => p.id === postId.value);
        response = post ? { success: true, post } : { success: false, error: 'Post not found' };
      }
    }
    
    if (response && response.success && response.post) {
      blogPost.value = response.post;
      
      // Load related posts
      const allPostsResponse = await cmsAPI.getBlogPosts();
      if (allPostsResponse.success) {
        relatedPosts.value = allPostsResponse.posts
          .filter(p => p.id !== blogPost.value.id && p.isPublished)
          .slice(0, 3);
      }
    } else {
      error.value = 'Blog post not found';
    }
  } catch (err) {
    console.error('Error loading blog post:', err);
    error.value = 'Failed to load blog post';
  } finally {
    loading.value = false;
  }
}



function goBack() {
  router.push('/blog');
}

onMounted(() => {
  loadBlogPost();
});
</script>

<template>
  <div class="blog-post-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading blog post...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <h2>Post Not Found</h2>
      <p>{{ error }}</p>
      <button @click="goBack" class="btn btn-primary">Back to Blog</button>
    </div>
    
    <div v-else-if="blogPost">
      <!-- Post Header -->
      <section class="post-header">
        <div class="container">
          <div class="post-meta">
            <span class="post-category">{{ blogPost.category }}</span>
            <span class="post-date">{{ blogPost.date }}</span>
          </div>
          <h1>{{ blogPost.title }}</h1>
          <p class="post-author">By {{ blogPost.author }}</p>
        </div>
      </section>
      
      <!-- Post Content -->
      <section class="post-content">
        <div class="container">
          <div class="post-body" v-html="blogPost.content"></div>
          
          <div class="post-tags" v-if="blogPost.tags && blogPost.tags.length">
            <h3>Tags:</h3>
            <div class="tags-list">
              <span 
                v-for="(tag, index) in blogPost.tags" 
                :key="index" 
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          
          <div class="post-navigation">
            <button @click="goBack" class="back-button">
              ← Back to All Posts
            </button>
          </div>
        </div>
      </section>
      
      <!-- Related Posts -->
      <section class="related-posts" v-if="relatedPosts.length">
        <div class="container">
          <h2>Related Articles</h2>
          
          <div class="related-posts-grid">
            <div 
              v-for="post in relatedPosts" 
              :key="post.id" 
              class="related-post-card"
            >
              <div class="post-category">{{ post.category }}</div>
              <h3>{{ post.title }}</h3>
              <div class="post-meta">
                <span class="post-date">{{ post.date }}</span>
                <span class="post-author">by {{ post.author }}</span>
              </div>
              <router-link :to="`/blog/${post.id}`" class="post-link">
                Read Article
              </router-link>
            </div>
          </div>
        </div>
      </section>
    </div>
    
    <!-- Not Found -->
    <div v-else class="not-found">
      <div class="container">
        <h1>Post Not Found</h1>
        <p>The blog post you're looking for doesn't exist or has been removed.</p>
        <button @click="goBack" class="primary-button">
          Back to Blog
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blog-post-page {
  min-height: calc(100vh - 80px - 300px);
}

/* Post Header */
.post-header {
  padding: 60px 0;
  background-color: var(--light-blue);
}

.post-meta {
  margin-bottom: 20px;
}

.post-category {
  display: inline-block;
  background-color: var(--primary-color);
  color: var(--white);
  font-size: 0.8rem;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 15px;
  margin-right: 15px;
}

.post-date {
  color: var(--light-text);
  font-size: 0.9rem;
}

.post-header h1 {
  font-size: 2.8rem;
  color: var(--dark-blue);
  margin-bottom: 15px;
  line-height: 1.2;
}

.post-author {
  color: var(--light-text);
  font-size: 1rem;
}

/* Post Content */
.post-content {
  padding: 60px 0;
}

.post-body {
  max-width: 800px;
  margin: 0 auto;
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--text-color);
}

.post-body :deep(h2) {
  font-size: 1.8rem;
  color: var(--dark-blue);
  margin: 40px 0 20px;
}

.post-body :deep(p) {
  margin-bottom: 20px;
}

.post-body :deep(ul) {
  margin-bottom: 20px;
  padding-left: 20px;
}

.post-body :deep(li) {
  margin-bottom: 10px;
}

.post-tags {
  max-width: 800px;
  margin: 40px auto 0;
  border-top: 1px solid #eee;
  padding-top: 30px;
}

.post-tags h3 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: var(--dark-blue);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  background-color: var(--light-blue);
  color: var(--primary-color);
  font-size: 0.8rem;
  padding: 5px 10px;
  border-radius: 15px;
}

.post-navigation {
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

/* Related Posts */
.related-posts {
  padding: 60px 0;
  background-color: var(--light-blue);
}

.related-posts h2 {
  text-align: center;
  font-size: 2rem;
  color: var(--dark-blue);
  margin-bottom: 40px;
}

.related-posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.related-post-card {
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 25px;
  transition: transform 0.3s;
}

.related-post-card:hover {
  transform: translateY(-5px);
}

.related-post-card h3 {
  font-size: 1.3rem;
  color: var(--dark-blue);
  margin: 10px 0;
  line-height: 1.3;
}

.related-post-card .post-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--light-text);
  margin-bottom: 15px;
}

.post-link {
  color: var(--primary-color);
  font-weight: 500;
  font-size: 0.9rem;
}

.post-link:hover {
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
  .post-header h1 {
    font-size: 2rem;
  }
  
  .post-body {
    font-size: 1rem;
  }
}
</style>
