<script setup>
import BrandMark from './BrandMark.vue';
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
              <BrandMark v-else size="md" tone="dark" />
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
          
          <!-- Next step. The newsletter form that used to sit here called a
               handler that was never defined, so submitting it threw. -->
          <div class="footer-cta">
            <h3 class="footer-heading">Start with the review</h3>
            <p>Two days on site, $500, credited in full against an implementation.</p>
            <div class="footer-cta-actions">
              <router-link to="/services/ai-opportunity-audit" class="g-btn g-btn--primary g-btn--sm">
                Book the audit
              </router-link>
              <router-link to="/contact" class="g-btn g-btn--ghost g-btn--sm">
                Ask a question
              </router-link>
            </div>
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
            <router-link to="/admin/login">Sign in</router-link>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background-color: var(--g-ink);
  border-top: 1px solid var(--g-line);
  color: var(--g-text-dim);
}

.footer-main { padding: 72px 0 56px; }

.footer-grid {
  display: grid;
  grid-template-columns: minmax(240px, 1.1fr) minmax(0, 2fr) minmax(230px, 1fr);
  gap: 56px;
  align-items: start;
}

.footer-brand { display: flex; flex-direction: column; gap: 18px; }

.footer-logo img { height: 30px; width: auto; }

.footer-tagline {
  color: var(--g-text-dim);
  font-size: 0.9375rem;
  line-height: 1.65;
  max-width: 30ch;
  margin: 0;
}

.footer-social { display: flex; gap: 8px; }

.social-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--g-line);
  border-radius: var(--g-r);
  color: var(--g-text-dim);
  transition: color 160ms ease, border-color 160ms ease;
}

.social-icon svg { width: 16px; height: 16px; }

.social-icon:hover { color: var(--g-volt); border-color: var(--g-volt-line); }

/* auto-fit, not auto-fill: with three columns declared and two present,
   auto-fill leaves an empty track and a visible gutter to nowhere. */
.footer-links-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 40px;
}

.footer-heading {
  font-family: var(--g-mono);
  font-size: 0.688rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--g-text-faint);
  margin: 0 0 16px;
}

.footer-links ul { list-style: none; margin: 0; padding: 0; }

.footer-links li { margin-bottom: 10px; }

.footer-links a,
.footer-links :deep(a) {
  color: var(--g-text-dim);
  font-size: 0.9375rem;
  text-decoration: none;
  transition: color 150ms ease;
}

.footer-links a:hover { color: var(--g-text); }

.footer-cta p {
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0 0 18px;
  color: var(--g-text-dim);
}

.footer-cta-actions { display: flex; flex-wrap: wrap; gap: 10px; }

.footer-bottom {
  border-top: 1px solid var(--g-line);
  padding: 22px 0;
}

.footer-bottom-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.copyright {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--g-text-faint);
}

.footer-bottom-links { display: flex; gap: 22px; }

.footer-bottom-links a {
  font-size: 0.8125rem;
  color: var(--g-text-faint);
  text-decoration: none;
}

.footer-bottom-links a:hover { color: var(--g-text); }

@media (max-width: 980px) {
  .footer-grid { grid-template-columns: 1fr 1fr; gap: 44px; }
  .footer-cta { grid-column: 1 / -1; }
}

@media (max-width: 640px) {
  .footer-grid { grid-template-columns: 1fr; gap: 40px; }
  .footer-main { padding: 56px 0 40px; }
}
</style>
