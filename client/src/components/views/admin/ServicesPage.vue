<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import AdminSidebar from './components/AdminSidebar.vue';
import AdminHeader from './components/AdminHeader.vue';
import { cmsAPI } from '../../../api/client';
import AppIcon from '../../shared/AppIcon.vue';
import { iconFor } from '../../../config/icons';
import {
  PRICING_MODELS,
  INTERVALS,
  formatPrice,
  toMinorUnits,
  toMajorUnits
} from '../../../config/pricing';

const router = useRouter();
const loading = ref(true);
const error = ref(null);
const services = ref([]);
const filteredServices = ref([]);
const searchQuery = ref('');
const showModal = ref(false);
const editingService = ref(null);
const saving = ref(false);

// Form data for creating/editing services
const serviceForm = ref({
  title: '',
  slug: '',
  shortDescription: '',
  fullDescription: '',
  icon: 'wrench',
  benefits: [],
  pricing: '',
  isPublished: false,
  sortOrder: 1,
  seo: {
    title: '',
    description: '',
    keywords: []
  }
});

// Price is edited in major units (dollars) and stored in minor units (cents),
// which is what Stripe expects and what avoids float arithmetic on money.
const priceForm = ref({
  model: 'quote',
  amountMajor: '',
  currency: 'usd',
  interval: 'month',
  intervalCount: 1,
  stripePriceId: '',
  purchasable: false,
  note: ''
});

function blankPriceForm() {
  return {
    model: 'quote',
    amountMajor: '',
    currency: 'usd',
    interval: 'month',
    intervalCount: 1,
    stripePriceId: '',
    purchasable: false,
    note: ''
  };
}

function priceFormFrom(service) {
  const p = service?.pricingDetail;
  if (!p) return blankPriceForm();
  return {
    model: p.model || 'quote',
    amountMajor: toMajorUnits(p.amount),
    currency: p.currency || 'usd',
    interval: p.interval || 'month',
    intervalCount: p.intervalCount || 1,
    stripePriceId: p.stripePriceId || '',
    purchasable: !!p.purchasable,
    note: p.note || ''
  };
}

function priceFormToDetail() {
  const f = priceForm.value;
  if (f.model === 'quote') {
    return { model: 'quote', purchasable: false, note: f.note.trim() };
  }
  return {
    model: f.model,
    amount: toMinorUnits(f.amountMajor),
    currency: (f.currency || 'usd').toLowerCase(),
    ...(f.model === 'subscription'
      ? { interval: f.interval, intervalCount: Number(f.intervalCount) || 1 }
      : {}),
    stripePriceId: f.stripePriceId.trim(),
    purchasable: !!f.purchasable,
    note: f.note.trim()
  };
}

const pricePreview = computed(() => formatPrice(priceFormToDetail()));

// Computed properties
const publishedCount = computed(() => services.value.filter(service => service.isPublished).length);
const draftCount = computed(() => services.value.filter(service => !service.isPublished).length);

// Filter services based on search
const filterServices = () => {
  let filtered = [...services.value];
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(service => 
      service.title.toLowerCase().includes(query) ||
      service.shortDescription.toLowerCase().includes(query) ||
      service.slug.toLowerCase().includes(query)
    );
  }
  
  filteredServices.value = filtered.sort((a, b) => a.sortOrder - b.sortOrder);
};

// Watch for changes in search
const updateFilters = () => {
  filterServices();
};

// Load services
const loadServices = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await cmsAPI.getServices();
    if (response.success) {
      services.value = response.services || [];
      filterServices();
    } else {
      throw new Error(response.error || 'Failed to load services');
    }
  } catch (err) {
    console.error('Error loading services:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Create new service
const createService = () => {
  editingService.value = null;
  serviceForm.value = {
    title: '',
    slug: '',
    shortDescription: '',
    fullDescription: '',
    icon: 'wrench',
    benefits: [],
    pricing: '',
    isPublished: false,
    sortOrder: services.value.length + 1,
    seo: {
      title: '',
      description: '',
      keywords: []
    }
  };
  priceForm.value = blankPriceForm();
  showModal.value = true;
};

// Edit existing service
const editService = (service) => {
  editingService.value = service;
  serviceForm.value = {
    title: service.title,
    slug: service.slug,
    shortDescription: service.shortDescription,
    fullDescription: service.fullDescription,
    icon: service.icon,
    benefits: [...(service.benefits || [])],
    pricing: service.pricing,
    isPublished: service.isPublished,
    sortOrder: service.sortOrder,
    seo: {
      title: service.seo?.title || '',
      description: service.seo?.description || '',
      keywords: [...(service.seo?.keywords || [])]
    }
  };
  priceForm.value = priceFormFrom(service);
  showModal.value = true;
};

// Generate slug from title
const generateSlug = () => {
  if (serviceForm.value.title) {
    serviceForm.value.slug = serviceForm.value.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
};

// Add benefit
const addBenefit = () => {
  serviceForm.value.benefits.push('');
};

// Remove benefit
const removeBenefit = (index) => {
  serviceForm.value.benefits.splice(index, 1);
};

// Add keyword
const addKeyword = () => {
  serviceForm.value.seo.keywords.push('');
};

// Remove keyword
const removeKeyword = (index) => {
  serviceForm.value.seo.keywords.splice(index, 1);
};

// Save service
const saveService = async () => {
  try {
    saving.value = true;
    
    // Validate form
    if (!serviceForm.value.title || !serviceForm.value.slug) {
      throw new Error('Title and slug are required');
    }
    
    // Filter out empty benefits and keywords
    serviceForm.value.benefits = serviceForm.value.benefits.filter(benefit => benefit.trim());
    serviceForm.value.seo.keywords = serviceForm.value.seo.keywords.filter(keyword => keyword.trim());
    
    const payload = { ...serviceForm.value, pricingDetail: priceFormToDetail() };

    if (payload.pricingDetail.purchasable
        && !payload.pricingDetail.stripePriceId
        && !(payload.pricingDetail.amount >= 50)) {
      throw new Error('A purchasable service needs an amount of at least 0.50, or a Stripe price ID');
    }

    let response;
    if (editingService.value) {
      response = await cmsAPI.updateService(editingService.value.id, payload);
    } else {
      response = await cmsAPI.createService(payload);
    }
    
    if (response.success) {
      showModal.value = false;
      await loadServices();
    } else {
      throw new Error(response.error || 'Failed to save service');
    }
  } catch (err) {
    console.error('Error saving service:', err);
    error.value = err.message;
  } finally {
    saving.value = false;
  }
};

// Delete service
const deleteService = async (service) => {
  if (!confirm(`Are you sure you want to delete "${service.title}"?`)) {
    return;
  }
  
  try {
    const response = await cmsAPI.deleteService(service.id);
    if (response.success) {
      await loadServices();
    } else {
      throw new Error(response.error || 'Failed to delete service');
    }
  } catch (err) {
    console.error('Error deleting service:', err);
    error.value = err.message;
  }
};

// Close modal
const closeModal = () => {
  showModal.value = false;
  editingService.value = null;
};

// Format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

onMounted(() => {
  loadServices();
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
            <!-- Header -->
      <div class="admin-header">
              <div class="header-left">
        <h1>Services Management</h1>
                <p>Manage your service offerings and content</p>
              </div>
              <div class="header-right">
                <button @click="createService" class="btn btn-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Add Service
                </button>
              </div>
            </div>
            
            <!-- Stats Cards -->
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ services.length }}</div>
                  <div class="stat-label">Total Services</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon published">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                  </svg>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ publishedCount }}</div>
                  <div class="stat-label">Published</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon draft">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                  </svg>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ draftCount }}</div>
                  <div class="stat-label">Drafts</div>
                </div>
              </div>
            </div>
            
            <!-- Search and Filters -->
            <div class="admin-filters">
              <div class="search-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  @input="updateFilters"
                  placeholder="Search services..." 
                  class="search-input"
                />
              </div>
            </div>
            
            <!-- Error Message -->
            <div v-if="error" class="error-message">
              {{ error }}
            </div>
            
            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>Loading services...</p>
            </div>
            
            <!-- Services Table -->
            <div v-else-if="filteredServices.length > 0" class="admin-table-container">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Order</th>
                    <th>Last Modified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="service in filteredServices" :key="service.id" class="table-row">
                    <td class="service-cell">
                      <div class="service-info">
                        <div class="service-icon">
                          <AppIcon :name="iconFor(service.title)" :size="22" />
                        </div>
                        <div class="service-details">
                          <div class="service-title">{{ service.title }}</div>
                          <div class="service-description">{{ service.shortDescription }}</div>
                          <div class="service-slug">/services/{{ service.slug }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span :class="['status-badge', service.isPublished ? 'published' : 'draft']">
                        {{ service.isPublished ? 'Published' : 'Draft' }}
                      </span>
                    </td>
                    <td>{{ service.sortOrder }}</td>
                    <td class="date-cell">{{ formatDate(service.updatedAt) }}</td>
                    <td class="actions-cell">
                      <div class="action-buttons">
                        <button @click="editService(service)" class="btn btn-sm btn-secondary" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                          </svg>
                        </button>
                        <button @click="deleteService(service)" class="btn btn-sm btn-danger" title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
      </div>
      
            <!-- Empty State -->
            <div v-else class="empty-state">
              <div class="empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3>No services found</h3>
              <p>{{ searchQuery ? 'No services match your search criteria.' : 'Get started by creating your first service.' }}</p>
              <button v-if="!searchQuery" @click="createService" class="btn btn-primary">
                Create Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Service editor. Absent entirely before this change: services could be
         listed and deleted, but not created or edited. -->
    <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
      <div class="modal" role="dialog" aria-modal="true">
        <header class="modal-head">
          <h2>{{ editingService ? 'Edit service' : 'New service' }}</h2>
          <button type="button" class="icon-button" aria-label="Close" @click="showModal = false">
            <AppIcon name="close" :size="18" />
          </button>
        </header>

        <form class="modal-body" @submit.prevent="saveService">
          <div class="field-grid">
            <label class="field">
              <span class="field-label">Title</span>
              <input v-model="serviceForm.title" class="input" required @blur="generateSlug" />
            </label>

            <label class="field">
              <span class="field-label">Slug</span>
              <input v-model="serviceForm.slug" class="input" required placeholder="ai-opportunity-audit" />
            </label>
          </div>

          <label class="field">
            <span class="field-label">Short description</span>
            <textarea v-model="serviceForm.shortDescription" rows="2" class="input"></textarea>
          </label>

          <label class="field">
            <span class="field-label">Full description (HTML)</span>
            <textarea v-model="serviceForm.fullDescription" rows="8" class="input mono"></textarea>
          </label>

          <div class="field">
            <span class="field-label">Benefits</span>
            <div v-for="(benefit, index) in serviceForm.benefits" :key="index" class="repeat-row">
              <input v-model="serviceForm.benefits[index]" class="input" />
              <button type="button" class="icon-button" aria-label="Remove" @click="removeBenefit(index)">
                <AppIcon name="trash" :size="16" />
              </button>
            </div>
            <button type="button" class="ghost-button small" @click="addBenefit">
              <AppIcon name="plus" :size="15" /><span>Add benefit</span>
            </button>
          </div>

          <!-- Pricing -->
          <h3 class="subhead">Price</h3>

          <div class="field-grid">
            <label class="field">
              <span class="field-label">How it is sold</span>
              <select v-model="priceForm.model" class="input">
                <option v-for="model in PRICING_MODELS" :key="model.value" :value="model.value">
                  {{ model.label }}
                </option>
              </select>
            </label>

            <label class="field" v-if="priceForm.model !== 'quote'">
              <span class="field-label">Amount</span>
              <input v-model="priceForm.amountMajor" class="input" inputmode="decimal" placeholder="500" />
              <small class="hint">In whole currency units. Stored as cents.</small>
            </label>

            <label class="field" v-if="priceForm.model !== 'quote'">
              <span class="field-label">Currency</span>
              <input v-model="priceForm.currency" class="input" maxlength="3" placeholder="usd" />
            </label>
          </div>

          <div class="field-grid" v-if="priceForm.model === 'subscription'">
            <label class="field">
              <span class="field-label">Billed</span>
              <select v-model="priceForm.interval" class="input">
                <option v-for="interval in INTERVALS" :key="interval.value" :value="interval.value">
                  {{ interval.label }}
                </option>
              </select>
            </label>

            <label class="field">
              <span class="field-label">Every</span>
              <input v-model.number="priceForm.intervalCount" type="number" min="1" max="12" class="input" />
              <small class="hint">1 means every month or every year.</small>
            </label>
          </div>

          <div class="field-grid" v-if="priceForm.model !== 'quote'">
            <label class="field">
              <span class="field-label">Stripe price ID (optional)</span>
              <input v-model="priceForm.stripePriceId" class="input" placeholder="price_1AbC…" />
              <small class="hint">
                Set this to bill against a Price already defined in Stripe. Leave blank to charge
                the amount above.
              </small>
            </label>

            <label class="field">
              <span class="field-label">Note under the price</span>
              <input v-model="priceForm.note" class="input" placeholder="Credited against an implementation" />
            </label>
          </div>

          <label class="toggle-row" v-if="priceForm.model !== 'quote'">
            <input type="checkbox" v-model="priceForm.purchasable" />
            <span>
              <strong>Sell this on the site</strong>
              <small>
                Shows a checkout button on the service page. Requires payments to be enabled and
                keys saved under Payments.
              </small>
            </span>
          </label>

          <p v-if="pricePreview" class="preview">Shown to visitors as <strong>{{ pricePreview }}</strong></p>

          <!-- Publication -->
          <h3 class="subhead">Publication</h3>

          <div class="field-grid">
            <label class="field">
              <span class="field-label">Sort order</span>
              <input v-model.number="serviceForm.sortOrder" type="number" min="1" class="input" />
            </label>

            <label class="toggle-row">
              <input type="checkbox" v-model="serviceForm.isPublished" />
              <span><strong>Published</strong><small>Visible on the public site.</small></span>
            </label>
          </div>

          <h3 class="subhead">SEO</h3>

          <div class="field-grid">
            <label class="field">
              <span class="field-label">SEO title</span>
              <input v-model="serviceForm.seo.title" class="input" />
            </label>

            <label class="field">
              <span class="field-label">SEO description</span>
              <input v-model="serviceForm.seo.description" class="input" />
            </label>
          </div>

          <footer class="modal-foot">
            <button type="button" class="ghost-button" @click="showModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save service' }}
            </button>
          </footer>
        </form>
      </div>
    </div>
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-md);
  background: var(--primary-light);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.published {
  background: var(--success-light);
  color: var(--success);
}

.stat-icon.draft {
  background: var(--warning-light);
  color: var(--warning);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--gray-900);
}

.stat-label {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.admin-filters {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
}

.search-box {
  position: relative;
  max-width: 400px;
}

.search-box svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-500);
}

.search-input {
  width: 100%;
  padding: 10px 10px 10px 40px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.admin-table-container {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  background: var(--gray-50);
  padding: 15px 20px;
  text-align: left;
  font-weight: 600;
  color: var(--gray-700);
  border-bottom: 1px solid var(--gray-200);
}

.admin-table td {
  padding: 15px 20px;
  border-bottom: 1px solid var(--gray-100);
}

.table-row:hover {
  background: var(--gray-50);
}

.service-cell {
  min-width: 300px;
}

.service-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-icon {
  color: var(--primary, #3b82f6);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-100);
  border-radius: var(--border-radius-md);
}

.service-title {
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 4px;
}

.service-description {
  color: var(--gray-600);
  font-size: 0.875rem;
  margin-bottom: 4px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.service-slug {
  color: var(--gray-500);
  font-size: 0.75rem;
  font-family: var(--font-mono);
}

.status-badge {
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.published {
  background: var(--success-light);
  color: var(--success-dark);
}

.status-badge.draft {
  background: var(--warning-light);
  color: var(--warning-dark);
}

.date-cell {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.actions-cell {
  width: 120px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.empty-state {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 60px 20px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.empty-icon {
  color: var(--gray-400);
  margin-bottom: 20px;
}

.empty-state h3 {
  color: var(--gray-900);
  margin-bottom: 10px;
}

.empty-state p {
  color: var(--gray-600);
  margin-bottom: 30px;
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

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .admin-table-container {
    overflow-x: auto;
  }
  
  .service-cell {
    min-width: 250px;
  }
  
  .service-description {
    max-width: 200px;
  }
}

/* Editor modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(17, 24, 39, 0.55);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 20px;
  overflow-y: auto;
  z-index: 400;
}

.modal {
  width: 100%;
  max-width: 780px;
  background-color: #ffffff;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--gray-200);
}

.modal-head h2 {
  margin: 0;
  font-size: 1.125rem;
  color: var(--gray-900);
}

.modal-body {
  padding: 24px;
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid var(--gray-200);
  margin-top: 24px;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.field {
  display: block;
  margin-bottom: 16px;
}

.field-label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--gray-700);
}

.input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-md);
  font: inherit;
  color: var(--gray-900);
  background-color: #ffffff;
}

.input:focus {
  outline: none;
  border-color: var(--primary);
}

.input.mono {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
}

.hint {
  display: block;
  margin-top: 5px;
  color: var(--gray-500);
  font-size: 0.75rem;
  line-height: 1.5;
}

.repeat-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.subhead {
  margin: 26px 0 14px;
  font-size: 0.9375rem;
  color: var(--gray-900);
}

.toggle-row {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 12px 14px;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-md);
  background-color: var(--gray-50);
  margin-bottom: 16px;
}

.toggle-row input { margin-top: 3px; }
.toggle-row strong { display: block; color: var(--gray-900); font-size: 0.9375rem; }
.toggle-row small { color: var(--gray-600); line-height: 1.5; }

.preview {
  margin: 0 0 8px;
  color: var(--gray-600);
  font-size: 0.875rem;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-md);
  background-color: #ffffff;
  color: var(--gray-600);
  cursor: pointer;
  flex-shrink: 0;
}

.icon-button:hover {
  background-color: var(--gray-100);
  color: var(--gray-900);
}

.ghost-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-md);
  background-color: #ffffff;
  color: var(--gray-700);
  font: inherit;
  cursor: pointer;
}

.ghost-button.small {
  padding: 6px 12px;
  font-size: 0.8125rem;
}
</style>
