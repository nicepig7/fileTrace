<template>
  <div @click="$emit('click')" class="svc-item">
    <div>
      <div class="svc-title-wrapper">
        <span class="svc-method">{{ usage.svcMethod }}</span>
        <span class="svc-calls-mci-badge">CALLS MCI</span>
      </div>
      <div class="item-path">
        Class: <span class="item-path-value">{{ usage.svcClass }}</span>
      </div>
    </div>
    <div class="svc-line-wrapper">
      <span>Line {{ usage.line }}</span>
      <BaseIcon :icon="IconExternalLink" :size="12" class="arrow-icon svc-arrow" />
    </div>
  </div>
</template>

<script setup>
import BaseIcon from '@common/compo/icon/BaseIcon.vue';
import IconExternalLink from '@assets/icon/IconExternalLink.vue';

defineProps({
  usage: {
    type: Object,
    required: true
  }
});

defineEmits(['click']);
</script>

<style scoped lang="scss">
.svc-item {
  cursor: pointer;
  background-color: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;

  &:hover {
    border-color: var(--border-input);
    
    .arrow-icon {
      opacity: 1;
    }
  }
}

.svc-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.svc-calls-mci-badge {
  padding: 0.125rem 0.5rem;
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
  border-radius: 0.25rem;
  background-color: var(--badge-svc-soft-bg);
  color: var(--accent-svc);
}

.svc-method {
  color: var(--text-secondary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 600;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  
  .svc-item:hover & {
    color: var(--text-class-name);
  }
}

.arrow-icon {
  opacity: 0;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  
  &.svc-arrow {
    .svc-item:hover & {
      color: var(--accent-svc);
    }
  }
}

.item-path {
  font-size: 0.75rem;
  line-height: 1rem;
  color: var(--text-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.item-path-value {
  color: var(--text-tertiary);
}

.svc-line-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  line-height: 1rem;
  color: var(--text-disabled);
  white-space: nowrap;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-base);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}
</style>
