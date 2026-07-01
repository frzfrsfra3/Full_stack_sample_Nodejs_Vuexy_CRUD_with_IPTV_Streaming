<script setup>
import RadiusImg from '@/assets/images/sas-radius.png'
import WakeedImg from '@/assets/images/wakeed-logo.png'


const props = defineProps({
  status: {
    type: Boolean,
    required: true,
    default: false,
  },
  type: {
    type: String,
    required: true,
    default: 'radius',
  },
  loading: {
    type: Boolean,
    required: false,
    default: false,
  }

})

// Define emits
const emit = defineEmits(['connect'])

// Emit function on button click
const handleClick = () => {
  console.log('button clicked')
  emit('connect', { status: props.status, type: props.type })
}

// Get Corresponding Image
const getImage = () => {
  return props.type === 'radius' ? RadiusImg : WakeedImg
}

// Get Corresponding Variant
const getVariant = () => {
  return props.status ? 'solid' : 'outline'
}
</script>

<template>
  <div class="connection-item me-3">
    <VBtn
        block
        variant="flat"
        :color="status ? 'success' : 'error'"
        icon
        :loading="loading"
        @click="handleClick">
      <VAvatar center>
        <VImg :src="getImage()"/>
      </VAvatar>
    </VBtn>
  </div>
</template>

<style  lang="scss">

</style>