<script setup>
import { formatDateToMonthShort } from '@/@core/utils/formatters'

const props = defineProps({
  notification: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['navigate'])
const router = useRouter()
const { t } = useI18n()

const extractLinkFromNotification = n => {
  let data = n?.data
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    }
    catch {
      data = null
    }
  }
  if ((!data || typeof data !== 'object') && n?.notification?.data != null) {
    const nested = n.notification.data
    if (typeof nested === 'string') {
      try {
        data = JSON.parse(nested)
      }
      catch {
        data = null
      }
    }
    else {
      data = nested
    }
  }
  const fromData = data && typeof data === 'object' ? data.link : null
  if (typeof fromData === 'string' && fromData.trim())
    return fromData.trim()

  const body = String(n?.body || '').trim()
  if (!body)
    return null
  try {
    const parsed = JSON.parse(body)
    const link = parsed?.data?.link
    if (typeof link === 'string' && link.trim())
      return link.trim()
  }
  catch {
    return null
  }
  return null
}

/** Backend sends a trusted in-app path; only normalize slashes and a leading `/` for the router. */
const normalizeAppPath = raw => {
  if (raw == null || typeof raw !== 'string')
    return null
  const path = raw.trim().replace(/\\/g, '/')
  if (!path)
    return null
  return path.startsWith('/') ? path : `/${path}`
}

const safePath = computed(() => normalizeAppPath(extractLinkFromNotification(props.notification)))

const previewBody = computed(() => {
  const body = String(props.notification?.body || '')
  if (body.length <= 120)
    return body
  return `${body.slice(0, 120)}...`
})

const createdAtText = computed(() => formatDateToMonthShort(props.notification?.created_at, false))
const isUnread = computed(() => !props.notification?.read_at)

const typeKey = computed(() => {
  const raw = String(
    props.notification?.type
      ?? props.notification?.notification?.type
      ?? props.notification?.data?.type
      ?? '',
  ).toLowerCase().trim()
  if (['info', 'error', 'warning', 'success'].includes(raw))
    return raw
  return 'default'
})

const typeIcon = computed(() => {
  const map = {
    info: 'tabler-info-circle',
    success: 'tabler-circle-check',
    warning: 'tabler-alert-triangle',
    error: 'tabler-alert-circle',
    default: 'tabler-bell',
  }
  return map[typeKey.value] || map.default
})

const itemClass = computed(() => ({
  [`notification-item--type-${typeKey.value}`]: true,
  'notification-item--unread': isUnread.value,
  'notification-item--clickable': Boolean(safePath.value),
}))

const onItemClick = () => {
  const path = safePath.value
  if (!path) return
  emit('navigate')
  router.push(path)
}

const onKeyNavigate = e => {
  if (!safePath.value) return
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    onItemClick()
  }
}
</script>

<template>
  <VListItem
    class="notification-item"
    :class="itemClass"
    :tabindex="safePath ? 0 : undefined"
    :role="safePath ? 'button' : undefined"
    :aria-label="safePath ? t('Open linked page') : undefined"
    @click="onItemClick"
    @keydown="onKeyNavigate"
  >
    <template #prepend>
      <div class="notification-item__type" aria-hidden="true">
        <VIcon :icon="typeIcon" size="20" class="notification-item__type-icon" />
      </div>
    </template>

    <div class="notification-item__content">
      <div class="notification-item__row">
        <VListItemTitle class="notification-item__title text-wrap">
          {{ notification.title }}
        </VListItemTitle>
        <span class="notification-item__time text-caption text-medium-emphasis">{{ createdAtText }}</span>
      </div>

      <VListItemSubtitle v-if="previewBody" class="notification-item__body text-body-2">
        {{ previewBody }}
      </VListItemSubtitle>
    </div>

    <template v-if="safePath" #append>
      <VIcon
        icon="tabler-chevron-right"
        size="18"
        class="notification-item__chevron text-medium-emphasis"
        aria-hidden="true"
      />
    </template>
  </VListItem>
</template>

<style scoped>
.notification-item {
  --ni-accent: rgb(var(--v-theme-primary));
  --ni-accent-soft: rgba(var(--v-theme-primary), 0.14);
  --ni-accent-glow: rgba(var(--v-theme-primary), 0.35);

  position: relative;
  margin-block: 4px;
  margin-inline: 6px;
  padding-block: 12px;
  padding-inline: 10px 8px;
  min-block-size: 72px;
  border-radius: 14px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 1px 2px rgba(var(--v-shadow-key-umbra-color), 0.04);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease,
    background-color 0.2s ease;
}

.notification-item::after {
  content: '';
  position: absolute;
  inset-block: 10px;
  inset-inline-end: 0;
  inline-size: 3px;
  border-radius: 4px;
  background: var(--ni-accent);
  opacity: 0.35;
  transition: opacity 0.2s ease;
}

.notification-item--type-info {
  --ni-accent: #2196f3;
  --ni-accent-soft: rgba(33, 150, 243, 0.14);
  --ni-accent-glow: rgba(33, 150, 243, 0.35);
}

.notification-item--type-success {
  --ni-accent: #4caf50;
  --ni-accent-soft: rgba(76, 175, 80, 0.14);
  --ni-accent-glow: rgba(76, 175, 80, 0.35);
}

.notification-item--type-warning {
  --ni-accent: #ff9800;
  --ni-accent-soft: rgba(255, 152, 0, 0.16);
  --ni-accent-glow: rgba(255, 152, 0, 0.38);
}

.notification-item--type-error {
  --ni-accent: #f44336;
  --ni-accent-soft: rgba(244, 67, 54, 0.14);
  --ni-accent-glow: rgba(244, 67, 54, 0.35);
}

.notification-item--unread {
  background: linear-gradient(
    135deg,
    var(--ni-accent-soft) 0%,
    rgb(var(--v-theme-surface)) 48%,
    rgb(var(--v-theme-surface)) 100%
  );
  border-color: color-mix(in srgb, var(--ni-accent) 22%, rgb(var(--v-theme-surface)));
}

.notification-item--unread::after {
  opacity: 1;
}

.notification-item--clickable {
  cursor: pointer;
}

.notification-item--clickable:hover {
  border-color: color-mix(in srgb, var(--ni-accent) 35%, transparent);
  box-shadow:
    0 4px 14px rgba(var(--v-shadow-key-umbra-color), 0.08),
    0 0 0 1px color-mix(in srgb, var(--ni-accent) 12%, transparent);
  transform: translateY(-1px);
}

.notification-item--clickable:hover::after {
  opacity: 1;
  box-shadow: 0 0 12px var(--ni-accent-glow);
}

.notification-item--clickable:active {
  transform: translateY(0);
  transition-duration: 0.08s;
}

.notification-item--clickable:focus-visible {
  outline: 2px solid var(--ni-accent);
  outline-offset: 2px;
}

.notification-item__type {
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 44px;
  block-size: 44px;
  border-radius: 12px;
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--ni-accent) 22%, rgb(var(--v-theme-surface))) 0%,
    color-mix(in srgb, var(--ni-accent) 8%, rgb(var(--v-theme-surface))) 100%
  );
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 2px 6px rgba(var(--v-shadow-key-umbra-color), 0.06);
}

.notification-item__type-icon {
  color: var(--ni-accent);
  opacity: 0.95;
}

.notification-item__content {
  flex: 1;
  min-inline-size: 0;
  padding-inline: 4px 0;
}

.notification-item__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.notification-item__title {
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.notification-item__time {
  flex-shrink: 0;
  white-space: nowrap;
  margin-block-start: 2px;
}

.notification-item__body {
  margin-block-start: 4px;
  opacity: 0.82;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  white-space: normal;
  line-height: 1.4;
}

.notification-item__chevron {
  opacity: 0.45;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.notification-item--clickable:hover .notification-item__chevron {
  opacity: 0.85;
  transform: translateX(2px);
}

/* RTL: nudge chevron the other way */
:global([dir='rtl']) .notification-item--clickable:hover .notification-item__chevron {
  transform: translateX(-2px);
}
</style>
