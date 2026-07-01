<template>
  <VCard>
    <VCardTitle>{{ $t('Watch Stream') }}</VCardTitle>
    <VCardText>
      <VRow>
        <VCol cols="4">
          <VSelect
            v-model="selectedStreamId"
            :items="streams"
            item-title="title"
            item-value="id"
            :label="$t('Select Stream')"
            @update:model-value="onStreamSelect"
          />
        </VCol>
        <VCol cols="3">
          <VTextField v-model="username" :label="$t('Username')" />
        </VCol>
        <VCol cols="3">
          <VTextField v-model="password" :label="$t('Password')" type="password" />
        </VCol>
        <VCol cols="2" class="d-flex align-end">
          <VBtn color="primary" @click="loadStream" :loading="loading">
            {{ $t('Play') }}
          </VBtn>
        </VCol>
      </VRow>

      <VRow v-if="sourceUrl" class="mt-4">
        <VCol cols="12">
          <video ref="videoPlayer" controls style="width: 100%; max-height: 70vh;" />
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@axios'
import Hls from 'hls.js'

const streams = ref([])
const selectedStreamId = ref(null)
const selectedStream = ref(null)
const username = ref('')
const password = ref('')
const sourceUrl = ref('')
const loading = ref(false)
const videoPlayer = ref(null)
let hls = null

onMounted(async () => {
  const { data } = await axios.get('/streams') // adjust if needed
  streams.value = data.data || data
})

const onStreamSelect = () => {
  selectedStream.value = streams.value.find(s => s.id === selectedStreamId.value)
  // Optionally clear previous player
  destroyHls()
  sourceUrl.value = ''
}

const loadStream = () => {
  if (!selectedStreamId.value || !username.value || !password.value) return

  loading.value = true
  const slug = selectedStream.value.slug
  // Construct the authenticated HLS URL
  const url = `http://${username.value}:${encodeURIComponent(password.value)}@192.168.130.72:9001/channels/${slug}/index.m3u8`
  sourceUrl.value = url

  // Wait for DOM update then attach player
  setTimeout(() => {
    if (videoPlayer.value) {
      if (Hls.isSupported()) {
        hls = new Hls()
        hls.loadSource(url)
        hls.attachMedia(videoPlayer.value)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoPlayer.value.play()
        })
      } else if (videoPlayer.value.canPlayType('application/vnd.apple.mpegurl')) {
        videoPlayer.value.src = url
        videoPlayer.value.play()
      }
    }
    loading.value = false
  }, 100)
}

const destroyHls = () => {
  if (hls) {
    hls.destroy()
    hls = null
  }
}
</script>