<script setup>
import { ref, onMounted } from 'vue';
import { cmsAPI } from '../../api/client';

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
const contactInfo = ref({
  email: 'info@generativ.cc',
  phone: '+1 (555) 123-4567',
  address: 'San Francisco, CA'
});

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
      if (response.settings.contactAddress) {
        contactInfo.value.address = response.settings.contactAddress;
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
      formData.value.subject = 'AI Vulnerability Scan Request';
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
        <h1>Contact Us</h1>
        <p class="hero-description">
          Get in touch with our team to discuss how we can help with your AI safety and performance needs.
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
                Request Assessment
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
                formData.formType === 'assessment' ? 'Request AI Vulnerability Scan' : 
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
                <label for="requestType">Assessment Type *</label>
                <select 
                  id="requestType" 
                  v-model="formData.requestType" 
                  :disabled="loading"
                  required
                >
                  <option value="general">General Assessment</option>
                  <option value="safety">Safety Testing</option>
                  <option value="performance">Performance Optimization</option>
                  <option value="comprehensive">Comprehensive Evaluation</option>
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
            
            <div class="info-item">
              <div class="info-icon">📧</div>
              <div class="info-content">
                <h3>Email</h3>
                <p><a href="mailto:info@generativ.cc">info@generativ.cc</a></p>
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-icon">📞</div>
              <div class="info-content">
                <h3>Phone</h3>
                <p><a href="tel:+15551234567">+1 (555) 123-4567</a></p>
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-icon">📍</div>
              <div class="info-content">
                <h3>Office</h3>
                <p>
                  123 AI Innovation Center<br>
                  San Francisco, CA 94105<br>
                  United States
                </p>
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-icon">⏰</div>
              <div class="info-content">
                <h3>Business Hours</h3>
                <p>
                  Monday - Friday: 9am - 6pm PST<br>
                  Saturday - Sunday: Closed
                </p>
              </div>
            </div>
            
            <div class="social-links">
              <h3>Connect With Us</h3>
              <div class="social-icons">
                <a href="#" class="social-icon">LinkedIn</a>
                <a href="#" class="social-icon">Twitter</a>
                <a href="#" class="social-icon">GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Map Section -->
    <section class="map-section">
      <div class="map-placeholder">
        <div class="map-overlay">
          <h3>Our Location</h3>
          <p>123 AI Innovation Center, San Francisco, CA 94105</p>
          <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" class="primary-button">
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
            <h3>How long does an assessment typically take?</h3>
            <p>Our standard assessments are typically completed within 2-3 weeks, depending on the complexity and scale of your AI systems.</p>
          </div>
          
          <div class="faq-item">
            <h3>Do you offer remote services?</h3>
            <p>Yes, we offer both on-site and remote consulting services to accommodate clients around the world.</p>
          </div>
          
          <div class="faq-item">
            <h3>What industries do you specialize in?</h3>
            <p>We work with clients across various industries including finance, healthcare, media, and technology, with particular expertise in high-regulatory environments.</p>
          </div>
          
          <div class="faq-item">
            <h3>How do I prepare for an initial consultation?</h3>
            <p>We recommend preparing a brief overview of your current AI systems, key challenges, and desired outcomes to make the most of our initial discussion.</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <h2>Ready to Transform Your AI Implementation?</h2>
        <p>Take the first step towards safer, more efficient AI systems.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.contact-page {
  min-height: calc(100vh - 80px - 300px);
}

/* Hero Section */
.page-hero {
  background-color: var(--light-blue);
  padding: 80px 0;
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

/* Contact Section */
.contact-section {
  padding: 80px 0;
}

.contact-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

/* Form Type Selector */
.form-type-selector {
  display: flex;
  margin-bottom: 30px;
  background-color: var(--light-blue);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.form-type-button {
  flex: 1;
  padding: 12px;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  color: var(--text-color);
  transition: var(--transition);
  font-size: 0.9rem;
}

.form-type-button.active {
  background-color: var(--primary-color);
  color: var(--white);
}

.form-type-button:not(.active):hover {
  background-color: rgba(76, 111, 255, 0.1);
}

/* Contact Form */
.contact-form-container {
  background-color: var(--white);
  padding: 30px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.contact-form h2 {
  font-size: 1.8rem;
  color: var(--dark-blue);
  margin-bottom: 20px;
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
  border: 1px solid #ddd;
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

.primary-button {
  background-color: var(--primary-color);
  color: var(--white);
  padding: 12px 24px;
  border-radius: var(--border-radius);
  font-weight: 500;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: var(--transition);
}

.primary-button:hover {
  background-color: #3a5ad9;
}

.primary-button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
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
  background-color: var(--dark-blue);
  color: var(--white);
  padding: 30px;
  border-radius: var(--border-radius);
}

.contact-info h2 {
  font-size: 1.8rem;
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  margin-bottom: 25px;
  align-items: flex-start;
}

.info-icon {
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  margin-right: 15px;
  flex-shrink: 0;
}

.info-content h3 {
  font-size: 1.2rem;
  margin-bottom: 5px;
}

.info-content p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

.info-content a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: var(--transition);
}

.info-content a:hover {
  color: var(--white);
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
  padding: 80px 0;
  background-color: var(--light-blue);
}

.faq-section h2 {
  font-size: 2.5rem;
  text-align: center;
  color: var(--dark-blue);
  margin-bottom: 50px;
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
}

.faq-item {
  background-color: var(--white);
  padding: 25px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.faq-item h3 {
  font-size: 1.3rem;
  color: var(--dark-blue);
  margin-bottom: 15px;
}

.faq-item p {
  color: var(--light-text);
  line-height: 1.6;
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
