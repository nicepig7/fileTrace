<template>
  <div @click="$emit('click')" class="vue-item">
    <div class="item-header">
      <div class="item-title-wrapper">
        <span class="vue-badge">VUE</span>
        <span class="vue-name">{{ vue.name }}</span>
      </div>
      <BaseIcon :icon="IconExternalLink" size="sm" class="arrow-icon vue-arrow" />
    </div>
    <div class="item-path">
      Path: <span class="item-path-value">{{ vue.path }}</span>
    </div>
  </div>
</template>

<script setup>
import BaseIcon from '@common/compo/icon/BaseIcon.vue';
import IconExternalLink from '@assets/icon/IconExternalLink.vue';

defineProps({
  vue: {
    type: Object,
    required: true
  }
});

defineEmits(['click']);
</script>

<style scoped lang="scss">
.vue-item {
  cursor: pointer;
  background-color: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
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

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vue-badge {
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 700;
  border-radius: 0.25rem;
  background-color: var(--badge-vue-soft-bg);
  color: var(--accent-vue);
}

.vue-name {
  color: var(--text-secondary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 600;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  
  .vue-item:hover & {
    color: var(--text-method-name);
  }
}

.arrow-icon {
  opacity: 0;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  
  &.vue-arrow {
    color: var(--text-disabled);
    .vue-item:hover & {
      color: var(--accent-vue);
    }
  }
}

.item-path {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  line-height: 1rem;
  color: var(--text-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.item-path-value {
  color: var(--text-tertiary);
}
</style>
