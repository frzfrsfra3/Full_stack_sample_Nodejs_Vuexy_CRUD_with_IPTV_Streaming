<script setup>
const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: false
  }
})

const getCssColorName = (color) => {
  return `var(--v-theme-${color})`;
}
</script>

<template>
  <VCard class="underBorder"
         :style="{
      borderBlockEndColor: `rgba(${getCssColorName(props.color)}, 0.38)`,
  }">
    <VCardText>
      <div class="d-flex align-center gap-x-4 mb-1">
        <VAvatar :class="`text-${props.color}`" variant="tonal" rounded>
          <VIcon :icon="props.icon"/>
        </VAvatar>
        <h4 class="text-3xl" v-if="props.value!=null || props.value!==undefined">{{ props.value }}</h4>
        <VProgressCircular v-else indeterminate color="grey lighten-2"/>
      </div>
      <div class=" mb-1">
        {{ props.title }}
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">
.underBorder {
  border-block-end-style: solid;
  border-block-end-width: 2px;
  transition: border-bottom-width 0.5s ease;

  //&:hover{
  //  border-block-end-width: 3px;
  //}
}
</style>
