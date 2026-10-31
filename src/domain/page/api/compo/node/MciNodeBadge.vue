<template>
  <span v-if="node && node.mciAsisId" class="mci-node-container">
    <TooltipPopover width-class="w-80" position="bottom">
        <template #trigger>
            <span class="mci-node-badge">
                <span class="mci-name">
                  <HighlightedText :text="`${node.mciId}(${node.mciAsisId})`" />
                </span>
                <BaseIcon :icon="IconMci" :size="12" class="icon-mci" />
            </span>
        </template>
        
        <template #default>
            <MciTooltipContent :details="getMciDetails({ mciId: node.mciId })" :mci-id="node.mciId" />
        </template>
    </TooltipPopover>
  </span>
</template>

<script setup>
import { computed } from 'vue';
import BaseIcon from '@common/compo/icon/BaseIcon.vue';
import IconMci from '@assets/icon/IconMci.vue';
import TooltipPopover from '@common/compo/overlay/TooltipPopover.vue';
import MciTooltipContent from '@domain/module/mciTooltip/MciTooltipContent.vue';
import HighlightedText from '@common/compo/text/HighlightedText.vue';
import { useMciInfo } from '@domain/store/composables/useMciInfo.js';

const { getMciDetails } = useMciInfo();

const props = defineProps({
  node: {
    type: Object,
    required: true
  }
});

</script>

<style scoped lang="scss">
.mci-node-container {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-left: 0.5rem;
}

.mci-node-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  background-color: var(--mci-badge-bg);
  border: 1px solid var(--mci-badge-border);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  cursor: help;
  height: 100%;
  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;

  &:hover {
    background-color: var(--mci-badge-hover-bg);
  }

  .badge-label {
    padding: 0.125rem 0.25rem;
    border-radius: 0.125rem;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .mci-name {
    color: var(--mci-badge-name);
  }

  .icon-mci {
    color: var(--mci-badge-icon);
    margin-left: 0.125rem;
  }
}
</style>
