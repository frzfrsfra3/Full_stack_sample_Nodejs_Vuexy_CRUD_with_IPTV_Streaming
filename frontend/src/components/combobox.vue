<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number, Object],
    default: null
  },
  items: {
    type: Array,
    required: true
  },
  itemValue: {
    type: String,
    default: 'value'
  },
  itemTitle: {
    type: String,
    default: 'title'
  },
  label: {
    type: String,
    default: ''
  },
  clearIcon: {
    type: String,
    default: 'tabler-x'
  },
  prependInnerIcon: {
    type: String,
    default: 'tabler-archive'
  },
  rules: {
    type: Array,
    default: () => []
  },
  minChars: {
    type: Number,
    default: 0
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  hint: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);

const selectedValue = ref(props.modelValue);
const searchInput = ref('');

watch(selectedValue, (newValue) => {
  if(!newValue){
    return;
  }
  const foundItem = props.items.find(item => item[props.itemValue] === newValue[props.itemValue]);
  if (!foundItem) {
    return;
  }
  if (newValue && typeof newValue === 'object' && props.itemValue in newValue) {
    emit('update:modelValue', newValue[props.itemValue]);
  } else {
    emit('update:modelValue', newValue);
  }
});

watch(() => props.modelValue, (newValue) => {
  if (newValue !== selectedValue.value) {
    const foundItem = props.items.find(item => item[props.itemValue] === newValue);
    selectedValue.value = foundItem || newValue;
  }
});

watch([() => props.modelValue, () => props.items], ([newValue, newItems]) => {
  if(!newItems){
    return;
  }
  const foundItem = newItems.find(item => item[props.itemValue].toString() === newValue?.toString());
  if (foundItem) {
    selectedValue.value = foundItem;
  } else {
    selectedValue.value = newValue;
  }
}, { deep: true });

const filteredItems = computed(() => {
  if (searchInput.value.length < props.minChars) {
    return [];
  }
  return props.items;
});

// Computed property to get the title of the selected value
const selectedTitle = computed(() => {
  const selectedItem = props.items.find(item => item[props.itemValue] === selectedValue.value);
  return selectedItem ? selectedItem[props.itemTitle] : '';
});

// Define the component name
defineComponent({name: 'CustomComboBox'});

</script>

<template>
  <VCombobox v-model="selectedValue" :items="filteredItems" clearable
             :item-value="itemValue" :item-title="itemTitle" :menu-props="{ maxHeight: '400' }"
             :clear-icon="clearIcon" :prepend-inner-icon="prependInnerIcon" :rules="rules"
             v-model:search="searchInput" persistent-hint
             :label="label"
             :disabled="disabled"
             :loading="loading"
             :hint="hint"/>
</template>

<style scoped lang="scss">

</style>