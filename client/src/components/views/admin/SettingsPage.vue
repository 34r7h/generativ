<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminSidebar from './components/AdminSidebar.vue';
import AdminHeader from './components/AdminHeader.vue';
import { cmsAPI } from '../../../api/client';

const router = useRouter();
const loading = ref(true);
const error = ref(null);
const saving = ref(false);

const settingsForm = ref({
  siteName: '',
  tagline: '',
  contactEmail: '',
  socialLinks: {
    linkedin: '',
    twitter: '',
    github: ''
  },
  footer: {
    copyrightText: '',
    showLogo: true,
    columns: []
  },
  analytics: {
    googleAnalyticsId: '',
    enableCookieBanner: true
  },
  globalSEO: {
    title: '',
    description: '',
    keywords: []
  }
});

const loadSettings = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await cmsAPI.getSiteSettings();
    if (response.success && response.settings) {
      settingsForm.value = {
        ...settingsForm.value,
        ...response.settings
      };
    } else {
      console.log('No existing settings found, using defaults');
    }
  } catch (err) {
    console.error('Error loading settings:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const saveSettings = async () => {
  try {
    saving.value = true;
    error.value = null;
    
    const response = await cmsAPI.updateSiteSettings(settingsForm.value);
    if (response.success) {
      console.log('Settings saved successfully');
    } else {
      throw new Error(response.error || 'Failed to save settings');
    }
  } catch (err) {
    console.error('Error saving settings:', err);
    error.value = err.message;
  } finally {
    saving.value = false;
  }
};

const addKeyword = () => {
  settingsForm.value.globalSEO.keywords.push('');
};

const removeKeyword = (index) => {
  settingsForm.value.globalSEO.keywords.splice(index, 1);
};

const addFooterColumn = () => {
  settingsForm.value.footer.columns.push({
    title: '',
    links: []
  });
};

const removeFooterColumn = (index) => {
  settingsForm.value.footer.columns.splice(index, 1);
};

const addFooterLink = (columnIndex) => {
  settingsForm.value.footer.columns[columnIndex].links.push({
    text: '',
    url: ''
  });
};

const removeFooterLink = (columnIndex, linkIndex) => {
  settingsForm.value.footer.columns[columnIndex].links.splice(linkIndex, 1);
};

onMounted(() => {
  loadSettings();
});
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar />
    
    <main class="admin-main">
      <AdminHeader />
      
      <div class="admin-content">
        <div class="admin-page">
          <div class="admin-container">
            <div class="admin-header">
              <div class="header-left">
                <h1>Site Settings</h1>
                <p>Configure website settings and preferences</p>
              </div>
              <div class="header-right">
                <button @click="saveSettings" class="btn btn-primary" :disabled="saving">
                  <span v-if="saving" class="spinner"></span>
                  {{ saving ? 'Saving...' : 'Save Settings' }}
                </button>
              </div>
            </div>
            
            <div v-if="error" class="error-message">
              {{ error }}
            </div>
            
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>Loading settings...</p>
            </div>
            
            <div v-else class="settings-container">
              <form @submit.prevent="saveSettings" class="settings-form">
                <!-- General Settings -->
                <div class="settings-section">
                  <h3>General Settings</h3>
                  
                  <div class="form-group">
                    <label class="form-label">Site Name</label>
                    <input 
                      type="text" 
                      v-model="settingsForm.siteName" 
                      class="form-control"
                      placeholder="Your company name"
                    />
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">Tagline</label>
                    <input 
                      type="text" 
                      v-model="settingsForm.tagline" 
                      class="form-control"
                      placeholder="Your company tagline"
                    />
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">Contact Email</label>
                    <input 
                      type="email" 
                      v-model="settingsForm.contactEmail" 
                      class="form-control"
                      placeholder="contact@company.com"
                    />
                  </div>
                </div>
                
                <!-- Social Links -->
                <div class="settings-section">
                  <h3>Social Media Links</h3>
                  
                  <div class="form-group">
                    <label class="form-label">LinkedIn</label>
                    <input 
                      type="url" 
                      v-model="settingsForm.socialLinks.linkedin" 
                      class="form-control"
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">Twitter</label>
                    <input 
                      type="url" 
                      v-model="settingsForm.socialLinks.twitter" 
                      class="form-control"
                      placeholder="https://twitter.com/yourcompany"
                    />
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">GitHub</label>
                    <input 
                      type="url" 
                      v-model="settingsForm.socialLinks.github" 
                      class="form-control"
                      placeholder="https://github.com/yourcompany"
                    />
                  </div>
                </div>
                
                <!-- SEO Settings -->
                <div class="settings-section">
                  <h3>SEO Settings</h3>
                  
                  <div class="form-group">
                    <label class="form-label">Global SEO Title</label>
                    <input 
                      type="text" 
                      v-model="settingsForm.globalSEO.title" 
                      class="form-control"
                      placeholder="Your Company | Professional Services"
                    />
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">Global SEO Description</label>
                    <textarea 
                      v-model="settingsForm.globalSEO.description" 
                      class="form-control"
                      rows="3"
                      placeholder="Description of your company and services"
                    ></textarea>
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">SEO Keywords</label>
                    <div v-for="(keyword, index) in settingsForm.globalSEO.keywords" :key="index" class="form-group list-item">
                      <div class="list-input-group">
                        <input 
                          type="text" 
                          v-model="settingsForm.globalSEO.keywords[index]" 
                          class="form-control"
                          placeholder="Enter keyword"
                        />
                        <button type="button" @click="removeKeyword(index)" class="btn btn-sm btn-danger">
                          Remove
                        </button>
                      </div>
                    </div>
                    <button type="button" @click="addKeyword" class="btn btn-sm btn-secondary">
                      Add Keyword
                    </button>
                  </div>
                </div>
                
                <!-- Analytics -->
                <div class="settings-section">
                  <h3>Analytics</h3>
                  
                  <div class="form-group">
                    <label class="form-label">Google Analytics ID</label>
                    <input 
                      type="text" 
                      v-model="settingsForm.analytics.googleAnalyticsId" 
                      class="form-control"
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                  
                  <div class="form-group">
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="settingsForm.analytics.enableCookieBanner" />
                      Enable cookie consent banner
                    </label>
                  </div>
                </div>
                
                <!-- Footer Settings -->
                <div class="settings-section">
                  <h3>Footer Settings</h3>
                  
                  <div class="form-group">
                    <label class="form-label">Copyright Text</label>
                    <input 
                      type="text" 
                      v-model="settingsForm.footer.copyrightText" 
                      class="form-control"
                      placeholder="© 2025 Your Company. All rights reserved."
                    />
                  </div>
                  
                  <div class="form-group">
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="settingsForm.footer.showLogo" />
                      Show logo in footer
                    </label>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--gray-50);
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.admin-content {
  flex: 1;
  overflow-y: auto;
}

.admin-page {
  padding: 20px;
}

.admin-container {
  max-width: 1200px;
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.header-left h1 {
  font-size: 2rem;
  color: var(--gray-900);
  margin-bottom: 5px;
}

.header-left p {
  color: var(--gray-600);
  margin: 0;
}

.settings-container {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 30px;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.settings-section {
  border-bottom: 1px solid var(--gray-200);
  padding-bottom: 30px;
}

.settings-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.settings-section h3 {
  color: var(--gray-900);
  margin-bottom: 20px;
  font-size: 1.25rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: var(--gray-700);
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
  transition: all var(--transition-normal);
}

.form-control:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.list-item {
  margin-bottom: 10px;
}

.list-input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.list-input-group .form-control {
  flex: 1;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
}

.loading-state {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 60px 20px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.error-message {
  background: var(--danger-light);
  color: var(--danger-dark);
  padding: 15px;
  border-radius: var(--border-radius-md);
  margin-bottom: 20px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>