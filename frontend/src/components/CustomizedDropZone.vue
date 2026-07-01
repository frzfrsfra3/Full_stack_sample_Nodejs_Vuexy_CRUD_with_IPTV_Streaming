<script setup>
import { ref, watch, onMounted } from 'vue'
import { useDropZone, useFileDialog, useObjectUrl } from '@vueuse/core'

// Define props
const props = defineProps({
  modelValue: {
    type: [Array, Object, String],
    default: () => [],
  },
  multiple: {
    type: Boolean,
    default: true,
  },
  accept: {
    type: String,
    default: 'image/*',
  },
  title: {
    type: String,
    default: '',
  },
  buttonText: {
    type: String,
    default: '',
  },
  fullImageUrl: {
    type: String,
    default: ''
  }
})

// Define emits
const emit = defineEmits(['update:modelValue'])

// References and reactive data
const dropZoneRef = ref(null)
const fileData = ref([])

// Helper function to normalize incoming file data
const normalizeFileData = () => {
  // Priority to fullImageUrl if provided
  if (props.fullImageUrl) {
    return [{ file: null, url: props.fullImageUrl }]
  }

  // Normalize modelValue to an array of file objects
  if (props.modelValue) {
    if (Array.isArray(props.modelValue)) {
      return props.modelValue.map(item => {
        if (item && typeof item === 'object' && item.file) {
          return { file: item.file, url: item.url }
        } else if (typeof item === 'string') {
          return { file: null, url: item }
        }
        return { file: null, url: '' }
      })
    } else if (props.modelValue && typeof props.modelValue === 'object' && props.modelValue.file) {
      return [{ file: props.modelValue.file, url: props.modelValue.url }]
    } else if (typeof props.modelValue === 'string') {
      return [{ file: null, url: props.modelValue }]
    }
  }

  return []
}

// Emit updated fileData
const emitFiles = () => {
  emit('update:modelValue', fileData.value)
}

// Watch changes in props and update fileData accordingly
watch(
    () => [props.modelValue, props.fullImageUrl],
    () => {
      fileData.value = normalizeFileData()
      emitFiles()
    },
    { immediate: true }
)

// Handle files dropped into the drop zone
const onDrop = (droppedFiles) => {
  droppedFiles?.forEach(file => {
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed')
      return
    }
    const newFile = {
      file,
      url: useObjectUrl(file).value || '',
    }
    if (props.multiple) {
      fileData.value.push(newFile)
    } else {
      fileData.value = [newFile]
    }
    emitFiles()
  })
}

// File dialog handler using VueUse's useFileDialog
const { open, files } = useFileDialog({ accept: props.accept, multiple: props.multiple })

watch(files, (selectedFiles) => {
  if (!selectedFiles) return

  const newFiles = Array.from(selectedFiles).map(file => ({
    file,
    url: useObjectUrl(file).value || '',
  }))

  if (props.multiple) {
    fileData.value.push(...newFiles)
  } else {
    fileData.value = newFiles
  }
  emitFiles()
})

// Remove a file from the fileData array
const removeFile = index => {
  fileData.value.splice(index, 1)
  emitFiles()
}

// Initialize drop zone on mounted
onMounted(() => {
  // Already normalized by the immediate watcher
  useDropZone(dropZoneRef, onDrop)
})
</script>

<template>
  <div class="flex">
    <div class="w-full h-auto relative">
      <div ref="dropZoneRef" class="cursor-pointer" @click="open">
        <!-- Display placeholder when no files -->
        <div v-if="fileData.length === 0" class="d-flex flex-column justify-center align-center gap-y-2 pa-12 drop-zone rounded">
          <IconBtn variant="tonal" class="rounded-sm">
            <VIcon icon="tabler-upload" />
          </IconBtn>
          <h4 class="text-h4">
            {{ title || $t('Drag and drop your image here.') }}
          </h4>
          <span class="text-disabled">or</span>
          <VBtn variant="tonal" size="small">
            {{ buttonText || $t('Browse Images') }}
          </VBtn>
        </div>

        <!-- Display previews of selected files -->
        <div v-else class="d-flex justify-center align-center gap-3 pa-8 drop-zone flex-wrap">
          <VRow class="match-height w-100">
            <template v-for="(item, index) in fileData" :key="index">
              <VCol cols="12" sm="4">
                <VCard :ripple="false" border>
                  <VCardText class="d-flex flex-column" @click.stop>
                    <VImg :src="item.url" width="200px" class="w-100 mx-auto" />
                    <div v-if="item.file" class="mt-2">
                      <span class="clamp-text text-wrap">{{ item.file.name }}</span>
                      <span>{{ (item.file.size / 1000).toFixed(2) }} KB</span>
                    </div>
                  </VCardText>
                  <VCardActions>
                    <VBtn variant="text" block @click.stop="removeFile(index)">
                      {{ $t('Remove File') }}
                    </VBtn>
                  </VCardActions>
                </VCard>
              </VCol>
            </template>
          </VRow>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.drop-zone {
  border: 1px dashed rgba(var(--v-theme-on-surface), var(--v-border-opacity));
}
</style>
