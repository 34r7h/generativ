<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { cmsAPI } from '../../api/client';
import AppIcon from '../shared/AppIcon.vue';
import AvatarPortrait from '../shared/AvatarPortrait.vue';
import { memberSlug, findMemberBySlug } from '../../config/people';
import { iconFor } from '../../config/icons';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const error = ref(null);
const member = ref(null);
const colleagues = ref([]);

const slug = computed(() => route.params.slug);

// Bios are stored as plain text with blank-line paragraph breaks.
const bioParagraphs = computed(() =>
  (member.value?.bio || '')
    .split(/\n\s*\n/)
    .map((para) => para.trim())
    .filter(Boolean)
);

async function loadMember() {
  try {
    loading.value = true;
    error.value = null;

    const response = await cmsAPI.getTeamMembers();
    if (!response.success) {
      error.value = 'Failed to load team members';
      return;
    }

    const members = (response.members || []).filter((m) => m.isActive !== false);
    const found = findMemberBySlug(members, slug.value);

    if (!found) {
      error.value = 'Team member not found';
      member.value = null;
      return;
    }

    member.value = found;
    colleagues.value = members
      .filter((m) => m.id !== found.id)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .slice(0, 3);
  } catch (err) {
    console.error('Error loading team member:', err);
    error.value = 'Failed to load team member';
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push('/team');
}

onMounted(loadMember);
watch(slug, (value) => {
  if (value) loadMember();
});
</script>

<template>
  <div class="member-page">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading profile...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <h2>Profile Not Found</h2>
      <p>{{ error }}</p>
      <button @click="goBack" class="primary-button">Back to Team</button>
    </div>

    <div v-else-if="member">
      <!-- Profile header -->
      <section class="member-hero">
        <div class="container">
          <div class="member-identity">
            <div class="member-photo">
              <img v-if="member.photo?.filePath" :src="member.photo.filePath" :alt="member.name" />
              <AvatarPortrait v-else :slug="memberSlug(member)" :name="member.name" />
            </div>
            <div class="member-headline">
              <h1>{{ member.name }}</h1>
              <p class="member-position">{{ member.position }}</p>

              <div class="member-contact">
                <a v-if="member.email" :href="`mailto:${member.email}`" class="contact-link">
                  <AppIcon name="mail" :size="18" />
                  <span>{{ member.email }}</span>
                </a>
                <a
                  v-if="member.linkedIn"
                  :href="member.linkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="contact-link"
                >
                  <AppIcon name="linkedin" :size="18" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Profile body -->
      <section class="member-body">
        <div class="container">
          <div class="member-grid">
            <div class="member-main">
              <h2>About</h2>
              <template v-if="bioParagraphs.length">
                <p v-for="(para, index) in bioParagraphs" :key="index" class="member-bio">
                  {{ para }}
                </p>
              </template>
              <p v-else class="member-bio muted">
                A written profile for {{ member.name }} is not published yet.
              </p>

              <div class="member-navigation">
                <button @click="goBack" class="back-button">
                  <AppIcon name="arrowLeft" :size="18" />
                  <span>Back to Team</span>
                </button>
              </div>
            </div>

            <aside class="member-aside" v-if="member.expertise && member.expertise.length">
              <h2>Focus</h2>
              <ul class="expertise-list">
                <li v-for="skill in member.expertise" :key="skill">
                  <AppIcon :name="iconFor(skill)" :size="18" class="expertise-icon" />
                  <span>{{ skill }}</span>
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <!-- Colleagues -->
      <section class="colleagues" v-if="colleagues.length">
        <div class="container">
          <h2>Also on the team</h2>
          <div class="colleagues-grid">
            <router-link
              v-for="colleague in colleagues"
              :key="colleague.id"
              :to="`/team/${memberSlug(colleague)}`"
              class="colleague-card"
            >
              <div class="colleague-photo">
                <img v-if="colleague.photo?.filePath" :src="colleague.photo.filePath" :alt="colleague.name" />
                <AvatarPortrait v-else :slug="memberSlug(colleague)" :name="colleague.name" />
              </div>
              <h3>{{ colleague.name }}</h3>
              <p>{{ colleague.position }}</p>
            </router-link>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.member-page {
  min-height: calc(100vh - 80px - 300px);
}

/* Header */
.member-hero {
  padding: 70px 0;
  background-color: var(--light-blue);
}

.member-identity {
  display: flex;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
}

.member-photo {
  width: 148px;
  height: 148px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--white);
  flex-shrink: 0;
}

.member-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-headline h1 {
  font-size: 2.6rem;
  color: var(--dark-blue);
  margin-bottom: 8px;
}

.member-position {
  font-size: 1.15rem;
  color: var(--light-text);
  margin-bottom: 18px;
}

.member-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--white);
  color: var(--primary-color);
  padding: 8px 14px;
  border-radius: var(--border-radius);
  font-weight: 500;
}

.contact-link:hover {
  background-color: var(--primary-color);
  color: var(--white);
}

/* Body */
.member-body {
  padding: 70px 0;
}

.member-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 48px;
  align-items: start;
}

.member-main h2,
.member-aside h2 {
  font-size: 1.4rem;
  color: var(--dark-blue);
  margin-bottom: 16px;
}

.member-bio {
  font-size: 1.1rem;
  line-height: 1.75;
  color: var(--text-color);
  margin-bottom: 20px;
}

.member-bio:last-of-type {
  margin-bottom: 0;
}

.member-bio.muted {
  color: var(--light-text);
}

.expertise-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.expertise-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  color: var(--text-color);
}

.expertise-list li:last-child {
  border-bottom: none;
}

.expertise-icon {
  color: var(--primary-color);
}

.member-navigation {
  margin-top: 28px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  padding: 10px 0;
}

.back-button:hover {
  text-decoration: underline;
}

/* Colleagues */
.colleagues {
  padding: 70px 0;
  background-color: var(--light-blue);
}

.colleagues h2 {
  font-size: 1.8rem;
  color: var(--dark-blue);
  margin-bottom: 30px;
}

.colleagues-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 260px));
  justify-content: start;
  gap: 24px;
}

.colleague-card {
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 26px;
  text-align: center;
  color: var(--text-color);
  transition: transform 0.3s;
}

.colleague-card:hover {
  transform: translateY(-5px);
}

.colleague-photo {
  width: 84px;
  height: 84px;
  margin: 0 auto 14px;
  border-radius: 50%;
  overflow: hidden;
}

.colleague-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.colleague-card h3 {
  font-size: 1.15rem;
  color: var(--dark-blue);
  margin-bottom: 4px;
}

.colleague-card p {
  color: var(--light-text);
  font-size: 0.95rem;
}

/* States */
.loading-state,
.error-state {
  padding: 100px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 20px;
  border: 3px solid var(--light-blue);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.primary-button {
  display: inline-block;
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  padding: 12px 24px;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
}

@media (max-width: 900px) {
  .member-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

@media (max-width: 640px) {
  .member-identity {
    flex-direction: column;
    text-align: center;
  }

  .member-contact {
    justify-content: center;
  }

  .member-headline h1 {
    font-size: 2.1rem;
  }
}
</style>
