<template>
  <div class="mci-header-actions">
    <label class="toggle-label-wrapper" title="Show only interfaces with IN or OUT APIs">
      <input 
        type="checkbox" 
        :checked="showOnlyUsed" 
        @change="$emit('update:showOnlyUsed', $event.target.checked)"
        class="toggle-input"
      >
      <div class="toggle-slider"></div>
      <span class="toggle-text">Mapped Only</span>
    </label>

    <div class="search-box-wrapper">
      <div class="search-icon-wrapper">
        <BaseIcon :icon="IconSearch" size="sm" color="muted" />
      </div>
      <input
        type="text"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        placeholder="Search MCI ID..."
        class="search-input"
      >
      <button
        v-if="modelValue"
        @click="$emit('update:modelValue', '')"
        type="button"
        title="Clear search"
        class="clear-search-btn"
      >
        <BaseIcon :icon="IconClose" size="sm" />
      </button>
    </div>
    
    <button @click="$emit('openSource')" class="edit-info-btn" title="Edit MCI information in GitLab">
      <BaseIcon :icon="IconExternalLink" size="sm" />
      Edit Info
    </button>
  </div>
</template>

<script setup>
import BaseIcon from '@common/compo/icon/BaseIcon.vue';
import IconSearch from '@assets/icon/IconSearch.vue';
import IconClose from '@assets/icon/IconClose.vue';
import IconExternalLink from '@assets/icon/IconExternalLink.vue';

defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  showOnlyUsed: {
    type: Boolean,
    default: false
  }
});

defineEmits(['update:modelValue', 'update:showOnlyUsed', 'openSource']);
</script>

<style scoped lang="scss">
.mci-header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 28rem;
}

.toggle-label-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.toggle-input {
  display: none;
}

.toggle-slider {
  width: 2.25rem;
  height: 1.25rem;
  background-color: var(--border-input);
  border-radius: 9999px;
  position: relative;
  transition: background-color 150ms ease-in-out;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    top: 0.125rem;
    left: 0.125rem;
    width: 1rem;
    height: 1rem;
    background-color: white;
    border-radius: 50%;
    transition: transform 150ms ease-in-out;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
}

.toggle-input:checked + .toggle-slider {
  background-color: var(--accent-api, #3b82f6);
}

.toggle-input:checked + .toggle-slider::after {
  transform: translateX(1rem);
}

.toggle-text {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  font-weight: 600;
  white-space: nowrap;
}

.search-box-wrapper {
  position: relative;
  flex: 1;
}

.search-icon-wrapper {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  padding-left: 0.75rem;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.search-input {
  display: block;
  width: 100%;
  padding: 0.375rem 2.25rem 0.375rem 2.25rem;
  border: 1px solid var(--border-input);
  border-radius: 0.5rem;
  background-color: var(--bg-input);
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.25rem;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;

  &::placeholder {
    color: var(--text-muted);
  }

  &:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
    box-shadow: 0 0 0 2px var(--border-focus);
    border-color: var(--border-focus);
  }
}

.clear-search-btn {
  background-color: transparent;
  border: none;
  cursor: pointer;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  padding-right: 0.75rem;
  display: flex;
  align-items: center;
  color: var(--text-muted);
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;

  &:hover {
    color: var(--text-secondary);
  }
}

.edit-info-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 1rem;
  background-color: var(--bg-input);
  color: var(--text-tertiary);
  border-radius: 0.5rem;
  border: 1px solid var(--scrollbar-thumb);
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  flex-shrink: 0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;

  &:hover {
    background-color: var(--scrollbar-thumb);
    color: var(--text-primary);
  }
}
</style>
