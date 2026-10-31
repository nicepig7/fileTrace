<template>
  <div class="api-card" @click="$emit('click')">
    <div class="card-header">
      <div class="card-title-wrap">
        <span class="method-badge">
          {{ api.method || 'GET' }}
        </span>
        <span class="url">{{ api.url }}</span>
      </div>
      <BaseIcon :icon="IconChevronRight" size="sm" class="arrow-icon" />
    </div>
    <div class="card-meta">
      CTR: <span class="value">{{ api.ctrClass || 'Unknown' }}</span>
      <span class="separator">|</span>
      Method: <span class="value">{{ api.methodName || 'Unknown' }}</span>
    </div>
  </div>
</template>

<script setup>
import BaseIcon from '../icon/BaseIcon.vue';
import IconChevronRight from '@assets/icon/IconChevronRight.vue';

defineProps({
  api: {
    type: Object,
    required: true
  }
});

defineEmits(['click']);
</script>

<style scoped lang="scss">
.api-card {
  cursor: pointer;
  background-color: var(--bg-card, var(--bg-panel-light));
  border: 1px solid var(--border-light, var(--border-base));
  border-radius: 0.5rem;
  padding: 1rem;
  transition: border-color 0.15s ease-in-out;
  display: flex;
  flex-direction: column;
  
  &:hover {
    border-color: var(--border-input);
    
    .url {
      color: var(--text-method-name, var(--text-primary));
    }
    
    .arrow-icon {
      opacity: 1;
      color: var(--accent-api, var(--accent-vue, #3b82f6));
    }
  }
  
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .card-title-wrap {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    .method-badge {
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: 0.25rem;
      background-color: var(--bg-input);
      color: var(--text-tertiary);
    }
    
    .url {
      color: var(--accent-api, var(--accent-vue, #3b82f6));
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 0.875rem;
      transition: color 0.15s ease-in-out;
      word-break: break-all;
    }
  }
  
  .arrow-icon {
    color: var(--text-disabled);
    opacity: 0;
    transition: all 0.15s ease-in-out;
    flex-shrink: 0;
  }
  
  .card-meta {
    margin-top: 0.75rem;
    font-size: 0.75rem;
    color: var(--text-muted);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    
    .value {
      color: var(--text-tertiary);
    }
    
    .separator {
      color: var(--border-base);
    }
  }
}
</style>
