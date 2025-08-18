<script setup>
import { ref, onMounted } from 'vue';
import { cmsAPI } from '../../api/client';

const siteSettings = ref(null);
const currentYear = new Date().getFullYear();

// Get site settings
const fetchSiteSettings = async () => {
  try {
    const response = await cmsAPI.getSiteSettings();
    if (response.success && response.settings) {
      siteSettings.value = response.settings;
    }
  } catch (error) {
    console.error('Failed to load site settings:', error);
  }
};

onMounted(() => {
  fetchSiteSettings();
});
</script>

<template>
  <footer class="site-footer">
    <div class="footer-main">
      <div class="container">
        <div class="footer-grid">
          <!-- Logo and Info -->
          <div class="footer-brand">
            <div class="footer-logo">
              <img v-if="siteSettings?.logo?.filePath" :src="siteSettings.logo.filePath" alt="Generativ Consulting" />
              <span v-else class="logo-text">
                <span class="gradient-text">Generativ</span>
              </span>
            </div>
            <p class="footer-tagline">{{ siteSettings?.tagline || 'Where AI speed meets human trust' }}</p>
            <div class="footer-social">
              <a v-if="siteSettings?.socialLinks?.linkedin" :href="siteSettings.socialLinks.linkedin" target="_blank" rel="noopener noreferrer" class="social-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a v-if="siteSettings?.socialLinks?.twitter" :href="siteSettings.socialLinks.twitter" target="_blank" rel="noopener noreferrer" class="social-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
              </a>
              <a v-if="siteSettings?.socialLinks?.github" :href="siteSettings.socialLinks.github" target="_blank" rel="noopener noreferrer" class="social-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </a>
            </div>
          </div>
          
          <!-- Footer Links -->
          <div v-if="siteSettings?.footer?.columns" class="footer-links-container">
            <div v-for="(column, index) in siteSettings.footer.columns" :key="index" class="footer-links">
              <h3 class="footer-heading">{{ column.title }}</h3>
              <ul>
                <li v-for="(link, linkIndex) in column.links" :key="linkIndex">
                  <router-link v-if="link.url.startsWith('/')" :to="link.url">{{ link.text }}</router-link>
                  <a v-else :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.text }}</a>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Default Footer Links if no settings -->
          <div v-else class="footer-links-container">
            <div class="footer-links">
              <h3 class="footer-heading">Services</h3>
              <ul>
                <li><router-link to="/services/safety-testing">AI Safety Testing</router-link></li>
                <li><router-link to="/services/parallelization">Parallelization</router-link></li>
                <li><router-link to="/services/critical-thinking">Critical Thinking</router-link></li>
              </ul>
            </div>
            
            <div class="footer-links">
              <h3 class="footer-heading">Company</h3>
              <ul>
                <li><router-link to="/about">About Us</router-link></li>
                <li><router-link to="/team">Our Team</router-link></li>
                <li><router-link to="/contact">Contact</router-link></li>
              </ul>
            </div>
            
            <div class="footer-links">
              <h3 class="footer-heading">Resources</h3>
              <ul>
                <li><router-link to="/blog">Blog</router-link></li>
                <li><router-link to="/resources">Resources</router-link></li>
                <li><router-link to="/resources/disruption-radar">Disruption Radar</router-link></li>
              </ul>
            </div>
          </div>
          
          <!-- Newsletter -->
          <div class="footer-newsletter">
            <h3 class="footer-heading">Stay Updated</h3>
            <p>Subscribe to our newsletter for the latest insights on AI safety and performance.</p>
            <form class="newsletter-form" @submit.prevent="subscribeToNewsletter">
              <input type="email" placeholder="Your email address" class="form-control" required />
              <button type="submit" class="btn btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer Bottom -->
    <div class="footer-bottom">
      <div class="container">
        <div class="footer-bottom-content">
          <p class="copyright">
            {{ siteSettings?.footer?.copyrightText || `© ${currentYear} Generativ Consulting Company. All rights reserved.` }}
          </p>
          <div class="footer-bottom-links">
            <router-link to="/privacy">Privacy Policy</router-link>
            <router-link to="/terms">Terms of Service</router-link>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background-color: var(--dark);
  color: var(--gray-300);
  margin-top: var(--spacing-3xl);
}

.footer-main {
  padding: var(--spacing-2xl) 0;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr repeat(3, 1fr);
  gap: var(--spacing-xl);
}

.footer-brand {
  display: flex;
  flex-direction: column;
}

.footer-logo {
  margin-bottom: var(--spacing-md);
}

.footer-logo img {
  height: 40px;
  width: auto;
}

.logo-text {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.75rem;
  letter-spacing: -0.025em;
}

.footer-tagline {
  margin-bottom: var(--spacing-md);
  color: var(--gray-400);
}

.footer-social {
  display: flex;
  gap: var(--spacing-md);
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--gray-300);
  transition: all var(--transition-normal);
}

.social-icon:hover {
  background-color: var(--primary);
  color: white;
  transform: translateY(-3px);
}

.footer-links-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
}

.footer-heading {
  color: white;
  font-size: 1.125rem;
  margin-bottom: var(--spacing-md);
  font-weight: 600;
}

.footer-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: var(--spacing-sm);
}

.footer-links a {
  color: var(--gray-400);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-links a:hover {
  color: var(--primary);
}

.footer-newsletter p {
  margin-bottom: var(--spacing-md);
}

.newsletter-form {
  display: flex;
  gap: var(--spacing-sm);
}

.newsletter-form .form-control {
  flex: 1;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.newsletter-form .form-control::placeholder {
  color: var(--gray-500);
}

.newsletter-form .form-control:focus {
  border-color: var(--primary);
  background-color: rgba(255, 255, 255, 0.15);
}

.footer-bottom {
  background-color: rgba(0, 0, 0, 0.2);
  padding: var(--spacing-md) 0;
}

.footer-bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright {
  margin: 0;
  font-size: 0.875rem;
}

.footer-bottom-links {
  display: flex;
  gap: var(--spacing-md);
}

.footer-bottom-links a {
  color: var(--gray-400);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color var(--transition-fast);
}

.footer-bottom-links a:hover {
  color: var(--primary);
}

@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .footer-links-container {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
  
  .footer-links-container {
    grid-template-columns: 1fr;
    grid-column: auto;
  }
  
  .footer-bottom-content {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
}
</style>
