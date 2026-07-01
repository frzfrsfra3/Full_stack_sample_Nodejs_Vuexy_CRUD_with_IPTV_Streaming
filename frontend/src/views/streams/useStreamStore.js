// stores/useStreamStore.js
import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import axios from '@axios'

export const useStreamStore = defineStore('streamStore', () => {
  // ---- State ----
  const streams = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Pagination meta – reactive object so storeToRefs picks it up
  const pagination = reactive({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 15,
  })

  // ---- Actions ----
  async function fetchStreams(filters = {}) {
    loading.value = true
    error.value = null

    try {
      const defaultParams = {
        page: pagination.currentPage,
        per_page: pagination.perPage,
      }
      const params = { ...defaultParams, ...filters }

      const { data } = await axios.get('streams', { params })

      // Assume backend returns paginated response in Laravel format
      // { data: [...], current_page, last_page, total, per_page }
      if (Array.isArray(data)) {
        // Fallback if API returns a plain array
        streams.value = data
        pagination.total = data.length
        pagination.currentPage = 1
        pagination.lastPage = 1
      } else {
        streams.value = data.data
        pagination.currentPage = data.current_page
        pagination.lastPage = data.last_page
        pagination.total = data.total
        pagination.perPage = data.per_page
      }
    } catch (e) {
      error.value = e.response?.data?.message || 'Failed to load streams'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function createStream(form) {
    const { data } = await axios.post('streams', form)
    // Re‑fetch to keep list fresh (or push to array manually)
    await fetchStreams()
    return data
  }

  async function startStream(id) {
    // Optimistic update
    updateStreamInList({ id, status: 'starting' })
    try {
      await axios.post(`streams/${id}/start`)
    } catch (e) {
      // If failure, revert to inactive (or relay error)
      updateStreamInList({ id, status: 'inactive' })
      throw e
    }
  }

  async function stopStream(id) {
    updateStreamInList({ id, status: 'inactive' })
    try {
      await axios.post(`streams/${id}/stop`)
    } catch (e) {
      // Re‑fetch to get correct state
      await fetchStreams()
      throw e
    }
  }

  async function deleteStream(id) {
    await axios.delete(`streams/${id}`)
    streams.value = streams.value.filter(s => s.id !== id)
    pagination.total -= 1
  }
  // stores/useStreamStore.js
async function restartStream(id) {
  // Stop the stream – this immediately sets status to 'inactive'
  await stopStream(id);
  // Start the stream – sets status to 'starting', then the job will eventually set 'active'
  await startStream(id);
}

  /**
   * Merge updated fields into an existing stream or add it.
   * Used by real‑time Echo broadcasts and optimistic UI.
   */
  function updateStreamInList(updatedStream) {
    const index = streams.value.findIndex(s => s.id === updatedStream.id)
    if (index !== -1) {
      streams.value[index] = { ...streams.value[index], ...updatedStream }
    } else {
      // New stream (e.g., just created or broadcast from another user)
      streams.value.unshift(updatedStream)
      pagination.total += 1
    }
  }

  /**
   * Subscribe to the private channel that broadcasts stream status changes.
   * Call once in your app layout or main component.
   */
  function subscribeStreamStatus() {
    window.Echo.channel('stream-monitor')
      .listen('.stream.status.changed', (e) => {
        updateStreamInList(e.stream)
      })
  }

  // Expose everything
  return {
    // state
    streams,
    loading,
    error,
    pagination,

    // actions
    fetchStreams,
    createStream,
    startStream,
    restartStream,
    stopStream,
    deleteStream,
    updateStreamInList,
    subscribeStreamStatus,
  }
})