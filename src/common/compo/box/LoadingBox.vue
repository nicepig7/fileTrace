<template>
  <div class="loading-box">
    <BaseIcon :icon="IconSpinner" :size="40" color="primary" spin class="loading-spinner" />
    <p class="loading-text">
      <slot>{{ text }}</slot>
    </p>
  </div>
</template>

<script setup>
import BaseIcon from '@common/compo/icon/BaseIcon.vue';
import IconSpinner from '@assets/icon/IconSpinner.vue';

defineProps({
  text: {
    type: String,
    default: 'Loading data...'
  }
});
</script>

<style scoped lang="scss">
.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  padding: 1.5rem;

  .loading-spinner {
    margin-bottom: 1rem;

    :deep(.spinner-track) {
      opacity: 0.25;
    }
    
    :deep(.spinner-head) {
      opacity: 0.75;
    }
  }

  .loading-text {
    font-size: 1.125rem;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
