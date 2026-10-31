<template>
  <div class="error-box">
    <BaseIcon :icon="IconWarning" size="3rem" color="danger" class="error-icon" />
    <h3 class="error-title">{{ title }}</h3>
    <p v-if="error" class="error-msg">{{ error }}</p>
    
    <div v-if="showTroubleshooting || $slots.troubleshooting" class="troubleshooting">
      <slot name="troubleshooting">
        <p class="trouble-title">Troubleshooting:</p>
        <ul class="trouble-list">
          <li>Ensure you have run <code>npm run build:data</code> recently so that <code>data.sqlite</code> is created.</li>
          <li>Check if <code>data.sqlite</code> exists in the public directory.</li>
        </ul>
      </slot>
    </div>
  </div>
</template>

<script setup>
import BaseIcon from '@common/compo/icon/BaseIcon.vue';
import IconWarning from '@assets/icon/IconWarning.vue';

defineProps({
  title: {
    type: String,
    default: 'Error Loading Data'
  },
  error: {
    type: String,
    default: ''
  },
  showTroubleshooting: {
    type: Boolean,
    default: true
  }
});
</script>

<style scoped lang="scss">
.error-box {
  background-color: var(--bg-error);
  border: 1px solid var(--border-error);
  border-radius: 0.5rem;
  padding: 1.5rem;
  max-width: 42rem;
  margin: 2.5rem auto 0;
  text-align: center;

  .error-icon {
    margin-bottom: 1rem;
  }

  .error-title {
    font-size: 1.125rem;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }

  .error-msg {
    color: var(--text-error-msg);
  }

  .troubleshooting {
    margin-top: 1rem;
    padding: 1rem;
    background-color: var(--bg-input);
    border-radius: 0.25rem;
    text-align: left;
    font-size: 0.875rem;
    color: var(--text-tertiary);

    .trouble-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .trouble-list {
      list-style-type: disc;
      padding-left: 1.25rem;
      
      li {
        margin-top: 0.25rem;
      }
    }
  }
}
</style>
