<script setup>
const props = defineProps({
  targetMode: { type: String, required: true },
  targetUserIds: { type: Array, default: () => [] },
  targetBranchId: { type: [Number, String, null], default: null },
  targetRoleNames: { type: Array, default: () => [] },
  targetPermissionNames: { type: Array, default: () => [] },
  users: {
    type: Array,
    default: () => [],
  },
  branches: {
    type: Array,
    default: () => [],
  },
  roles: {
    type: Array,
    default: () => [],
  },
  permissionGroups: {
    type: Array,
    default: () => [],
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
  loadingUsers: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:targetMode', 'update:targetUserIds', 'update:targetBranchId', 'update:targetRoleNames', 'update:targetPermissionNames', 'search-users'])
const { t, te } = useI18n()

const targetModes = [
  { title: 'Admins', value: 'users' },
  { title: 'Branch', value: 'branch' },
  { title: 'Roles', value: 'roles' },
  { title: 'Permissions', value: 'permissions' },
  { title: 'All users', value: 'all_users' },
]

const getPermissionLabel = permission => {
  if (permission.description) return permission.description

  return te(permission.name) ? t(permission.name) : permission.name
}
</script>

<template>
  <VCard variant="tonal" class="pa-4">
    <VCardTitle class="text-subtitle-1 px-0">
      {{ $t('Target audience') }}
    </VCardTitle>

    <VRadioGroup
      :model-value="targetMode"
      inline
      :error-messages="errors.target ? [$t(errors.target)] : []"
      @update:model-value="emit('update:targetMode', $event)"
    >
      <VRadio
        v-for="mode in targetModes"
        :key="mode.value"
        :label="$t(mode.title)"
        :value="mode.value"
      />
    </VRadioGroup>

    <VAutocomplete
      v-if="targetMode === 'users'"
      :model-value="targetUserIds"
      :items="users"
      item-title="title"
      item-value="value"
      chips
      multiple
      clearable
      :label="$t('Start typing to search...')"
      :loading="loadingUsers"
      :error-messages="errors.target_user_ids ? [$t(errors.target_user_ids)] : []"
      @update:model-value="emit('update:targetUserIds', $event)"
      @update:search="emit('search-users', $event)"
    />

    <VSelect
      v-else-if="targetMode === 'branch'"
      :model-value="targetBranchId"
      :items="branches"
      item-title="title"
      item-value="value"
      clearable
      :label="$t('Branch')"
      :error-messages="errors.target_branch_id ? [$t(errors.target_branch_id)] : []"
      @update:model-value="emit('update:targetBranchId', $event)"
    />

    <VAutocomplete
      v-else-if="targetMode === 'roles'"
      :model-value="targetRoleNames"
      :items="roles"
      chips
      multiple
      clearable
      :label="$t('Roles')"
      :error-messages="errors.target_role_names ? [$t(errors.target_role_names)] : []"
      @update:model-value="emit('update:targetRoleNames', $event)"
    />

    <div v-else-if="targetMode === 'permissions'">
      <div class="text-body-2 mb-2">{{ $t('Permissions') }}</div>
      <VExpansionPanels
        multiple
        variant="accordion"
        class="expansion-panels-width-border"
      >
        <VExpansionPanel
          v-for="(group, groupIndex) in permissionGroups"
          :key="`permission-group-${groupIndex}`"
          elevation="0"
        >
          <VExpansionPanelTitle>
            {{ group.name }}
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <VRow>
              <VCol
                v-for="permission in group.data"
                :key="permission.name"
                cols="12"
                md="6"
                lg="4"
                class="d-flex align-center gap-3"
              >
                <VSwitch
                  :model-value="targetPermissionNames"
                  :value="permission.name"
                  @update:model-value="emit('update:targetPermissionNames', $event)"
                />
                <p class="mb-0">
                  {{ getPermissionLabel(permission) }}
                </p>
              </VCol>
            </VRow>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>
      <div
        v-if="errors.target_permission_names"
        class="text-error text-caption mt-2"
      >
        {{ $t(errors.target_permission_names) }}
      </div>
    </div>

    <VAlert
      v-else
      type="warning"
      variant="tonal"
      class="mt-2"
    >
      {{ $t('This notification will be sent to all users.') }}
    </VAlert>
  </VCard>
</template>
