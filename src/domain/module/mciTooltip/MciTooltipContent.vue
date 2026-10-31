<template>
  <template v-if="details">
    <div class="tooltip-header">MCI Info ({{ mciId }})</div>
    <div class="info-list">
        <div class="info-row">
            <span class="label">AS-IS ID:</span>
            <span class="value is-asis">{{ details.asisId || '-' }}</span>
        </div>
        <div class="info-row">
            <span class="label">Name(KR):</span>
            <span class="value">{{ details.nameKr || '-' }}</span>
        </div>
        <div class="info-row">
            <span class="label">Name(EN):</span>
            <span class="value">{{ details.nameEn || '-' }}</span>
        </div>
        <div class="info-row">
            <span class="label">Name(VI):</span>
            <span class="value">{{ details.nameVi || '-' }}</span>
        </div>
    </div>
  </template>
  <template v-else>
    <div class="tooltip-header is-empty">MCI Info ({{ mciId }})</div>
    <div class="empty-message">
        <BaseIcon :icon="IconWarning" size="sm" />
        매핑 정보를 찾을 수 없습니다.
    </div>
  </template>
</template>

<script setup>
import BaseIcon from '@common/compo/icon/BaseIcon.vue';
import IconWarning from '@assets/icon/IconWarning.vue';

defineProps({
  details: {
    type: Object,
    default: null
  },
  mciId: {
    type: String,
    default: ''
  }
});
</script>

<style scoped lang="scss">
.tooltip-header {
  font-size: 0.75rem; /* text-xs */
  font-weight: 700; /* font-bold */
  color: var(--text-secondary); /* text-slate-200 */
  border-bottom: 1px solid var(--border-input); /* border-slate-600 */
  padding-bottom: 0.375rem; /* pb-1.5 */
  margin-bottom: 0.5rem; /* mb-2 */
  
  &.is-empty {
    color: var(--text-muted); /* text-slate-400 */
    border-bottom-color: var(--border-empty); /* border-slate-600/50 */
  }
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem; /* gap-1.5 */
  font-size: 0.75rem; /* text-xs */
  
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem; /* gap-2 */
    
    .label {
      color: var(--text-muted); /* text-slate-400 */
      white-space: nowrap; /* whitespace-nowrap */
    }
    
    .value {
      color: var(--text-secondary); /* text-slate-200 */
      text-align: right; /* text-right */
      word-break: break-word; /* break-words */
      
      &.is-asis {
        color: var(--accent-vue); /* text-emerald-400 */
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; /* font-mono */
      }
    }
  }
}

.empty-message {
  font-size: 0.75rem; /* text-xs */
  color: var(--text-warning); /* text-rose-400 */
  display: flex;
  align-items: center;
  gap: 0.375rem; /* gap-1.5 */
  margin-top: 0.5rem; /* mt-2 */
}
</style>
