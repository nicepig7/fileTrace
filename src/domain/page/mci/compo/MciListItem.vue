<template>
  <TooltipPopover
    width-class="mci-tooltip-width"
    position="right"
    wrapper-class="mci-tooltip-wrapper"
  >
    <template #trigger>
      <button
        @click="$emit('select', mci)"
        :data-mci-id="mci"
        :class="['mci-item', { 'is-active': isSelected }]"
      >
        <div class="mci-header">
          <span class="mci-name">{{ mci }}</span>
          <span v-if="info?.asisId" class="mci-asis-id" :title="info.asisId">{{ info.asisId }}</span>
        </div>
        
        <div class="mci-footer">
          <span class="mci-desc" :title="info?.nameEn || ''">
            {{ info?.nameEn || '' }}
          </span>
          
          <div class="mci-badges" v-if="apiCounts">
            <span v-if="apiCounts.inbound > 0" class="badge badge-in">IN</span>
            <span v-if="apiCounts.outbound > 0" class="badge badge-out">OUT({{ apiCounts.outbound }})</span>
          </div>
        </div>
      </button>
    </template>
    <template #default>
      <MciTooltipContent
        :details="info"
        :mci-id="mci.replace(/^MCI/, '').replace(/_COM$/, '')"
      />
    </template>
  </TooltipPopover>
</template>

<script setup>
import TooltipPopover from '@common/compo/overlay/TooltipPopover.vue';
import MciTooltipContent from '@domain/module/mciTooltip/MciTooltipContent.vue';

defineProps({
  mci: {
    type: String,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  info: {
    type: Object,
    default: null
  },
  classIds: {
    type: Object,
    default: null
  },
  apiCounts: {
    type: Object,
    default: null
  }
});

defineEmits(['select']);
</script>

<style scoped lang="scss">
.mci-item {
  background-color: transparent;
  cursor: pointer;
  width: 100%;
  text-align: left;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  border: 1px solid transparent;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;

  &:hover {
    background-color: var(--bg-input);
    
    .mci-name {
      color: var(--text-primary);
    }
  }

  &.is-active {
    background-color: var(--bg-mci-item-active);
    border-color: var(--border-mci-item-active);
    
    &:hover {
      background-color: var(--bg-mci-item-active);
    }
    
    .mci-name {
      color: var(--accent-primary-hover);
    }
    
    .mci-desc {
      color: var(--text-mci-item-desc-active);
    }
  }
}

.mci-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
}

.mci-asis-id {
  font-size: 0.65rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  color: var(--text-muted);
  background-color: var(--bg-surface);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  max-width: 5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
}

.mci-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  color: var(--text-tertiary);
  transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1);
  flex: 1;
}

.mci-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 0.375rem;
  gap: 0.5rem;
}

.mci-desc {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.75rem;
  line-height: 1rem;
  color: var(--text-disabled);
  flex: 1;
  min-height: 1rem;
}

.mci-badges {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.badge {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  line-height: 1;
}

.badge-in {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--accent-svc, #10b981);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.badge-out {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--accent-api, #3b82f6);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.mci-tooltip-wrapper {
  display: block;
  width: 100%;
}

.mci-tooltip-width {
  width: 20rem;
}
</style>
