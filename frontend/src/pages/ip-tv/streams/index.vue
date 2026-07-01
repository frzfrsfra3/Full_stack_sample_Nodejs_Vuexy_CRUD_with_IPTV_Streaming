<template>
  <VCard flat>
    <VCardText>
      <!-- Toolbar -->
      <VRow class="mb-4">
        <VCol cols="12" class="d-flex justify-end gap-2">
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            :to="{ name: 'ip-tv-streams-add' }"
          >
            {{ $t('Add Stream') }}
          </VBtn>
          <VBtn
            color="secondary"
            variant="outlined"
            prepend-icon="tabler-file-excel"
            @click="exportToExcel"
          >
            {{ $t('Export Excel') }}
          </VBtn>
          <VBtn
            color="info"
            variant="outlined"
            prepend-icon="tabler-settings"
            @click="showColumnSelector = true"
          >
            {{ $t('Columns') }}
          </VBtn>
        </VCol>
      </VRow>

      <!-- Data Table -->
      <VRow>
        <VCol cols="12">
          <VTable class="text-no-wrap">
            <thead>
              <tr>
                <th v-for="col in visibleColumnsList" :key="col.key">{{ col.label }}</th>
                <th>{{ $t('Actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading -->
              <tr v-if="loading">
                <td :colspan="visibleColumnsList.length + 1" class="text-center pa-5">
                  <VProgressCircular indeterminate color="primary" />
                </td>
              </tr>
              <!-- Empty -->
              <tr v-else-if="streams.length === 0">
                <td :colspan="visibleColumnsList.length + 1" class="text-center pa-5">
                  {{ $t('No streams found') }}
                </td>
              </tr>
              <!-- Rows -->
              <tr v-for="stream in streams" :key="stream.id">
                <template v-for="col in visibleColumnsList" :key="col.key">
                  <td v-if="col.key === 'title'">
                    <span class="font-weight-medium">{{ stream.title }}</span>
                  </td>
                  <td v-else-if="col.key === 'slug'">{{ stream.slug }}</td>
                  <td v-else-if="col.key === 'profile'">
                    {{ stream.profile?.title || $t('All') }}
                  </td>
                  <td v-else-if="col.key === 'source_url'">{{ stream.source_url }}</td>
                  <td v-else-if="col.key === 'status'">
                    <VChip
                      :color="statusColor(stream.status)"
                      size="small"
                      class="text-capitalize"
                    >
                      <VProgressCircular
                        v-if="stream.status === 'starting'"
                        indeterminate
                        size="16"
                        width="2"
                        class="me-1"
                      />
                      {{ stream.status }}
                    </VChip>
                  </td>
                </template>
                <!-- Actions -->
                <td>
                  <VBtn icon variant="text" color="default" size="x-small">
                    <VIcon icon="tabler-dots-vertical" />
                    <VMenu activator="parent">
                      <VList>
                        <VListItem
                          v-if="stream.status !== 'active' && stream.status !== 'starting'"
                          @click="startStream(stream.id)"
                        >
                          <template #prepend>
                            <VIcon icon="tabler-player-play" class="me-3" />
                          </template>
                          <VListItemTitle>{{ $t('Start') }}</VListItemTitle>
                        </VListItem>
                        <VListItem
                          v-if="stream.status === 'active'"
                          @click="stopStream(stream.id)"
                        >
                          <template #prepend>
                            <VIcon icon="tabler-player-stop" class="me-3" />
                          </template>
                          <VListItemTitle>{{ $t('Stop') }}</VListItemTitle>
                        </VListItem>
                                        <VListItem
                    v-if="stream.status === 'active'"
                    @click="restartStream(stream.id)"
                  >
                    <template #prepend>
                      <VIcon icon="tabler-refresh" class="me-3" />
                    </template>
                    <VListItemTitle>{{ $t('Restart') }}</VListItemTitle>
                  </VListItem> 
                  <VListItem @click="copyStreamLink(stream.slug)">
                      <template #prepend>
                        <VIcon icon="tabler-link" class="me-3" />
                      </template>
                      <VListItemTitle>{{ $t('Copy Link') }}</VListItemTitle>
                    </VListItem> 
                        <VListItem @click="confirmDelete(stream.id)">
                          <template #prepend>
                            <VIcon icon="tabler-trash" class="me-3" />
                          </template>
                          <VListItemTitle>{{ $t('Delete') }}</VListItemTitle>
                        </VListItem>
                      </VList>
                    </VMenu>
                  </VBtn>
                </td>
              </tr>
            </tbody>
          </VTable>

          <!-- Pagination -->
          <div class="d-flex align-center justify-end mt-4">
            <span class="text-sm text-disabled me-3">{{ paginationMeta }}</span>
            <VPagination
              v-model="currentPage"
              :length="lastPage"
              :total-visible="5"
              size="small"
              @update:model-value="changePage"
            />
          </div>
        </VCol>
      </VRow>
    </VCardText>

    <!-- Column Selector Dialog -->
    <VDialog v-model="showColumnSelector" max-width="600px">
      <VCard>
        <VCardTitle class="text-h5">{{ $t('Select Columns') }}</VCardTitle>
        <VCardText>
          <VList>
            <VListItem
              v-for="col in allColumns"
              :key="col.key"
              @click="toggleColumn(col.key)"
            >
              <template #prepend>
                <VCheckbox
                  :model-value="isColumnVisible(col.key)"
                  @update:model-value="toggleColumn(col.key)"
                  hide-details
                />
              </template>
              <VListItemTitle>{{ col.label }}</VListItemTitle>
            </VListItem>
          </VList>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn color="primary" @click="showColumnSelector = false">{{ $t('Close') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Confirmation -->
    <VDialog v-model="deleteDialog" max-width="400px">
      <VCard>
        <VCardTitle class="text-h5">{{ $t('Delete Stream') }}</VCardTitle>
        <VCardText>{{ $t('Are you sure?') }}</VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="deleteDialog = false">{{ $t('Cancel') }}</VBtn>
          <VBtn color="error" @click="deleteStream">{{ $t('Delete') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VCard>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStreamStore } from '@/stores/streams'   // use the Pinia store that has Socket.IO listener
import * as XLSX from 'xlsx'

const { t } = useI18n()
const store = useStreamStore()

const { streams, loading, pagination } = storeToRefs(store)

// Pagination
const currentPage = ref(1)
const lastPage = computed(() => pagination.value.lastPage)
const paginationMeta = computed(() => {
  if (pagination.value.total === 0) return ''
  const start = (currentPage.value - 1) * pagination.value.perPage + 1
  const end = Math.min(currentPage.value * pagination.value.perPage, pagination.value.total)
  return `Showing ${start} to ${end} of ${pagination.value.total} entries`
})

// Columns
const allColumns = [
  { key: 'title', label: t('Title') },
  { key: 'slug', label: t('Slug') },
  { key: 'profile', label: t('Profile') },
  { key: 'source_url', label: t('Source URL') },
  { key: 'status', label: t('Status') }
]
const defaultVisible = ['title', 'profile', 'status', 'source_url']
const visibleColumns = ref([])
const showColumnSelector = ref(false)

const visibleColumnsList = computed(() =>
  allColumns.filter(col => visibleColumns.value.includes(col.key))
)
const isColumnVisible = (key) => visibleColumns.value.includes(key)
const toggleColumn = (key) => {
  if (visibleColumns.value.includes(key)) {
    visibleColumns.value = visibleColumns.value.filter(k => k !== key)
  } else {
    visibleColumns.value.push(key)
  }
  localStorage.setItem('streams_columns', JSON.stringify(visibleColumns.value))
}
const loadColumnPreferences = () => {
  const saved = localStorage.getItem('streams_columns')
  if (saved) {
    try {
      visibleColumns.value = JSON.parse(saved).filter(key => allColumns.some(c => c.key === key))
      return
    } catch {}
  }
  visibleColumns.value = [...defaultVisible]
}

// Export
const exportToExcel = () => {
  const headers = visibleColumnsList.value.map(c => c.label)
  const data = streams.value.map(s =>
    visibleColumnsList.value.map(col => {
      if (col.key === 'title') return s.title
      if (col.key === 'slug') return s.slug
      if (col.key === 'profile') return s.profile?.title ?? ''
      if (col.key === 'source_url') return s.source_url
      if (col.key === 'status') return s.status
      return ''
    })
  )
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Streams')
  XLSX.writeFile(wb, `streams_${new Date().toISOString()}.xlsx`)
}

// Actions
const deleteDialog = ref(false)
const streamIdToDelete = ref(null)
const confirmDelete = (id) => {
  streamIdToDelete.value = id
  deleteDialog.value = true
}
const deleteStream = async () => {
  await store.deleteStream(streamIdToDelete.value)
  deleteDialog.value = false
}
const copyStreamLink = (slug) => {
  const link = `http://192.168.130.72:9001/channels/${slug}/index.m3u8`
  navigator.clipboard.writeText(link).then(() => {
    console.log('Copied:', link)
  })
}
const startStream = async (id) => {
  try {
    await store.startStream(id)
  } catch (e) {
    console.error(e)
  }
}
const stopStream = async (id) => {
  try {
    await store.stopStream(id)
  } catch (e) {
    console.error(e)
  }
}
const restartStream = async (id) => {
  try {
    await store.restartStream(id)
  } catch (e) {
    console.error(e)
  }
}
const changePage = (page) => {
  currentPage.value = page
  store.fetchStreams({ page, per_page: pagination.value.perPage })
}
const statusColor = (status) => {
  if (status === 'active') return 'success'
  if (status === 'starting') return 'warning'
  return 'grey'
}

// Real‑time updates are handled by the Pinia store (stores/streams.js)
// No need for setupEcho / teardownEcho

onMounted(async () => {
  loadColumnPreferences()
  await store.fetchStreams({ page: currentPage.value, per_page: pagination.value.perPage })
})
</script>
