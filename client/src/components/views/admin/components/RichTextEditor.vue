<template>
  <div class="rich-text-editor">
    <div class="editor-toolbar">
      <button 
        type="button" 
        @click="execCommand('bold')" 
        :class="{ active: isActive('bold') }"
        title="Bold"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>
      </button>
      
      <button 
        type="button" 
        @click="execCommand('italic')" 
        :class="{ active: isActive('italic') }"
        title="Italic"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>
      </button>
      
      <button 
        type="button" 
        @click="execCommand('underline')" 
        :class="{ active: isActive('underline') }"
        title="Underline"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>
      </button>
      
      <div class="toolbar-separator"></div>
      
      <button 
        type="button" 
        @click="execCommand('insertUnorderedList')" 
        :class="{ active: isActive('insertUnorderedList') }"
        title="Bullet List"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
      </button>
      
      <button 
        type="button" 
        @click="execCommand('insertOrderedList')" 
        :class="{ active: isActive('insertOrderedList') }"
        title="Numbered List"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4H4z"></path><path d="M4 10h2"></path><path d="M5 18h1v4H5z"></path><path d="M5 20h2"></path></svg>
      </button>
      
      <div class="toolbar-separator"></div>
      
      <button 
        type="button" 
        @click="showImageDialog = true" 
        title="Insert Image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
      </button>
      
      <button 
        type="button" 
        @click="execCommand('createLink')" 
        title="Insert Link"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
      </button>
      
      <div class="toolbar-separator"></div>
      
      <button 
        type="button" 
        @click="execCommand('formatBlock', '<h1>')" 
        :class="{ active: isActive('formatBlock', '<h1>') }"
        title="Heading 1"
      >
        H1
      </button>
      
      <button 
        type="button" 
        @click="execCommand('formatBlock', '<h2>')" 
        :class="{ active: isActive('formatBlock', '<h2>') }"
        title="Heading 2"
      >
        H2
      </button>
      
      <button 
        type="button" 
        @click="execCommand('formatBlock', '<h3>')" 
        :class="{ active: isActive('formatBlock', '<h3>') }"
        title="Heading 3"
      >
        H3
      </button>
      
      <button 
        type="button" 
        @click="execCommand('formatBlock', '<p>')" 
        :class="{ active: isActive('formatBlock', '<p>') }"
        title="Paragraph"
      >
        P
      </button>
    </div>
    
    <div 
      ref="editorContent" 
      class="editor-content" 
      contenteditable="true"
      @input="handleInput"
      @keydown="handleKeydown"
      v-html="modelValue"
    ></div>
    
    <!-- Image Insert Dialog -->
    <div v-if="showImageDialog" class="image-dialog-overlay" @click="showImageDialog = false">
      <div class="image-dialog" @click.stop>
        <h3>Insert Image</h3>
        <div class="form-group">
          <label for="imageUrl">Image URL:</label>
          <input 
            v-model="imageUrl" 
            type="url" 
            id="imageUrl" 
            placeholder="https://example.com/image.jpg"
          >
        </div>
        <div class="form-group">
          <label for="imageAlt">Alt Text:</label>
          <input 
            v-model="imageAlt" 
            type="text" 
            id="imageAlt" 
            placeholder="Description of the image"
          >
        </div>
        <div class="dialog-buttons">
          <button type="button" @click="insertImage" class="btn btn-primary">Insert</button>
          <button type="button" @click="showImageDialog = false" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
    
    <!-- Link Insert Dialog -->
    <div v-if="showLinkDialog" class="link-dialog-overlay" @click="showLinkDialog = false">
      <div class="link-dialog" @click.stop>
        <h3>Insert Link</h3>
        <div class="form-group">
          <label for="linkUrl">URL:</label>
          <input 
            v-model="linkUrl" 
            type="url" 
            id="linkUrl" 
            placeholder="https://example.com"
          >
        </div>
        <div class="form-group">
          <label for="linkText">Link Text:</label>
          <input 
            v-model="linkText" 
            type="text" 
            id="linkText" 
            placeholder="Click here"
          >
        </div>
        <div class="dialog-buttons">
          <button type="button" @click="insertLink" class="btn btn-primary">Insert</button>
          <button type="button" @click="showLinkDialog = false" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Start typing...'
  }
});

const emit = defineEmits(['update:modelValue']);

const editorContent = ref(null);
const showImageDialog = ref(false);
const showLinkDialog = ref(false);
const imageUrl = ref('');
const imageAlt = ref('');
const linkUrl = ref('');
const linkText = ref('');

// Initialize editor
onMounted(() => {
  if (editorContent.value) {
    editorContent.value.focus();
  }
});

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
  if (editorContent.value && editorContent.value.innerHTML !== newValue) {
    editorContent.value.innerHTML = newValue;
  }
});

// Handle content changes
const handleInput = () => {
  if (editorContent.value) {
    emit('update:modelValue', editorContent.value.innerHTML);
  }
};

// Handle keydown events
const handleKeydown = (event) => {
  if (event.key === 'Enter' && event.shiftKey) {
    event.preventDefault();
    execCommand('insertLineBreak');
  }
};

// Execute document commands
const execCommand = (command, value = null) => {
  document.execCommand(command, false, value);
  editorContent.value?.focus();
};

// Check if a command is active
const isActive = (command, value = null) => {
  if (command === 'formatBlock') {
    return document.queryCommandValue('formatBlock') === value;
  }
  return document.queryCommandState(command);
};

// Insert image
const insertImage = () => {
  if (imageUrl.value) {
    const img = `<img src="${imageUrl.value}" alt="${imageAlt.value || ''}" style="max-width: 100%; height: auto;">`;
    execCommand('insertHTML', img);
    showImageDialog.value = false;
    imageUrl.value = '';
    imageAlt.value = '';
  }
};

// Insert link
const insertLink = () => {
  if (linkUrl.value && linkText.value) {
    const link = `<a href="${linkUrl.value}" target="_blank" rel="noopener noreferrer">${linkText.value}</a>`;
    execCommand('insertHTML', link);
    showLinkDialog.value = false;
    linkUrl.value = '';
    linkText.value = '';
  }
};

// Handle link command
const handleLinkCommand = () => {
  const selection = window.getSelection();
  if (selection.toString()) {
    linkText.value = selection.toString();
  }
  showLinkDialog.value = true;
};

// Override the createLink command
watch(() => showLinkDialog.value, (show) => {
  if (show) {
    handleLinkCommand();
  }
});
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  background: white;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm);
  background-color: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.editor-toolbar button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: 1px solid transparent;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--gray-600);
}

.editor-toolbar button:hover {
  background-color: var(--gray-100);
  border-color: var(--gray-300);
  color: var(--gray-800);
}

.editor-toolbar button.active {
  background-color: var(--primary);
  border-color: var(--primary);
  color: white;
}

.toolbar-separator {
  width: 1px;
  height: 20px;
  background-color: var(--gray-300);
  margin: 0 var(--spacing-xs);
}

.editor-content {
  min-height: 200px;
  padding: var(--spacing-md);
  outline: none;
  line-height: 1.6;
  color: var(--gray-900);
}

.editor-content:empty:before {
  content: attr(placeholder);
  color: var(--gray-400);
  pointer-events: none;
}

.editor-content:focus {
  background-color: var(--gray-50);
}

/* Dialog Styles */
.image-dialog-overlay,
.link-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.image-dialog,
.link-dialog {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  min-width: 400px;
  max-width: 500px;
  box-shadow: var(--shadow-xl);
}

.image-dialog h3,
.link-dialog h3 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--gray-900);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--gray-700);
}

.form-group input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-sm);
  font-size: 0.875rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary);
}

.dialog-buttons {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color var(--transition-fast);
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
}

.btn-secondary {
  background-color: var(--gray-200);
  color: var(--gray-700);
}

.btn-secondary:hover {
  background-color: var(--gray-300);
}

/* Responsive */
@media (max-width: 768px) {
  .editor-toolbar {
    gap: var(--spacing-xs);
  }
  
  .editor-toolbar button {
    width: 28px;
    height: 28px;
  }
  
  .image-dialog,
  .link-dialog {
    min-width: 90vw;
    margin: var(--spacing-md);
  }
}
</style>
