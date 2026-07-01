<script setup>
import { computed, nextTick, ref, watch } from 'vue'

const SLOT_COUNT = 11

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  errorMessages: {
    type: [Array, String],
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])
const digits = ref(Array.from({ length: SLOT_COUNT }, () => ''))
const inputRefs = ref([])

const normalizedErrors = computed(() => {
  if (Array.isArray(props.errorMessages)) return props.errorMessages.map(v => String(v || '').trim()).filter(Boolean)
  const one = String(props.errorMessages || '').trim()
  return one ? [one] : []
})

const normalizeToDigits = value => String(value ?? '').replace(/\D/g, '').slice(0, SLOT_COUNT)

const syncFromModelValue = value => {
  const nextValue = normalizeToDigits(value)
  const nextDigits = Array.from({ length: SLOT_COUNT }, (_, index) => nextValue[index] || '')
  digits.value = nextDigits
}

watch(() => props.modelValue, syncFromModelValue, { immediate: true })

const emitCurrentValue = () => {
  emit('update:modelValue', digits.value.join(''))
}

const focusInput = index => {
  nextTick(() => {
    const target = inputRefs.value[index]
    if (target?.focus) target.focus()
  })
}

const setDigitsFromString = (startIndex, value) => {
  const cleaned = normalizeToDigits(value)
  if (!cleaned) return
  const next = [...digits.value]
  for (let i = 0; i < cleaned.length && startIndex + i < SLOT_COUNT; i++) {
    next[startIndex + i] = cleaned[i]
  }
  digits.value = next
  emitCurrentValue()
  const nextFocus = Math.min(startIndex + cleaned.length, SLOT_COUNT - 1)
  focusInput(nextFocus)
}

const onInput = (index, event) => {
  const raw = String(event?.target?.value || '')
  const cleaned = raw.replace(/\D/g, '')
  if (!cleaned) {
    digits.value[index] = ''
    emitCurrentValue()
    return
  }
  if (cleaned.length > 1) {
    setDigitsFromString(index, cleaned)
    return
  }
  digits.value[index] = cleaned
  emitCurrentValue()
  if (index < SLOT_COUNT - 1) focusInput(index + 1)
}

const onKeyDown = (index, event) => {
  if (event.key !== 'Backspace') return
  if (digits.value[index]) {
    digits.value[index] = ''
    emitCurrentValue()
    return
  }
  if (index > 0) {
    digits.value[index - 1] = ''
    emitCurrentValue()
    focusInput(index - 1)
  }
}

const onFocus = index => {
  const firstEmptyIndex = digits.value.findIndex(d => !d)
  if (firstEmptyIndex === -1) return
  if (index > firstEmptyIndex) focusInput(firstEmptyIndex)
}

const onPaste = event => {
  event.preventDefault()
  const pasted = String(event?.clipboardData?.getData('text') || '')
  setDigitsFromString(0, pasted)
}
</script>

<template>
  <div class="national-id-slots">
    <div class="text-caption mb-2">{{ label }}</div>
    <div class="national-id-slots__inputs" dir="ltr" @paste="onPaste">
      <template v-for="(_, index) in digits" :key="index">
        <input
          :ref="el => inputRefs[index] = el"
          :value="digits[index]"
          maxlength="1"
          inputmode="numeric"
          class="national-id-slot"
          @input="onInput(index, $event)"
          @keydown="onKeyDown(index, $event)"
          @focus="onFocus(index)"
        />
        <span v-if="index < digits.length - 1" class="national-id-separator">-</span>
      </template>
    </div>
    <div v-if="normalizedErrors.length" class="text-error text-caption mt-1">
      {{ normalizedErrors[0] }}
    </div>
  </div>
</template>

<style scoped>
.national-id-slots {
  max-inline-size: 650px;
}

.national-id-slots__inputs {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 6px;
  direction: ltr;
}

.national-id-slot {
  inline-size: 38px;
  min-inline-size: 38px;
  block-size: 38px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 6px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  outline: none;
  text-align: center;
  font-size: 0.95rem;
  padding: 0;
}

.national-id-slot:focus {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 1px rgb(var(--v-theme-primary));
}

.national-id-separator {
  color: rgba(var(--v-theme-on-surface), 0.5);
  user-select: none;
}
</style>
