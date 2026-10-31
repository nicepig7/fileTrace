<template>
  <template v-if="details">
    <div class="table-info-header">Table Info ({{ tableName }})</div>
    <div class="table-info-list">
        <div class="table-info-item">
            <span class="label">Owner:</span>
            <span class="value is-mono">{{ details.owner || '-' }}</span>
        </div>
        <div class="table-info-item">
            <span class="label">Name(KR):</span>
            <span class="value">{{ details.desc_ko || '-' }}</span>
        </div>
        <div class="table-info-item">
            <span class="label">Name(EN):</span>
            <span class="value">{{ details.desc_en || '-' }}</span>
        </div>
        <div class="table-info-item">
            <span class="label">Name(VI):</span>
            <span class="value">{{ details.desc_vi || '-' }}</span>
        </div>
    </div>
  </template>
  <template v-else>
    <div class="table-info-header is-empty">Table Info ({{ tableName }})</div>
    <div class="table-info-empty-msg">
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
  tableName: {
    type: String,
    default: ''
  }
});
</script>

<style scoped lang="scss">
.table-info-header {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-input);
  padding-bottom: 0.375rem;
  margin-bottom: 0.5rem;

  &.is-empty {
    color: var(--text-muted);
    border-bottom-color: var(--border-empty);
  }
}

.table-info-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-size: 0.75rem;
}

.table-info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;

  .label {
    color: var(--text-muted);
    white-space: nowrap;
  }

  .value {
    color: var(--text-secondary);
    text-align: right;
    word-break: break-word;

    &.is-mono {
      color: var(--accent-vue);
      font-family: monospace;
    }
  }
}

.table-info-empty-msg {
  font-size: 0.75rem;
  color: var(--text-warning);
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.5rem;
}
</style>
