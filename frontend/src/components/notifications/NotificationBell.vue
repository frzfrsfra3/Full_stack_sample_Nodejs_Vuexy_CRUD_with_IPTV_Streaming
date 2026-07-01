<script setup>
import { getUserData, isUserLoggedIn } from '@/router/utils'
import { can } from '@layouts/plugins/casl'
import NotificationItem from '@/components/notifications/NotificationItem.vue'
import Skeleton from '@/components/skeleton.vue'
import { useLayoutStore } from '@/views/layout/useLayoutStore'
import { useNotificationsStore } from '@/views/notifications/useNotificationsStore'

const notificationsStore = useNotificationsStore()
const layoutStore = useLayoutStore()
const route = useRoute()
const router = useRouter()
const userData = ref(getUserData())
const menuOpen = ref(false)

const { t } = useI18n()
const { notifications, unreadCount, loading, lastError } = storeToRefs(notificationsStore)

const userId = computed(() => userData.value?.id || null)
const isAuthenticated = computed(() => Boolean(userId.value))
const badgeLabel = computed(() => {
  if (unreadCount.value <= 0) return ''
  return unreadCount.value > 99 ? '99+' : String(unreadCount.value)
})

const canViewLog = computed(() => can('api.notifications.index-all', 'Sam'))

const initialize = async () => {
  if (!isUserLoggedIn()) {
    notificationsStore.stopRealtime()
    notificationsStore.clearState()
    return
  }

  userData.value = getUserData()
  if (!userData.value?.id) {
    notificationsStore.stopRealtime()
    notificationsStore.clearState()
    return
  }
  await notificationsStore.initializeForUser(userData.value.id)
}

const retryLoad = async () => {
  const result = await notificationsStore.fetchAll()
  if (!result.ok) {
    layoutStore.showErrorSnackbar(lastError.value || t('Failed to load notifications.'))
  }
}

const openLog = () => {
  menuOpen.value = false
  router.push({ name: 'notifications' })
}

onMounted(async () => {
  await initialize()
})

watch(() => route.fullPath, async () => {
  const latest = getUserData()
  if (String(latest?.id || '') !== String(userId.value || '')) {
    await initialize()
  }
})

watch(menuOpen, async open => {
  if (!open || unreadCount.value <= 0) return
  await notificationsStore.markAllRead()
})

onBeforeUnmount(() => {
  notificationsStore.stopRealtime()
})
</script>

<template>
  <VBtn
    v-if="isAuthenticated"
    icon
    variant="text"
    color="default"
    class="notification-bell__activator"
    :aria-label="t('Notifications')"
  >
    <VBadge
      v-if="unreadCount > 0"
      :content="badgeLabel"
      color="error"
      floating
      inline
    >
      <VIcon icon="tabler-bell-ringing" size="22" />
    </VBadge>
    <VIcon v-else icon="tabler-bell" size="22" />

    <VMenu
      v-model="menuOpen"
      activator="parent"
      :close-on-content-click="false"
      location="bottom end"
      offset="12"
      max-width="440"
      min-width="340"
      transition="scale-transition"
      scroll-strategy="reposition"
    >

    <VCard
      class="notification-menu-card"
      elevation="14"
      rounded="xl"
    >
      <div class="notification-menu-card__header">
        <div class="notification-menu-card__header-main">
          <div class="notification-menu-card__badge" aria-hidden="true">
            <VIcon icon="tabler-bell" size="20" />
          </div>
          <div class="min-w-0">
            <div class="text-subtitle-1 font-weight-bold text-high-emphasis leading-tight">
              {{ t('Notifications') }}
            </div>
            <div class="text-caption text-medium-emphasis mt-0.5">
              {{ t('New alerts will appear here') }}
            </div>
          </div>
        </div>
        <VTooltip v-if="canViewLog" location="bottom" :text="t('Open notifications log')">
          <template #activator="{ props: tip }">
            <VBtn
              v-bind="tip"
              icon
              variant="tonal"
              size="small"
              color="primary"
              class="notification-menu-card__log-btn"
              :aria-label="t('Open notifications log')"
              @click="openLog"
            >
              <VIcon icon="tabler-list-details" size="20" />
            </VBtn>
          </template>
        </VTooltip>
      </div>

      <VDivider />

      <VCardText v-if="loading" class="notification-menu-card__state pa-5">
        <div class="notification-menu-card__skeleton d-flex flex-column gap-3">
          <Skeleton height="3.25rem" />
          <Skeleton height="3.25rem" />
          <Skeleton height="3.25rem" />
        </div>
      </VCardText>

      <div v-else-if="lastError" class="notification-menu-card__state pa-4">
        <VAlert type="error" variant="tonal" density="comfortable" rounded="lg" class="mb-3">
          {{ lastError }}
        </VAlert>
        <VBtn block variant="flat" color="primary" @click="retryLoad">
          {{ t('Retry') }}
        </VBtn>
      </div>

      <div v-else-if="!notifications.length" class="notification-menu-card__empty pa-8 text-center">
        <div class="notification-menu-card__empty-icon mb-4">
          <VIcon icon="tabler-bell-off" size="40" />
        </div>
        <div class="text-subtitle-1 font-weight-semibold text-high-emphasis mb-1">
          {{ t("You're all caught up") }}
        </div>
        <div class="text-body-2 text-medium-emphasis">
          {{ t('New alerts will appear here') }}
        </div>
      </div>

      <VList
        v-else
        class="notification-list py-2"
        lines="three"
        density="compact"
        bg-color="transparent"
      >
        <NotificationItem
          v-for="notification in notifications"
          :key="notification.id"
          :notification="notification"
          @navigate="menuOpen = false"
        />
      </VList>
    </VCard>
    </VMenu>
  </VBtn>
</template>

<style scoped>
.notification-bell__activator {
  border-radius: 12px;
}

.notification-bell__activator:hover {
  background: rgba(var(--v-theme-on-surface), 0.06) !important;
}

.notification-menu-card {
  inline-size: min(400px, calc(100vw - 24px));
  max-height: min(72vh, 580px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: linear-gradient(
    180deg,
    color-mix(in srgb, rgb(var(--v-theme-primary)) 6%, rgb(var(--v-theme-surface))) 0%,
    rgb(var(--v-theme-surface)) 22%,
    rgb(var(--v-theme-surface)) 100%
  );
  backdrop-filter: blur(12px);
}

.notification-menu-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 16px 14px;
}

.notification-menu-card__header-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-inline-size: 0;
}

.notification-menu-card__badge {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 44px;
  block-size: 44px;
  border-radius: 12px;
  color: rgb(var(--v-theme-on-primary));
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)) 0%,
    color-mix(in srgb, rgb(var(--v-theme-primary)) 72%, #1a1a2e) 100%
  );
  box-shadow:
    0 4px 12px rgba(var(--v-shadow-key-umbra-color), 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.notification-menu-card__log-btn {
  flex-shrink: 0;
}

.notification-menu-card__state {
  flex: 1;
  min-height: 120px;
}

.notification-menu-card__skeleton {
  background: transparent;
}

.notification-menu-card__empty-icon {
  display: inline-flex;
  padding: 18px;
  border-radius: 50%;
  background: rgba(var(--v-theme-on-surface), 0.06);
  color: rgba(var(--v-theme-on-surface), 0.38);
}

.notification-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-gutter: stable;
  max-height: min(58vh, 460px);
}

.notification-list :deep(.v-list-item__prepend > .v-list-item__spacer) {
  width: 12px;
}

.notification-list :deep(.v-list-item__append > .v-list-item__spacer) {
  width: 4px;
}
</style>
