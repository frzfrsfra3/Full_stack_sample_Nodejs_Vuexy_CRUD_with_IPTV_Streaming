<!-- CustomMapPicker: one coordinate field for edit and view (readonly). -->
<template>
  <div class="map-picker">
    <div v-if="!readonly || hasCoords" class="map-coords mb-2">
      <VTextField
        v-model="coordinatesInput"
        :readonly="readonly"
        :label="`${t('Lat')}, ${t('Lng')}`"
        placeholder="33.5138, 36.2765"
        density="compact"
        hide-details="auto"
        :clearable="!readonly"
        @click:clear="clearCoordinates"
      />
    </div>
    <div ref="mapEl" class="map-container" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import locationPin from '@/assets/images/location-pin.png'

const { t } = useI18n()

const props = defineProps({
  lat: { type: [Number, String], default: undefined },
  lng: { type: [Number, String], default: undefined },
  readonly: { type: Boolean, default: false },
})

const emit = defineEmits(['update:lat', 'update:lng'])

const DEFAULT_CENTER = [34.8021, 38.9968]
const DEFAULT_ZOOM = 6
const POINT_ZOOM = 12

const markerIcon = L.icon({
  iconUrl: locationPin,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
})

const mapEl = ref(null)
let map
const marker = ref(null)

const toNum = v => (v == null || v === '' || Number.isNaN(Number(v)) ? null : Number(v))

const validateLatLng = (lat, lng) => {
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return { lat, lng }
}

/** Same as Task forms; also accepts Google Maps–style strings (e.g. URL fragment @lat,lng). */
const parseCoordinates = value => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  let match = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/)
  if (match) {
    return validateLatLng(Number(match[1]), Number(match[2]))
  }
  match = trimmed.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/)
  if (match) {
    return validateLatLng(Number(match[1]), Number(match[2]))
  }
  return null
}

const coordinatesInput = computed({
  get() {
    const lat = toNum(props.lat)
    const lng = toNum(props.lng)
    if (lat == null || lng == null) return ''
    return `${lat}, ${lng}`
  },
  set(value) {
    if (value == null || String(value).trim() === '') {
      emit('update:lat', null)
      emit('update:lng', null)
      return
    }
    const parsed = parseCoordinates(value)
    if (!parsed) return
    emit('update:lat', parsed.lat)
    emit('update:lng', parsed.lng)
  },
})

const clearCoordinates = () => {
  emit('update:lat', null)
  emit('update:lng', null)
}

const hasCoords = computed(() => {
  const lat = toNum(props.lat)
  const lng = toNum(props.lng)
  return lat != null && lng != null
})

const removeMarker = () => {
  if (marker.value && map) {
    marker.value.remove()
    marker.value = null
  }
}

onMounted(() => {
  nextTick(() => {
    const el = mapEl.value
    if (!el) return

    try {
      const lat = toNum(props.lat)
      const lng = toNum(props.lng)
      const hasPoint = lat != null && lng != null

      map = L.map(el).setView(
        hasPoint ? [lat, lng] : DEFAULT_CENTER,
        hasPoint ? POINT_ZOOM : DEFAULT_ZOOM,
      )

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map)

      if (hasPoint) {
        marker.value = L.marker([lat, lng], { icon: markerIcon }).addTo(map)
      }

      if (props.readonly) {
        map.dragging.disable()
        map.touchZoom.disable()
        map.doubleClickZoom.disable()
        map.scrollWheelZoom.disable()
        map.boxZoom.disable()
        map.keyboard.disable()
        if (map.tap) map.tap.disable()
      } else {
        map.on('click', e => {
          const { lat: clickLat, lng: clickLng } = e.latlng

          if (marker.value) {
            marker.value.setLatLng(e.latlng)
          } else {
            marker.value = L.marker(e.latlng, { icon: markerIcon }).addTo(map)
          }

          emit('update:lat', clickLat)
          emit('update:lng', clickLng)
        })
      }
    } catch (err) {
      console.error('[CustomMapPicker]', err)
    }
  })
})

onBeforeUnmount(() => {
  if (map) {
    map.off()
    map.remove()
    map = null
  }
  marker.value = null
})

watch(
  () => [toNum(props.lat), toNum(props.lng)],
  ([newLat, newLng]) => {
    if (!map) return

    if (newLat == null || newLng == null) {
      removeMarker()
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
      return
    }

    map.setView([newLat, newLng], POINT_ZOOM)

    if (marker.value) {
      marker.value.setLatLng([newLat, newLng])
    } else {
      marker.value = L.marker([newLat, newLng], { icon: markerIcon }).addTo(map)
    }
  },
)
</script>

<style lang="scss" scoped>
.map-picker {
  border-radius: 0.35em;
  overflow: hidden;
}
.map-container {
  width: 100%;
  height: 400px;
}
</style>
