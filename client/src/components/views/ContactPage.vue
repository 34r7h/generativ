<script setup>
import { ref, computed, onMounted } from 'vue';
import { cmsAPI } from '../../api/client';
import AppIcon from '../shared/AppIcon.vue';

// Form data
const formData = ref({
  name: '',
  email: '',
  phone: '',
  company: '',
  subject: '',
  message: '',
  formType: 'contact',
  requestType: 'general'
});

// Form states
const loading = ref(false);
const success = ref(false);
const error = ref(null);

// CMS data
const pageLoading = ref(true);
const siteSettings = ref(null);
// Defaults are only what renders before site settings arrive; every field below
// is overwritten by whatever an admin has saved under Contact details.
const contactInfo = ref({
  email: 'info@generativ.cc',
  phone: '',
  address: '',
  hours: ''
});

// Social profiles come from site settings too; only the ones actually filled in
// are rendered, so no link ever points at "#".
const socialProfiles = computed(() => {
  const links = siteSettings.value?.socialLinks || {};
  return [
    { label: 'LinkedIn', url: links.linkedin },
    { label: 'Twitter', url: links.twitter },
    { label: 'GitHub', url: links.github }
  ].filter(profile => profile.url);
});

const mapsUrl = computed(
  () => `https://maps.google.com/?q=${encodeURIComponent(contactInfo.value.address)}`
);

// Validate form data
function validateForm() {
  if (!formData.value.name.trim()) {
    return 'Please enter your name';
  }
  
  if (!formData.value.email.trim()) {
    return 'Please enter your email address';
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.value.email.trim())) {
    return 'Please enter a valid email address';
  }
  
  if (!formData.value.subject.trim()) {
    return 'Please enter a subject';
  }
  
  if (!formData.value.message.trim()) {
    return 'Please enter your message';
  }
  
  return null;
}

// Load site settings
async function loadPageData() {
  try {
    pageLoading.value = true;
    
    const response = await cmsAPI.getSiteSettings();
    if (response.success && response.settings) {
      siteSettings.value = response.settings;
      
      // Update contact info from site settings
      if (response.settings.contactEmail) {
        contactInfo.value.email = response.settings.contactEmail;
      }
      if (response.settings.contactPhone) {
        contactInfo.value.phone = response.settings.contactPhone;
      }
      // `address` is the schema field; `contactAddress` is what older records
      // were written with. Accept either.
      const address = response.settings.address || response.settings.contactAddress;
      if (address) {
        contactInfo.value.address = address;
      }
      if (response.settings.contactHours) {
        contactInfo.value.hours = response.settings.contactHours;
      }
    }
  } catch (err) {
    console.error('Error loading page data:', err);
  } finally {
    pageLoading.value = false;
  }
}

// Submit form
async function submitForm() {
  // Validate form
  const validationError = validateForm();
  if (validationError) {
    error.value = validationError;
    return;
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    // In a real implementation, this would call an API endpoint
    // For this demo, we'll simulate a successful submission
    console.log('Submitting form data:', formData.value);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful submission
    success.value = true;
    loading.value = false;
    
    // Reset form after success
    formData.value = {
      name: '',
      email: '',
      phone: '',
      company: '',
      subject: '',
      message: '',
      formType: 'contact',
      requestType: 'general'
    };
  } catch (err) {
    console.error('Form submission error:', err);
    error.value = 'Failed to submit the form. Please try again.';
      loading.value = false;
}

onMounted(() => {
  loadPageData();
});
}

function setFormType(type) {
  formData.value.formType = type;
  
  // Set default subject based on form type
  switch (type) {
    case 'assessment':
      formData.value.subject = 'Operational review enquiry';
      break;
    case 'newsletter':
      formData.value.subject = 'Newsletter Subscription';
      break;
    default:
      formData.value.subject = '';
  }
}
</script>

<template>
  <div class="contact-page">
    <!-- Hero Section -->
    <section class="page-hero">
      <div class="container">
        <h1>Contact</h1>
        <p class="hero-description">
          Scoping an operational review starts with a short conversation about how the
          practice currently runs.
        </p>
      </div>
    </section>
    
    <!-- Contact Section -->
    <section class="contact-section">
      <div class="container">
        <div class="contact-grid">
          <div class="contact-form-container">
            <!-- Form Type Selection -->
            <div class="form-type-selector">
              <button 
                :class="['form-type-button', { active: formData.formType === 'contact' }]"
                @click="setFormType('contact')"
              >
                General Contact
              </button>
              <button 
                :class="['form-type-button', { active: formData.formType === 'assessment' }]"
                @click="setFormType('assessment')"
              >
                Request a review
              </button>
              <button 
                :class="['form-type-button', { active: formData.formType === 'newsletter' }]"
                @click="setFormType('newsletter')"
              >
                Join Newsletter
              </button>
            </div>
            
            <!-- Success Message -->
            <div v-if="success" class="success-message">
              <h3>Thank You for Reaching Out!</h3>
              <p>We've received your message and will get back to you shortly.</p>
              <button @click="success = false" class="primary-button">Send Another Message</button>
            </div>
            
            <!-- Contact Form -->
            <form v-else @submit.prevent="submitForm" class="contact-form">
              <h2>{{ 
                formData.formType === 'assessment' ? 'Request an operational review' :
                formData.formType === 'newsletter' ? 'Subscribe to Our Newsletter' : 
                'Send Us a Message' 
              }}</h2>
              
              <!-- Error Message -->
              <div v-if="error" class="error-message">
                {{ error }}
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="name">Name *</label>
                  <input 
                    type="text" 
                    id="name" 
                    v-model="formData.name" 
                    :disabled="loading"
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label for="email">Email *</label>
                  <input 
                    type="email" 
                    id="email" 
                    v-model="formData.email" 
                    :disabled="loading"
                    required
                  />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="phone">Phone</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    v-model="formData.phone" 
                    :disabled="loading"
                  />
                </div>
                
                <div class="form-group">
                  <label for="company">Company</label>
                  <input 
                    type="text" 
                    id="company" 
                    v-model="formData.company" 
                    :disabled="loading"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label for="subject">Subject *</label>
                <input 
                  type="text" 
                  id="subject" 
                  v-model="formData.subject" 
                  :disabled="loading"
                  required
                />
              </div>
              
              <div v-if="formData.formType === 'assessment'" class="form-group">
                <label for="requestType">Type of Operation *</label>
                <select
                  id="requestType"
                  v-model="formData.requestType"
                  :disabled="loading"
                  required
                >
                  <option value="real-estate">Real Estate / Property Management</option>
                  <option value="medical">Dental / Medical / Clinical</option>
                  <option value="legal">Law / Tax / Professional Services</option>
                  <option value="multi-site">Multi-site or complex operation</option>
                  <option value="general">Something else</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="message">Message *</label>
                <textarea 
                  id="message" 
                  v-model="formData.message" 
                  rows="5" 
                  :disabled="loading"
                  required
                ></textarea>
              </div>
              
              <div class="form-actions">
                <button 
                  type="submit" 
                  class="primary-button"
                  :disabled="loading"
                >
                  {{ loading ? 'Sending...' : 'Send Message' }}
                </button>
              </div>
            </form>
          </div>
          
          <div class="contact-info">
            <h2>Get in Touch</h2>

            <!-- Every value below comes from site settings, editable under
                 Admin → Contact details. A field left blank there is omitted
                 rather than shown as a placeholder. -->
            <div class="contact-info-grid">
            <div class="info-item" v-if="contactInfo.email">
              <div class="info-icon"><AppIcon name="mail" :size="22" :label="'Email'" /></div>
              <div class="info-content">
                <h3>Email</h3>
                <p><a :href="`mailto:${contactInfo.email}`">{{ contactInfo.email }}</a></p>
              </div>
            </div>

            <div class="info-item" v-if="contactInfo.phone">
              <div class="info-icon"><AppIcon name="phone" :size="22" :label="'Phone'" /></div>
              <div class="info-content">
                <h3>Phone</h3>
                <p><a :href="`tel:${contactInfo.phone.replace(/[^+\d]/g, '')}`">{{ contactInfo.phone }}</a></p>
              </div>
            </div>

            <div class="info-item" v-if="contactInfo.address">
              <div class="info-icon"><AppIcon name="pin" :size="22" :label="'Office'" /></div>
              <div class="info-content">
                <h3>Office</h3>
                <p class="preserve-lines">{{ contactInfo.address }}</p>
              </div>
            </div>

            <div class="info-item" v-if="contactInfo.hours">
              <div class="info-icon"><AppIcon name="clock" :size="22" :label="'Hours'" /></div>
              <div class="info-content">
                <h3>Business Hours</h3>
                <p class="preserve-lines">{{ contactInfo.hours }}</p>
              </div>
            </div>

            </div>

            <div class="social-links" v-if="socialProfiles.length">
              <h3>Connect With Us</h3>
              <div class="social-icons">
                <a
                  v-for="profile in socialProfiles"
                  :key="profile.label"
                  :href="profile.url"
                  target="_blank"
                  rel="noopener"
                  class="social-icon"
                >{{ profile.label }}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Map Section -->
    <section class="map-section" v-if="contactInfo.address">
      <div class="map-placeholder">
        <div class="map-overlay">
          <h3>Our Location</h3>
          <p class="preserve-lines">{{ contactInfo.address }}</p>
          <a :href="mapsUrl" target="_blank" rel="noopener noreferrer" class="primary-button">
            View on Google Maps
          </a>
        </div>
      </div>
    </section>
    
    <!-- FAQ Section -->
    <section class="faq-section">
      <div class="container">
        <h2>Frequently Asked Questions</h2>
        
        <div class="faq-grid">
          <div class="faq-item">
            <h3>How long does the review take?</h3>
            <p>Two days on site. The written report — readiness assessment, three costed bottlenecks and a 90-day roadmap — is delivered before we leave on the second day.</p>
          </div>

          <div class="faq-item">
            <h3>What does it cost, and what if it finds nothing?</h3>
            <p>$500 flat. It is credited in full against an implementation if you proceed, and refunded if the review does not identify at least $5,000 in annual savings.</p>
          </div>

          <div class="faq-item">
            <h3>Which practices do you work with?</h3>
            <p>Owner-operated practices of roughly 5 to 50 people: real estate and property management, dental and medical, law and tax, and trucking and logistics.</p>
          </div>

          <div class="faq-item">
            <h3>Do you need access to our systems?</h3>
            <p>No. The review is observational — live customer records and transaction databases are not copied, duplicated or stored, and an NDA is signed before the first day.</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- CTA Section -->
  </div>
</template>

<style scoped>
.contact-page {
  min-height: calc(100vh - 80px - 300px);
}

/* Hero Section */
.page-hero {
  background-color: var(--g-ink-2);
  padding: 80px 0;
}

.page-hero h1 {
  font-size: 3rem;
  color: var(--dark-blue);
  margin-bottom: 1rem;
}

.hero-description {
  max-width: 760px;
  margin: 0;
  font-size: 1.2rem;
  color: var(--light-text);
}

/* Contact Section */
.contact-section {
  padding: 80px 0;
}

.contact-grid {
  display: flex;
  flex-direction: column-reverse;
  gap: 40px;
}

.contact-info-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 44px;
}

/* Form Type Selector */
.form-type-selector {
  display: flex;
  gap: 4px;
  margin-bottom: 30px;
  padding: 4px;
  border: 1px solid var(--g-line);
  border-radius: var(--g-r);
  overflow: hidden;
}

.form-type-button {
  flex: 1;
  padding: 11px;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  color: var(--g-text-dim);
  transition: color 150ms ease, background-color 150ms ease;
  font-size: 0.875rem;
}

.form-type-button.active {
  background-color: var(--g-volt-wash);
  color: var(--g-volt);
  border-radius: 3px;
}

.form-type-button:not(.active):hover {
  color: var(--g-text);
}

/* Contact Form */
.contact-form-container {
  background-color: var(--g-ink-2);
  border: 1px solid var(--g-line);
  padding: 30px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.contact-form h2 {
  font-size: 1.375rem;
  margin-bottom: 22px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--dark-blue);
}

input, textarea, select {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--g-line-2);
  border-radius: var(--border-radius);
  font-size: 1rem;
}

textarea {
  resize: vertical;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-actions {
  margin-top: 30px;
}

/* Success and Error Messages */
.success-message {
  background-color: rgba(56, 161, 105, 0.1);
  border-left: 4px solid var(--success);
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.success-message h3 {
  color: var(--success);
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.success-message p {
  margin-bottom: 20px;
  color: var(--text-color);
}

.error-message {
  background-color: rgba(229, 62, 62, 0.1);
  border-left: 4px solid var(--error);
  padding: 15px;
  margin-bottom: 20px;
  color: var(--error);
}

/* Contact Info */
.contact-info {
  align-self: stretch;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 48px;
  background-color: var(--g-ink-2);
  border: 1px solid var(--g-line);
  color: var(--g-text);
  padding: 22px 26px;
  border-radius: var(--g-r);
}

.contact-info h2,
.contact-info h3 { color: inherit; }

.contact-info h2 {
  font-family: var(--g-mono);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--g-text-faint);
  margin: 0;
  white-space: nowrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-icon {
  width: 34px;
  height: 34px;
  border-radius: var(--g-r);
  border: 1px solid var(--g-line-2);
  color: var(--g-volt);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-content h3 {
  font-size: 0.8125rem;
  color: var(--g-text-faint);
  font-weight: 500;
  margin-bottom: 2px;
}

.info-content p {
  color: var(--g-text);
  font-size: 0.9375rem;
  line-height: 1.5;
  margin: 0;
}

/* Address and hours are free text from the admin; keep the line breaks the
   editor typed without letting raw HTML through. */
.preserve-lines {
  white-space: pre-line;
}

.info-content a {
  color: var(--g-text);
  text-decoration: none;
  transition: var(--transition);
}

.info-content a:hover {
  color: var(--g-volt);
  text-decoration: underline;
}

.social-links {
  margin-top: 40px;
}

.social-links h3 {
  font-size: 1.2rem;
  margin-bottom: 15px;
}

.social-icons {
  display: flex;
  gap: 15px;
}

.social-icon {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: var(--transition);
}

.social-icon:hover {
  color: var(--white);
  text-decoration: underline;
}

/* Map Section */
.map-section {
  height: 400px;
  position: relative;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  background-color: #e2e8f0;
  background-image: url('https://maps.googleapis.com/maps/api/staticmap?center=San+Francisco,CA&zoom=13&size=1200x400&key=YOUR_API_KEY');
  background-size: cover;
  position: relative;
}

.map-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 255, 255, 0.9);
  padding: 30px;
  border-radius: var(--border-radius);
  text-align: center;
  min-width: 300px;
}

.map-overlay h3 {
  font-size: 1.5rem;
  color: var(--dark-blue);
  margin-bottom: 10px;
}

.map-overlay p {
  margin-bottom: 20px;
  color: var(--light-text);
}

/* FAQ Section */
.faq-section {
  padding: clamp(56px, 7vw, 92px) 0;
  border-top: 1px solid var(--g-line);
}

.faq-section h2 {
  font-size: var(--g-h2);
  margin-bottom: clamp(34px, 4vw, 50px);
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
}

.faq-item {
  background-color: var(--g-ink-2);
  border: 1px solid var(--g-line);
  padding: 26px;
  border-radius: var(--g-r);
}

.faq-item h3 {
  font-size: 1.0625rem;
  margin-bottom: 10px;
}

.faq-item p { font-size: 0.9375rem; }

.faq-item p {
  color: var(--light-text);
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  padding: clamp(56px, 7vw, 92px) 0;
}

.cta-section h2 {
  font-size: var(--g-h2);
  margin-bottom: 16px;
}

.cta-section p {
  font-size: 1.0625rem;
  margin-bottom: 28px;
}

/* Responsive */
@media (max-width: 992px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
  
  .page-hero h1 {
    font-size: 2.5rem;
  }
  
  .faq-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .form-type-selector {
    flex-direction: column;
  }
  
  .form-type-button {
    padding: 15px;
  }
  
  .contact-form h2,
  .contact-info h2,
  .faq-section h2 {
    font-size: 1.5rem;
  }
}
</style>
