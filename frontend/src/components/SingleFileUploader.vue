<template>
  <div class="file-uploader">
    <!-- Preview area: show the preview if a file is selected or a fileUrl is provided -->
    <div v-if="previewUrl" class="preview">
      <img :src="previewUrl" alt="File preview" class="preview-image" />
      <button type="button" class="remove-btn" @click="removeFile">
        Remove
      </button>
    </div>

    <!-- Upload input: hidden if a file is already selected -->
    <div v-else class="upload-area">
      <label class="upload-label">
        Click to Upload
        <input
            type="file"
            :accept="accept"
            ref="fileInput"
            @change="onFileChange"
            class="file-input"
        />
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

// Component Props
const props = defineProps({
  // Accepted file types (default is all images)
  accept: {
    type: String,
    default: 'image/*'
  },
  // An existing file URL (e.g. for edit pages)
  fileUrl: {
    type: String,
    default: ''
  },
  // The v-model value (a File object or null)
  modelValue: {
    type: [File, null],
    default: null
  }
})

// Emit update for v-model
const emit = defineEmits(['update:modelValue'])

// Local references and reactive data
const fileInput = ref(null)
const previewUrl = ref(props.fileUrl || '')

// Watch for changes in fileUrl prop to update preview (if not already overridden)
watch(
    () => props.fileUrl,
    newUrl => {
      if (!previewUrl.value) {
        previewUrl.value = newUrl
      }
    }
)

// When user selects a file from the dialog
function onFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    emit('update:modelValue', file)
    // Create an object URL for preview
    const objectUrl = URL.createObjectURL(file)
    previewUrl.value = objectUrl
  }
}

// Remove the current file and clear the preview
function removeFile() {
  emit('update:modelValue', null)
  // If the preview is from an object URL, release it
  if (previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = ''
  if (fileInput.value) {
    fileInput.value.value = '' // Reset file input value
  }
}

// Clean up the object URL when component is unmounted
onBeforeUnmount(() => {
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<style scoped>
.file-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2px dashed #ccc;
}

.upload-area {

  padding: 1rem;
  cursor: pointer;
  text-align: center;
  width: 100%;
}

.upload-label {
  display: block;
  cursor: pointer;
}

.file-input {
  display: none;
}

.preview {
  position: relative;
  padding: 1em;
}

.preview-image {
  max-width: 100%;
  height: auto;
  display: block;
  border-radius: 10px;
  margin-bottom: 0.5rem;
}

.remove-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #ff4d4f;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
}
</style>
