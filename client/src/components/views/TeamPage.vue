<script setup>
import { ref, onMounted, computed } from 'vue';
import { cmsAPI } from '../../api/client';

const loading = ref(true);
const error = ref(null);
const teamMembers = ref([]);
const filterTag = ref('all');
const searchQuery = ref('');

// Fetch team data
async function fetchTeamData() {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await cmsAPI.getTeamMembers();
    if (response.success) {
      teamMembers.value = response.members || [];
    } else {
      // Fallback team data if API returns no members
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
        },
        {
          id: 'member5',
          name: 'Jordan Smith',
          position: 'AI Safety Engineer',
          bio: 'Specializes in detecting edge cases and vulnerabilities in large language models.',
          expertise: ['AI Testing', 'Prompt Engineering', 'Red Teaming'],
          isActive: true,
          sortOrder: 5
        },
        {
          id: 'member6',
          name: 'Casey Wong',
          position: 'Parallelization Architect',
          bio: 'Expert in scaling AI workloads across distributed computing environments.',
          expertise: ['Distributed Systems', 'Cloud Architecture', 'Performance Optimization'],
          isActive: true,
          sortOrder: 6
        },
        {
          id: 'member7',
          name: 'Riley Patel',
          position: 'AI Ethics Researcher',
          bio: 'Focuses on the ethical implications and guardrails for AI systems in high-risk domains.',
          expertise: ['AI Ethics', 'Policy Development', 'Risk Assessment'],
          isActive: true,
          sortOrder: 7
        },
        {
          id: 'member8',
          name: 'Avery Jackson',
          position: 'Technical Content Specialist',
          bio: 'Creates educational materials and documentation for AI safety and performance best practices.',
          expertise: ['Technical Writing', 'AI Education', 'Documentation'],
          isActive: true,
          sortOrder: 8
        }
      ];
    }
    
    loading.value = false;
  } catch (err) {
    console.error('Error fetching team data:', err);
    error.value = 'Failed to load team members';
    loading.value = false;
  }
}

// Get all unique expertise tags
const expertiseTags = computed(() => {
  const tags = new Set();
  tags.add('all');
  
  teamMembers.value.forEach(member => {
    if (member.expertise && Array.isArray(member.expertise)) {
      member.expertise.forEach(tag => {
        tags.add(tag);
      });
    }
  });
  
  return Array.from(tags);
});

// Filter team members based on tags and search
const filteredTeamMembers = computed(() => {
  return teamMembers.value.filter(member => {
    // Filter by tag
    const matchesTag = filterTag.value === 'all' || 
      (member.expertise && member.expertise.includes(filterTag.value));
    
    // Filter by search
    const query = searchQuery.value.toLowerCase();
    const matchesSearch = !query || 
      member.name.toLowerCase().includes(query) || 
      member.position.toLowerCase().includes(query) ||
      member.bio.toLowerCase().includes(query);
    
    return matchesTag && matchesSearch;
  });
});

onMounted(() => {
  fetchTeamData();
});
</script>

<template>
  <div class="team-page">
    <!-- Hero Section -->
    <section class="page-hero">
      <div class="container">
        <h1>Our Team</h1>
        <p class="hero-description">
          Meet the experts behind Generativ Consulting Company, dedicated to advancing 
          AI safety and performance.
        </p>
      </div>
    </section>
    
    <!-- Team Content -->
    <section class="team-content">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading team members...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="fetchTeamData" class="secondary-button">Try Again</button>
        </div>
        
        <!-- Team Filters and Grid -->
        <div v-else>
          <!-- Team Filters -->
          <div class="team-filters">
            <div class="search-filter">
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Search team members..." 
                class="search-input"
              />
            </div>
            
            <div class="tag-filters">
              <button 
                v-for="tag in expertiseTags" 
                :key="tag"
                :class="['tag-button', { active: filterTag === tag }]"
                @click="filterTag = tag"
              >
                {{ tag }}
              </button>
            </div>
          </div>
          
          <!-- Results Summary -->
          <div class="results-summary">
            Showing {{ filteredTeamMembers.length }} {{ filteredTeamMembers.length === 1 ? 'member' : 'members' }}
            <span v-if="filterTag !== 'all'"> with expertise in {{ filterTag }}</span>
            <span v-if="searchQuery"> matching "{{ searchQuery }}"</span>
          </div>
          
          <!-- Team Grid -->
          <div class="team-grid">
            <div 
              v-for="member in filteredTeamMembers" 
              :key="member.id" 
              class="team-card"
            >
              <div class="member-photo">
                <img :src="member.photo?.filePath || '/img/placeholder-person.svg'" :alt="member.name" />
              </div>
              <h2>{{ member.name }}</h2>
              <p class="member-position">{{ member.position }}</p>
              <p class="member-bio">{{ member.bio }}</p>
              
              <div class="member-expertise" v-if="member.expertise && member.expertise.length">
                <div 
                  v-for="(skill, index) in member.expertise" 
                  :key="index" 
                  class="expertise-tag"
                  @click="filterTag = skill"
                >
                  {{ skill }}
                </div>
              </div>
              
              <div class="member-social" v-if="member.linkedIn || member.twitter || member.email">
                <a v-if="member.email" :href="`mailto:${member.email}`" class="social-link">Email</a>
                <a v-if="member.linkedIn" :href="member.linkedIn" target="_blank" rel="noopener noreferrer" class="social-link">LinkedIn</a>
                <a v-if="member.twitter" :href="member.twitter" target="_blank" rel="noopener noreferrer" class="social-link">Twitter</a>
              </div>
            </div>
          </div>
          
          <!-- No Results -->
          <div v-if="filteredTeamMembers.length === 0" class="no-results">
            <p>No team members found matching your criteria.</p>
            <button @click="filterTag = 'all'; searchQuery = ''" class="secondary-button">
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Join Team Section -->
    <section class="join-team-section">
      <div class="container">
        <div class="join-content">
          <h2>Join Our Team</h2>
          <p>
            We're always looking for talented individuals passionate about AI safety and performance.
            If you're interested in joining our team, check out our current openings or send us your resume.
          </p>
          <div class="join-actions">
            <a href="#" class="primary-button">View Open Positions</a>
            <a href="#" class="secondary-button">Submit Your Resume</a>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Culture Section -->
    <section class="culture-section">
      <div class="container">
        <h2>Our Culture</h2>
        <p class="section-intro">
          At Generativ Consulting Company, we foster a culture of innovation, collaboration, and continuous learning.
        </p>
        
        <div class="culture-grid">
          <div class="culture-item">
            <div class="culture-icon">🔍</div>
            <h3>Intellectual Curiosity</h3>
            <p>We encourage deep exploration of complex problems and celebrate asking the right questions.</p>
          </div>
          
          <div class="culture-item">
            <div class="culture-icon">🤝</div>
            <h3>Collaborative Spirit</h3>
            <p>We believe the best solutions emerge from diverse perspectives working together.</p>
          </div>
          
          <div class="culture-item">
            <div class="culture-icon">📈</div>
            <h3>Growth Mindset</h3>
            <p>We embrace challenges and see failures as opportunities to learn and improve.</p>
          </div>
          
          <div class="culture-item">
            <div class="culture-icon">🎯</div>
            <h3>Impact-Driven</h3>
            <p>We focus on solutions that create meaningful, measurable results for our clients.</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <h2>Work With Our Team of Experts</h2>
        <p>Schedule a consultation to discuss how we can help with your AI challenges.</p>
        <div class="cta-buttons">
          <router-link to="/contact" class="primary-button">Contact Us</router-link>
          <router-link to="/services" class="secondary-button">Our Services</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.team-page {
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

/* Team Content */
.team-content {
  padding: 80px 0;
}

/* Team Filters */
.team-filters {
  margin-bottom: 40px;
}

.search-filter {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 1rem;
}

.search-input:focus {
  border-color: var(--primary-color);
  outline: none;
}

.tag-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.tag-button {
  background-color: var(--light-blue);
  color: var(--dark-blue);
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
}

.tag-button.active {
  background-color: var(--primary-color);
  color: var(--white);
}

.tag-button:not(.active):hover {
  background-color: rgba(76, 111, 255, 0.2);
}

.results-summary {
  color: var(--light-text);
  margin-bottom: 30px;
  font-size: 0.9rem;
}

/* Team Grid */
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
}

.team-card {
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 30px;
  text-align: center;
  transition: transform 0.3s;
}

.team-card:hover {
  transform: translateY(-5px);
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

.team-card h2 {
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
  gap: 8px;
  margin-bottom: 20px;
}

.expertise-tag {
  background-color: var(--light-blue);
  color: var(--primary-color);
  font-size: 0.8rem;
  padding: 5px 10px;
  border-radius: 15px;
  cursor: pointer;
  transition: var(--transition);
}

.expertise-tag:hover {
  background-color: rgba(76, 111, 255, 0.2);
}

.member-social {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.social-link {
  color: var(--light-text);
  font-size: 0.9rem;
  transition: var(--transition);
}

.social-link:hover {
  color: var(--primary-color);
}

/* No Results */
.no-results {
  text-align: center;
  padding: 40px 0;
}

.no-results p {
  margin-bottom: 20px;
  color: var(--light-text);
}

/* Loading and Error States */
.loading-state,
.error-state {
  text-align: center;
  padding: 50px 0;
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

.secondary-button {
  background-color: rgba(76, 111, 255, 0.1);
  color: var(--primary-color);
  padding: 10px 20px;
  border-radius: var(--border-radius);
  font-weight: 500;
  border: none;
  cursor: pointer;
  display: inline-block;
}

.secondary-button:hover {
  background-color: rgba(76, 111, 255, 0.2);
}

/* Join Team Section */
.join-team-section {
  padding: 80px 0;
  background-color: var(--light-blue);
}

.join-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.join-content h2 {
  font-size: 2.5rem;
  color: var(--dark-blue);
  margin-bottom: 20px;
}

.join-content p {
  font-size: 1.1rem;
  color: var(--light-text);
  margin-bottom: 30px;
  line-height: 1.6;
}

.join-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
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

/* Culture Section */
.culture-section {
  padding: 80px 0;
}

.culture-section h2 {
  font-size: 2.5rem;
  text-align: center;
  color: var(--dark-blue);
  margin-bottom: 20px;
}

.section-intro {
  max-width: 700px;
  margin: 0 auto 50px;
  text-align: center;
  font-size: 1.2rem;
  color: var(--light-text);
}

.culture-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.culture-item {
  text-align: center;
  padding: 30px;
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.culture-icon {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.culture-item h3 {
  font-size: 1.3rem;
  color: var(--dark-blue);
  margin-bottom: 15px;
}

.culture-item p {
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
  margin-bottom: 15px;
}

.cta-section p {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.cta-section .secondary-button {
  background-color: transparent;
  border: 1px solid var(--white);
  color: var(--white);
}

.cta-section .secondary-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Responsive */
@media (max-width: 992px) {
  .page-hero h1,
  .join-content h2,
  .culture-section h2,
  .cta-section h2 {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .join-actions,
  .cta-buttons {
    flex-direction: column;
    max-width: 250px;
    margin-left: auto;
    margin-right: auto;
    gap: 10px;
  }
  
  .tag-filters {
    justify-content: center;
  }
}
</style>
