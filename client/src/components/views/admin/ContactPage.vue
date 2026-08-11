<script setup>
/**
 * Contact details (/admin/contact).
 *
 * These live in site settings rather than in a page record, because the footer
 * and the public contact page both read them. Field names match what the public
 * side reads: contactEmail, contactPhone, address, contactHours, socialLinks.
 *
 * saveSiteSettings spreads whatever object it is given, so contactHours needs
 * no server-side migration; it simply persists alongside the rest.
 */
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminSidebar from './components/AdminSidebar.vue';
import AdminHeader from './components/AdminHeader.vue';
import AppIcon from '../../shared/AppIcon.vue';
import { cmsAPI } from '../../../api/client';

const router = useRouter();
const loading = ref(true);
const saving = ref(false);
const error = ref(null);
const notice = ref(null);

// The whole settings object is kept so that saving contact details does not
// drop footer columns, SEO or analytics written by the settings page.
const settings = ref({});

const form = ref({
  contactEmail: '',
  contactPhone: '',
  address: '',
  contactHours: '',
  socialLinks: { linkedin: '', twitter: '', github: '' }
});

// The enquiries the public form now writes. Until this existed there was no
// screen anywhere that showed them.
const submissions = ref([]);
const inboxError = ref(null);
const inboxLoading = ref(true);

const newCount = computed(() => submissions.value.filter((s) => s.status === 'new').length);

function formatWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

async function loadSubmissions() {
  try {
    inboxLoading.value = true;
    inboxError.value = null;
    const response = await cmsAPI.getContactSubmissions();
    if (response.success) {
      submissions.value = response.submissions || [];
    } else {
      inboxError.value = response.error || 'Could not load enquiries.';
    }
  } catch (err) {
    console.error('Failed to load submissions:', err);
    inboxError.value = 'Could not load enquiries.';
  } finally {
    inboxLoading.value = false;
  }
}

async function setStatus(submission, status) {
  const previous = submission.status;
  submission.status = status;
  const response = await cmsAPI.updateContactSubmission(submission.id, status).catch(() => null);
  if (!response?.success) {
    submission.status = previous;
    inboxError.value = 'Could not update that enquiry.';
  }
}

async function loadSettings() {
  try {
    loading.value = true;
    error.value = null;

    const response = await cmsAPI.getSiteSettings();
    if (response.success && response.settings) {
      settings.value = response.settings;
      form.value = {
        contactEmail: response.settings.contactEmail || '',
        contactPhone: response.settings.contactPhone || '',
        // Older records wrote the address as contactAddress; read both.
        address: response.settings.address || response.settings.contactAddress || '',
        contactHours: response.settings.contactHours || '',
        socialLinks: {
          linkedin: response.settings.socialLinks?.linkedin || '',
          twitter: response.settings.socialLinks?.twitter || '',
          github: response.settings.socialLinks?.github || ''
        }
      };
    }
  } catch (err) {
    console.error('Error loading settings:', err);
    error.value = err.message || 'Failed to load contact details';
  } finally {
    loading.value = false;
  }
}

async function save() {
  try {
    saving.value = true;
    error.value = null;
    notice.value = null;

    const payload = {
      ...settings.value,
      contactEmail: form.value.contactEmail.trim(),
      contactPhone: form.value.contactPhone.trim(),
      address: form.value.address.trim(),
      // Kept in step so records written before the rename stay consistent.
      contactAddress: form.value.address.trim(),
      contactHours: form.value.contactHours.trim(),
      socialLinks: {
        ...settings.value.socialLinks,
        linkedin: form.value.socialLinks.linkedin.trim(),
        twitter: form.value.socialLinks.twitter.trim(),
        github: form.value.socialLinks.github.trim()
      }
    };

    const response = await cmsAPI.updateSiteSettings(payload);
    if (!response.success) throw new Error(response.error || 'Failed to save contact details');

    settings.value = payload;
    notice.value = 'Contact details saved.';
  } catch (err) {
    console.error('Error saving contact details:', err);
    error.value = err.message || 'Failed to save contact details';
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  if (!localStorage.getItem('authToken')) {
    router.push('/admin/login');
    return;
  }
  loadSettings();
});
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar />

    <div class="admin-content">
      <AdminHeader
        title="Contact details"
        subtitle="Used by the contact page and the site footer."
      />

      <div v-if="loading" class="state-panel">
        <div class="spinner"></div>
        <p>Loading contact details…</p>
      </div>

      <template v-else>
        <div v-if="error" class="banner danger">
          <AppIcon name="alert" :size="20" />
          <p>{{ error }}</p>
        </div>

        <div v-if="notice" class="banner success">
          <AppIcon name="check" :size="20" />
          <p>{{ notice }}</p>
        </div>

        <section class="panel">
          <div class="panel-head">
            <h2>
              Enquiries
              <span class="count" v-if="newCount">{{ newCount }} new</span>
            </h2>
            <button class="ghost-button small" type="button" @click="loadSubmissions">
              <AppIcon name="workflow" :size="15" />
              <span>Refresh</span>
            </button>
          </div>

          <p v-if="inboxError" class="inbox-note danger">{{ inboxError }}</p>
          <p v-else-if="inboxLoading" class="inbox-note">Loading enquiries…</p>
          <p v-else-if="!submissions.length" class="inbox-note">
            Nothing yet. Messages sent through the contact form appear here.
          </p>

          <ul v-else class="inbox">
            <li v-for="item in submissions" :key="item.id" class="enquiry" :class="item.status">
              <div class="enquiry-head">
                <div>
                  <strong>{{ item.subject }}</strong>
                  <span class="enquiry-from">
                    {{ item.name }} —
                    <a :href="`mailto:${item.email}`">{{ item.email }}</a>
                    <template v-if="item.company"> · {{ item.company }}</template>
                    <template v-if="item.phone"> · {{ item.phone }}</template>
                  </span>
                </div>
                <div class="enquiry-meta">
                  <span class="when">{{ formatWhen(item.submittedAt) }}</span>
                  <select
                    class="input status-select"
                    :value="item.status"
                    @change="setStatus(item, $event.target.value)"
                  >
                    <option value="new">New</option>
                    <option value="inProgress">In progress</option>
                    <option value="completed">Done</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <p class="enquiry-message">{{ item.message }}</p>
            </li>
          </ul>
        </section>

        <form class="panel" @submit.prevent="save">
          <div class="panel-head">
            <h2>How people reach you</h2>
            <div class="panel-actions">
              <a href="/contact" target="_blank" rel="noopener" class="ghost-button small">
                <AppIcon name="external" :size="15" />
                <span>View</span>
              </a>
              <button class="primary-button" type="submit" :disabled="saving">
                <AppIcon name="check" :size="16" />
                <span>{{ saving ? 'Saving…' : 'Save details' }}</span>
              </button>
            </div>
          </div>

          <div class="field-grid">
            <label class="field">
              <span class="field-label"><AppIcon name="mail" :size="15" /> Email</span>
              <input v-model="form.contactEmail" type="email" class="input" placeholder="hello@example.com" />
            </label>

            <label class="field">
              <span class="field-label"><AppIcon name="phone" :size="15" /> Phone</span>
              <input v-model="form.contactPhone" type="tel" class="input" placeholder="+1 555 000 0000" />
            </label>
          </div>

          <label class="field">
            <span class="field-label"><AppIcon name="pin" :size="15" /> Address</span>
            <textarea v-model="form.address" rows="3" class="input" placeholder="Street, city, country"></textarea>
          </label>

          <label class="field">
            <span class="field-label"><AppIcon name="clock" :size="15" /> Hours</span>
            <textarea
              v-model="form.contactHours"
              rows="2"
              class="input"
              placeholder="Monday to Friday, 9am to 6pm"
            ></textarea>
          </label>

          <h3 class="subhead">Social profiles</h3>

          <div class="field-grid">
            <label class="field">
              <span class="field-label"><AppIcon name="linkedin" :size="15" /> LinkedIn</span>
              <input v-model="form.socialLinks.linkedin" type="url" class="input" placeholder="https://linkedin.com/company/…" />
            </label>

            <label class="field">
              <span class="field-label"><AppIcon name="external" :size="15" /> X / Twitter</span>
              <input v-model="form.socialLinks.twitter" type="url" class="input" placeholder="https://x.com/…" />
            </label>

            <label class="field">
              <span class="field-label"><AppIcon name="external" :size="15" /> GitHub</span>
              <input v-model="form.socialLinks.github" type="url" class="input" placeholder="https://github.com/…" />
            </label>
          </div>
        </form>
      </template>
    </div>
  </div>
</template>

<style scoped>
.count {
  display: inline-block;
  margin-left: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary);
}

.inbox-note { color: var(--gray-600); margin: 0; }
.inbox-note.danger { color: var(--danger); }

.inbox { list-style: none; margin: 0; padding: 0; }

.enquiry {
  border-top: 1px solid var(--gray-200);
  padding: 16px 0;
}

.enquiry.completed,
.enquiry.archived { opacity: 0.6; }

.enquiry-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.enquiry-from {
  display: block;
  font-size: 0.85rem;
  color: var(--gray-600);
  margin-top: 3px;
}

.enquiry-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.when { font-size: 0.8rem; color: var(--gray-500); }

.status-select { width: auto; padding: 5px 8px; font-size: 0.8rem; }

.enquiry-message {
  margin: 10px 0 0;
  color: var(--gray-700);
  font-size: 0.9rem;
  line-height: 1.6;
  white-space: pre-line;
}

.admin-layout {
  display: grid;
  grid-template-columns: auto 1fr;
  min-height: 100vh;
  background-color: var(--gray-100);
}

.admin-content {
  padding: var(--spacing-lg);
  min-width: 0;
}

.state-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-3xl);
  background-color: #ffffff;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-lg);
  color: var(--gray-600);
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--gray-200);
  border-top-color: var(--primary);
  border-radius: var(--border-radius-full);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.banner {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-lg);
  color: #ffffff;
}

.banner p {
  margin: 0;
}

.banner.danger { background-color: var(--danger); }
.banner.success { background-color: var(--success); }

.panel {
  background-color: #ffffff;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  max-width: 900px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.panel-head h2 {
  margin: 0;
  font-size: 1.125rem;
  color: var(--gray-900);
}

.panel-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.subhead {
  margin: var(--spacing-xl) 0 var(--spacing-md);
  font-size: 0.9375rem;
  color: var(--gray-900);
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-md);
}

.field {
  display: block;
  margin-bottom: var(--spacing-md);
}

.field-label {
  display: flex;
  align-items: center;
  gap: 7px;
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
  background-color: #ffffff;
  color: var(--gray-900);
  font: inherit;
}

.input:focus {
  outline: none;
  border-color: var(--primary);
}

.primary-button,
.ghost-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  border-radius: var(--border-radius-md);
  border: 1px solid transparent;
  font-size: 0.9375rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
}

.primary-button {
  background-color: var(--primary);
  color: #ffffff;
}

.primary-button:hover:not(:disabled) {
  background-color: var(--primary-dark);
}

.primary-button:disabled {
  opacity: 0.65;
  cursor: default;
}

.ghost-button {
  background-color: #ffffff;
  border-color: var(--gray-300);
  color: var(--gray-700);
}

.ghost-button:hover {
  background-color: var(--gray-100);
  color: var(--gray-900);
}

.ghost-button.small {
  padding: 6px 12px;
  font-size: 0.8125rem;
}

@media (max-width: 992px) {
  .admin-content {
    padding: var(--spacing-md);
  }
}
</style>
