<script setup>
const props = defineProps({
  height: {
    type: String,
    required: false
  }
})

// Generate a random number between 0 and 1 to use for animation delay
const animationDelay = Math.random()+"s"
</script>

<template>
  <div class="skeleton" :style="{
      height: props.height ? props.height : null,
      animationDelay: animationDelay
    }"
  ></div>
</template>

<style scoped lang="scss">
.skeleton {
  background: linear-gradient(90deg, #e8e8e8 25%, #f8f8f8 50%, #e8e8e8 75%);
  background-size: 200% 100%;
  width: 100%;
  height: 1.45rem;
  border-radius: 6px;
  animation: shine 3.5s infinite linear;
}

@keyframes shine {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
