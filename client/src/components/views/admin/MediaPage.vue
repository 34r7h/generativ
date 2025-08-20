<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminSidebar from './components/AdminSidebar.vue';
import AdminHeader from './components/AdminHeader.vue';
import { cmsAPI } from '../../../api/client';

const router = useRouter();
const loading = ref(true);
const error = ref(null);
const mediaFiles = ref([]);

const loadMedia = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await cmsAPI.getAllMedia();
    if (response.success) {
      mediaFiles.value = response.media || [];
    } else {
      throw new Error(response.error || 'Failed to load media files');
    }
  } catch (err) {
    console.error('Error loading media:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};


const uploading = ref(false);
const fileInput = ref(null);

const uploadMedia = async () => {
  if (!fileInput.value || !fileInput.value.files.length) return;
  uploading.value = true;
  error.value = null;
  const file = fileInput.value.files[0];
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', file.name);
  try {
    const response = await cmsAPI.uploadMedia(formData);
    if (response.success) {
      await loadMedia();
      fileInput.value.value = '';
    } else {
      throw new Error(response.error || 'Failed to upload media');
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    uploading.value = false;
  }
};

const triggerFileUpload = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const deleteMedia = async (mediaItem) => {
  try {
    const response = await cmsAPI.deleteMedia(mediaItem.id);
    if (response.success) {
      await loadMedia();
    } else {
      throw new Error(response.error || 'Failed to delete media');
    }
  } catch (err) {
    error.value = err.message;
  }
};

onMounted(() => {
  loadMedia();
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
                <h1>Media Management</h1>
                <p>Upload and manage media assets</p>
              </div>
              <div class="header-right">
                <input type="file" ref="fileInput" style="display:none" @change="uploadMedia" />
                <button @click="triggerFileUpload" class="btn btn-primary" :disabled="uploading">
                  <span v-if="uploading">Uploading...</span>
                  <span v-else>Upload Media</span>
                </button>
              </div>
            </div>

            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>Loading media files...</p>
            </div>

            <div v-else-if="mediaFiles.length > 0" class="media-grid">
              <div v-for="media in mediaFiles" :key="media.id" class="media-item">
                <div class="media-preview">
                  <img v-if="media.type?.startsWith('image')" :src="media.url" :alt="media.title" />
                  <div v-else class="file-icon">
                    📄
                  </div>
                </div>
                <div class="media-info">
                  <div class="media-title">{{ media.title }}</div>
                  <div class="media-size">{{ media.size || 'Unknown size' }}</div>
                </div>
                <div class="media-actions">
                  <button @click="deleteMedia(media)" class="btn btn-sm btn-danger">
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <div class="empty-icon">📁</div>
              <h3>No media files</h3>
              <p>Upload your first media file to get started.</p>
              <button @click="triggerFileUpload" class="btn btn-primary">
                Upload Media
              </button>
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

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.media-item {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.media-preview {
  width: 100%;
  height: 160px;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  background: var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  font-size: 3rem;
  color: var(--gray-400);
}

.media-info {
  flex: 1;
}

.media-title {
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 4px;
}

.media-size {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.media-actions {
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 60px 20px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.empty-icon {
  font-size: 4rem;
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
</style>
