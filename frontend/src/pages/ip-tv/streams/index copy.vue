<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useStreamStore } from '@/views/streams/useStreamStore'
import { getEcho } from '@/plugins/reverb'   // ✅ correct
import DialogCloseBtn from '@core/components/DialogCloseBtn.vue'

const store = useStreamStore()
const filters = ref({ per_page: 10 })
const deleteDialog = ref(false)
const tempId = ref(null)

let channel = null

// Real-time listener
const setupEcho = () => {
  const echo = getEcho()
  if (!echo) return

  channel = echo.channel('stream-monitor')
    .listen('.stream.status.changed', (e) => {
      store.updateStreamInList(e.stream)
    })
}

const teardownEcho = () => {
  if (channel) {
    getEcho()?.leave('stream-monitor')
    channel = null
  }
}

onMounted(async () => {
  await store.fetchStreams(filters.value)
  setupEcho()
})

onUnmounted(() => {
  teardownEcho()
})

// Refresh list when filters change
watch(filters, async () => {
  await store.fetchStreams(filters.value)
}, { deep: true })

const deleteStream = async () => {
  await store.deleteStream(tempId.value)
  deleteDialog.value = false
  await store.fetchStreams(filters.value)
}

const startStream = async (id) => {
  try {
    await store.startStream(id)
  } catch (err) {
    console.error(err)
  }
}

const stopStream = async (id) => {
  try {
    await store.stopStream(id)
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <div>
  <VCard>
    <VCardTitle class="d-flex justify-space-between">
      <h2>Streams</h2>
      <VBtn :to="{ name: 'ip-tv-streams-add' }" color="primary">Add Stream</VBtn>
    </VCardTitle>

    <VTable class="text-no-wrap">
      <thead>
        <tr>
          <th>Title</th>
          <th>Slug</th>
          <th>Profile</th>
          <th>Status</th>
          <th>ٍSource URL</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="stream in store.streams" :key="stream.id">
          <td>{{ stream.title }}</td>
          <td>{{ stream.slug }}</td>
          <td>{{ stream.profile?.title || 'All' }}</td>
     
          <td>
            <VChip :color="stream.status === 'active' ? 'success' : 'warning'" small>
              {{ stream.status }}
            </VChip>
          </td>
                   <td>{{ stream.source_url }}</td>
          <td class="d-flex gap-2">
            <VBtn icon size="x-small" @click="startStream(stream.id)" :disabled="stream.status === 'active'">
              <VIcon>tabler-player-play</VIcon>
            </VBtn>
            <VBtn icon size="x-small" @click="stopStream(stream.id)" :disabled="stream.status !== 'active'">
              <VIcon>tabler-player-stop</VIcon>
            </VBtn>
            <VBtn icon size="x-small" @click="deleteDialog = true; tempId = stream.id">
              <VIcon>tabler-trash</VIcon>
            </VBtn>
          </td>
        </tr>
        <tr v-if="!store.streams.length">
          <td colspan="5" class="text-center">No streams available</td>
        </tr>
      </tbody>
    </VTable>
  </VCard>

  <!-- Delete confirmation dialog -->
  <VDialog v-model="deleteDialog" width="500">
    <DialogCloseBtn @click="deleteDialog = false" />
    <VCard title="Confirm Delete">
      <VCardText>Are you sure you want to delete this stream?</VCardText>
      <VCardActions>
        <VBtn @click="deleteDialog = false">No</VBtn>
        <VBtn color="error" @click="deleteStream">Yes</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</div>
</template>
