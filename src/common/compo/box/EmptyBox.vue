<template>
  <div class="empty-box">
    <slot>{{ message }}</slot>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'No data found.'
  }
});
</script>

<style scoped lang="scss">
.empty-box {
  max-width: 72rem;
  margin-left: auto;
  margin-right: auto;
  padding: 1.5rem;
  text-align: center;
  padding-top: 5rem;
  padding-bottom: 5rem;
  color: var(--text-disabled);
}
</style>
