<script setup>
import {
  fetchNotificationTargetBranches,
  fetchNotificationTargetPermissions,
  fetchNotificationTargetRoles,
  fetchNotificationTargetUsers,
  sendNotification,
} from '@/api/notifications'
import TargetSelector from '@/components/notifications/TargetSelector.vue'
import { debounce } from '@/plugins/utils'
import { useLayoutStore } from '@/views/layout/useLayoutStore'
import {
  buildNotificationPayload,
  clearNonSelectedTargetFields,
  validateNotificationForm,
} from '@/views/notifications/send/payloadBuilder'

const emit = defineEmits(['sent'])
const layoutStore = useLayoutStore()

const isSubmitting = ref(false)
const isBootstrapping = ref(false)
const loadingUsers = ref(false)
const backendErrors = ref({})
const formErrors = ref({})

const users = ref([])
const branches = ref([])
const roles = ref([])
const permissionGroups = ref([])
const lastUserSearch = ref('')

const form = reactive({
  title: '',
  body: '',
  target_mode: 'users',
  target_user_ids: [],
  target_branch_id: null,
  target_role_names: [],
  target_permission_names: [],
})

const usersItems = computed(() => users.value.map(user => ({
  value: Number(user.id),
  title: `${user.name || ''} ${user.last_name || ''}`.trim() || `${user.email || ''} (${user.id})`,
})))
const branchesItems = computed(() => branches.value.map(branch => ({
  value: Number(branch.id),
  title: branch.name || `#${branch.id}`,
})))
const roleItems = computed(() => roles.value)

const mergedErrors = computed(() => ({ ...backendErrors.value, ...formErrors.value }))

const resetForm = () => {
  form.title = ''
  form.body = ''
  form.target_mode = 'users'
  form.target_user_ids = []
  form.target_branch_id = null
  form.target_role_names = []
  form.target_permission_names = []
  backendErrors.value = {}
  formErrors.value = {}
}

const loadUsers = async q => {
  try {
    loadingUsers.value = true
    const { data } = await fetchNotificationTargetUsers(q)
    const list = data?.users?.data ?? data?.users ?? []
    users.value = Array.isArray(list) ? list : []
  }
  finally {
    loadingUsers.value = false
  }
}

const searchUsersDebounced = debounce(q => {
  if (form.target_mode !== 'users') return
  const normalized = String(q || '').trim()
  if (normalized === lastUserSearch.value) return
  lastUserSearch.value = normalized
  loadUsers(normalized)
}, 350)

const bootstrap = async () => {
  isBootstrapping.value = true
  try {
    const [branchesRes, rolesRes, permissionsRes] = await Promise.all([
      fetchNotificationTargetBranches(),
      fetchNotificationTargetRoles(),
      fetchNotificationTargetPermissions(),
    ])

    branches.value = Array.isArray(branchesRes?.data?.flat_tree) ? branchesRes.data.flat_tree : []
    roles.value = Array.isArray(rolesRes?.data?.roles) ? rolesRes.data.roles.map(role => role.name).filter(Boolean) : []

    const rawPermissions = permissionsRes?.data?.permissions || {}
    permissionGroups.value = Object.keys(rawPermissions)
      .map(key => ({
        name: rawPermissions[key]?.name || key,
        data: Array.isArray(rawPermissions[key]?.data) ? rawPermissions[key].data : [],
      }))
      .filter(group => Array.isArray(group.data) && group.data.length > 0)

    await loadUsers('')
  }
  catch (error) {
    layoutStore.showErrorSnackbar(error?.response?.data?.message || 'Failed to load notification targets.')
  }
  finally {
    isBootstrapping.value = false
  }
}

const normalizeBackendErrors = errors => {
  const mapped = {}
  const source = errors && typeof errors === 'object' ? errors : {}
  Object.keys(source).forEach(key => {
    const value = Array.isArray(source[key]) ? source[key][0] : source[key]
    if (key === 'target' || key.startsWith('target.')) mapped.target = String(value)
    else mapped[key.replace('target.', 'target_')] = String(value)
  })
  return mapped
}

const submitForm = async () => {
  formErrors.value = validateNotificationForm(form)
  backendErrors.value = {}
  if (Object.keys(formErrors.value).length) return

  const payload = buildNotificationPayload(form)
  isSubmitting.value = true
  try {
    await sendNotification(payload)
    layoutStore.showSuccessSnackbar('Notification sent successfully.')
    emit('sent', payload)
    resetForm()
  }
  catch (error) {
    const status = error?.response?.status
    if (status === 401 || status === 403) {
      layoutStore.showErrorSnackbar(error?.response?.data?.message || 'You have no permission to perform your action')
      return
    }
    backendErrors.value = normalizeBackendErrors(error?.response?.data?.errors)
    layoutStore.showErrorSnackbar(error?.response?.data?.message || 'Failed to send notification.')
  }
  finally {
    isSubmitting.value = false
  }
}

watch(() => form.target_mode, mode => {
  clearNonSelectedTargetFields(form, mode)
  backendErrors.value = {}
  formErrors.value = {}
})

onMounted(() => {
  bootstrap()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText class="pt-6">
          <VForm @submit.prevent="submitForm">
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="form.title"
                  :label="$t('Title')"
                  :placeholder="$t('Enter notification title')"
                  :error-messages="mergedErrors.title ? [$t(mergedErrors.title)] : []"
                />
              </VCol>

              <VCol cols="12">
                <VTextarea
                  v-model="form.body"
                  :label="$t('Body')"
                  :placeholder="$t('Optional notification body')"
                  rows="3"
                />
              </VCol>

              <VCol cols="12">
                <TargetSelector
                  :target-mode="form.target_mode"
                  :target-user-ids="form.target_user_ids"
                  :target-branch-id="form.target_branch_id"
                  :target-role-names="form.target_role_names"
                  :target-permission-names="form.target_permission_names"
                  :users="usersItems"
                  :branches="branchesItems"
                  :roles="roleItems"
                  :permission-groups="permissionGroups"
                  :errors="mergedErrors"
                  :loading-users="loadingUsers"
                  @update:target-mode="form.target_mode = $event"
                  @update:target-user-ids="form.target_user_ids = $event"
                  @update:target-branch-id="form.target_branch_id = $event"
                  @update:target-role-names="form.target_role_names = $event"
                  @update:target-permission-names="form.target_permission_names = $event"
                  @search-users="searchUsersDebounced"
                />
              </VCol>

              <VCol cols="12" class="d-flex justify-end gap-3">
                <VBtn
                  variant="text"
                  color="default"
                  :disabled="isSubmitting || isBootstrapping"
                  @click="resetForm"
                >
                  {{ $t('Clear') }}
                </VBtn>
                <VBtn
                  type="submit"
                  :loading="isSubmitting"
                  :disabled="isSubmitting || isBootstrapping"
                >
                  {{ $t('Send Notification') }}
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
