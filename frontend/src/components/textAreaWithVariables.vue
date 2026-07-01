<script setup>
// Define a prop for the incoming text variable
const props = defineProps({
  modelValue: {
    type: [String, Number, Object],
    required: true
  },
  variables: {
    type: Array,
    required: true
  },
  variablesNames: {
    type: Array,
    required: true
  },
  errorMessages: {
    type: Array,
    required: false,
    default: () => [],
  },
  placeholder: {
    type: String,
    required: false
  },
  label: {
    type: String,
    required: false
  },
  prependIcon: {
    type: String,
    required: false
  },
})

// Define a local variable to work with
const localText = ref(props.modelValue)

// Watch for changes in the prop and update the local variable
watch(() => props.modelValue, (newValue) => {
  localText.value = newValue
})

// Emit the modified value back to the parent
const emit = defineEmits(['update:modelValue'])
watch(localText, (newValue) => {
  emit('update:modelValue', newValue)
})

const addVariableToWhatsAppMessage = (variable) => {
  localText.value += variable
}
</script>

<template>
  <section>
    <VTextarea
        v-model="localText"
        rows="2"
        :prepend-inner-icon="prependIcon"
        :label="label"
        :error-messages="errorMessages"
        auto-grow
        :placeholder="placeholder">
    </VTextarea>
    <div class="mt-3 d-flex align-center justify-start gap-3">
      <VChip v-for="variable in variables" :key="variable"
          variant="outlined"
             color="primary"
             class="cursor-pointer noSelect"
             @click="addVariableToWhatsAppMessage(variable)">
        {{ variablesNames[variables.indexOf(variable)] }}
      </VChip>
    </div>
  </section>
</template>

<style scoped lang="scss">

</style>