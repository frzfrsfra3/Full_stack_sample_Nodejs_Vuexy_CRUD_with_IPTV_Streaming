<script setup>
import { ref, onMounted } from 'vue'
import { useStreamStore } from '@/views/streams/useStreamStore'
import { useRouter } from 'vue-router'
import { requiredValidator } from '@validators'
import { useIpTvProfilesStore } from '@/views/ipTvProfiles/useIpTvProfilesStore'

const store = useStreamStore()
const router = useRouter()
const profilesStore = useIpTvProfilesStore()

const form = ref({
  title: '',
  slug: '',
  source_url: '',
  source_type: 'hls',
  profile_id: null       // null means all profiles can access
})

const refForm = ref(null)

onMounted(() => {
  // Fetch profiles if not already loaded
  if (!profilesStore.profiles.length) {
    profilesStore.fetchProfiles()
  }
})

const generateSlug = () => {
  if (form.value.title) {
    form.value.slug = form.value.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }
}

const submit = async () => {
  const { valid } = await refForm.value.validate()
  if (!valid) return

  try {
    await store.createStream(form.value)
    router.push({ name: 'ip-tv-streams' }) // adjust route name
  } catch (e) {
    console.error('Stream creation failed:', e)
  }
}
</script>

<template>
  <VCard>
    <VCardTitle>Add New Stream</VCardTitle>
    <VForm ref="refForm" @submit.prevent="submit">
      <VRow>
        <VCol cols="6">
          <VTextField v-model="form.title" label="Title" :rules="[requiredValidator]" @input="generateSlug" />
        </VCol>
        <VCol cols="6">
          <VTextField v-model="form.slug" label="Slug (URL identifier)" :rules="[requiredValidator]" />
        </VCol>
        <VCol cols="6">
          <VSelect v-model="form.source_type" :items="['hls','rtmp','file']" label="Source Type" />
        </VCol>
        <VCol cols="6">
          <VTextField v-model="form.source_url" label="Source URL" :rules="[requiredValidator]" />
        </VCol>
        <VCol cols="6">
          <VSelect
            v-model="form.profile_id"
            :items="profilesStore.profiles"
            item-title="title"
            item-value="id"
            label="Restrict to Profile (optional)"
            clearable
          />
        </VCol>
      </VRow>
      <VBtn type="submit" color="primary" class="mt-4">Save</VBtn>
    </VForm>
  </VCard>
</template>

