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
                <h1>Team Management</h1>
                <p>Manage team members and their profiles</p>
              </div>
              <div class="header-right">
                <button @click="createMember" class="btn btn-primary">
                  Add Team Member
                </button>
              </div>
            </div>
            
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>Loading team members...</p>
            </div>
            
            <div v-else-if="teamMembers.length > 0" class="admin-table-container">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="member in teamMembers" :key="member.id" class="table-row">
                    <td class="member-cell">
                      <div class="member-info">
                        <div class="member-avatar">
                          {{ member.name.charAt(0).toUpperCase() }}
                        </div>
                        <div class="member-details">
                          <div class="member-name">{{ member.name }}</div>
                          <div class="member-email">{{ member.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="position-cell">{{ member.position }}</td>
                    <td>
                      <span :class="['status-badge', member.isActive ? 'active' : 'inactive']">
                        {{ member.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="actions-cell">
                      <div class="action-buttons">
                        <button @click="editMember(member)" class="btn btn-sm btn-secondary" title="Edit">
                          Edit
                        </button>
                        <button @click="deleteMember(member)" class="btn btn-sm btn-danger" title="Delete">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div v-else class="empty-state">
              <h3>No team members found</h3>
              <p>Get started by adding your first team member.</p>
              <button @click="createMember" class="btn btn-primary">
                Add Team Member
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Team Member Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingMember ? 'Edit' : 'Add' }} Team Member</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        
        <form @submit.prevent="saveMember" class="team-form">
          <div class="form-row">
            <div class="form-group">
              <label for="name">Name *</label>
              <input 
                id="name"
                v-model="memberForm.name" 
                type="text" 
                placeholder="Enter full name"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="position">Position *</label>
              <input 
                id="position"
                v-model="memberForm.position" 
                type="text" 
                placeholder="Job title or role"
                required
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="bio">Bio</label>
            <textarea 
              id="bio"
              v-model="memberForm.bio" 
              placeholder="Brief professional bio..."
              rows="4"
            ></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                id="email"
                v-model="memberForm.email" 
                type="email" 
                placeholder="email@company.com"
              />
            </div>
            
            <div class="form-group">
              <label for="linkedIn">LinkedIn URL</label>
              <input 
                id="linkedIn"
                v-model="memberForm.linkedIn" 
                type="url" 
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>
          
          <div class="form-group">
            <label>Areas of Expertise</label>
            <div class="expertise-list">
              <div 
                v-for="(skill, index) in memberForm.expertise" 
                :key="index"
                class="expertise-item"
              >
                <input 
                  v-model="memberForm.expertise[index]" 
                  type="text" 
                  placeholder="e.g. Machine Learning, AI Safety"
                />
                <button 
                  type="button" 
                  @click="removeExpertise(index)"
                  class="remove-btn"
                >
                  Remove
                </button>
              </div>
              <button 
                type="button" 
                @click="addExpertise"
                class="add-expertise-btn"
              >
                + Add Expertise
              </button>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="userId">Link to Admin User (optional)</label>
              <input 
                id="userId"
                v-model="memberForm.userId" 
                type="text" 
                placeholder="Admin user ID if this person has admin access"
              />
            </div>
            
            <div class="form-group">
              <label>
                <input 
                  v-model="memberForm.isActive" 
                  type="checkbox"
                />
                Active member
              </label>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
            <button type="submit" :disabled="saving" class="btn btn-primary">
              {{ saving ? 'Saving...' : (editingMember ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import AdminSidebar from './components/AdminSidebar.vue';
import AdminHeader from './components/AdminHeader.vue';
import { cmsAPI } from '../../../api/client';

const router = useRouter();
const loading = ref(true);
const error = ref(null);
const teamMembers = ref([]);

const loadTeamMembers = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await cmsAPI.getTeamMembers();
    if (response.success) {
      teamMembers.value = response.members || [];
    } else {
      throw new Error(response.error || 'Failed to load team members');
    }
  } catch (err) {
    console.error('Error loading team members:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const showModal = ref(false);
const editingMember = ref(null);
const saving = ref(false);

// Form data for creating/editing team members
const memberForm = ref({
  name: '',
  position: '',
  bio: '',
  expertise: [],
  email: '',
  linkedIn: '',
  userId: '', // Link to admin user
  isActive: true,
  sortOrder: 1
});

const createMember = () => {
  editingMember.value = null;
  memberForm.value = {
    name: '',
    position: '',
    bio: '',
    expertise: [],
    email: '',
    linkedIn: '',
    userId: '',
    isActive: true,
    sortOrder: teamMembers.value.length + 1
  };
  showModal.value = true;
};

const editMember = (member) => {
  editingMember.value = member;
  memberForm.value = {
    name: member.name,
    position: member.position,
    bio: member.bio,
    expertise: [...(member.expertise || [])],
    email: member.email || '',
    linkedIn: member.linkedIn || '',
    userId: member.userId || '',
    isActive: member.isActive,
    sortOrder: member.sortOrder
  };
  showModal.value = true;
};

const deleteMember = async (member) => {
  if (!confirm(`Are you sure you want to delete ${member.name}?`)) {
    return;
  }
  
  try {
    const response = await cmsAPI.deleteTeamMember(member.id);
    if (response.success) {
      await loadTeamMembers();
    } else {
      throw new Error(response.error || 'Failed to delete team member');
    }
  } catch (err) {
    console.error('Error deleting team member:', err);
    error.value = err.message;
  }
};

const saveMember = async () => {
  try {
    saving.value = true;
    
    // Validate form
    if (!memberForm.value.name || !memberForm.value.position) {
      throw new Error('Name and position are required');
    }
    
    // Filter out empty expertise
    memberForm.value.expertise = memberForm.value.expertise.filter(skill => skill.trim());
    
    let response;
    if (editingMember.value) {
      response = await cmsAPI.updateTeamMember(editingMember.value.id, memberForm.value);
    } else {
      response = await cmsAPI.createTeamMember(memberForm.value);
    }
    
    if (response.success) {
      showModal.value = false;
      await loadTeamMembers();
    } else {
      throw new Error(response.error || 'Failed to save team member');
    }
  } catch (err) {
    console.error('Error saving team member:', err);
    error.value = err.message;
  } finally {
    saving.value = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  editingMember.value = null;
};

const addExpertise = () => {
  memberForm.value.expertise.push('');
};

const removeExpertise = (index) => {
  memberForm.value.expertise.splice(index, 1);
};

onMounted(() => {
  loadTeamMembers();
});
</script>

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

.member-cell {
  min-width: 300px;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
}

.member-name {
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 4px;
}

.member-email {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.position-cell {
  min-width: 200px;
  color: var(--gray-700);
}

.status-badge {
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background: var(--success-light);
  color: var(--success-dark);
}

.status-badge.inactive {
  background: var(--danger-light);
  color: var(--danger-dark);
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 0;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--dark-text);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--light-text);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
}

.close-btn:hover {
  background: var(--light-bg);
  color: var(--dark-text);
}

.team-form {
  padding: var(--spacing-lg);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 600;
  color: var(--dark-text);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 14px;
  transition: border-color var(--transition-normal);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.expertise-list {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-sm);
}

.expertise-item {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  align-items: center;
}

.expertise-item input {
  flex: 1;
  margin-bottom: 0;
}

.remove-btn {
  background: var(--danger-color);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}

.add-expertise-btn {
  background: var(--light-bg);
  color: var(--primary-color);
  border: 1px dashed var(--primary-color);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius);
  cursor: pointer;
  width: 100%;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all var(--transition-normal);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-secondary {
  background: var(--light-bg);
  color: var(--dark-text);
  border: 1px solid var(--border-color);
}
</style>
