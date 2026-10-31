<template>
  <div class="db-card" @click="$emit('click')">
    <div class="card-info">
      <div class="method-wrap">
        <span class="method-label" style="font-size: 0.75rem; color: var(--text-muted); margin-right: 2px;">Query Name:</span>
        <span class="method-name">{{ query.method }}</span>
        <span :class="['type-badge', query.type === 'select' ? 'is-select' : query.type === 'insert' ? 'is-insert' : query.type === 'update' ? 'is-update' : 'is-delete']">
          {{ query.type }}
        </span>
      </div>
      <div v-if="!hideFilename" class="file-meta">
        DBIO File: <span class="filename">{{ query.dbmClass }}</span>
      </div>
    </div>
    <div class="line-badge">
      <span>Line {{ query.line }}</span>
      <BaseIcon :icon="IconExternalLink" :size="12" class="arrow-icon" />
    </div>
  </div>
</template>

<script setup>
import BaseIcon from '@common/compo/icon/BaseIcon.vue';
import IconExternalLink from '@assets/icon/IconExternalLink.vue';

defineProps({
  query: {
    type: Object,
    required: true
  },
  hideFilename: {
    type: Boolean,
    default: false
  }
});

defineEmits(['click']);
</script>

<style scoped lang="scss">
.db-card {
  cursor: pointer;
  background-color: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  transition: border-color 0.15s ease-in-out;
  
  &:hover {
    border-color: var(--border-input);
    
    .method-name {
      color: var(--text-class-name);
    }
    
    .arrow-icon {
      opacity: 1;
      color: var(--accent-svc);
    }
  }
  
  .card-info {
    .method-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      
      .method-name {
        color: var(--text-secondary);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 0.875rem;
        font-weight: 600;
        transition: color 0.15s ease-in-out;
      }
      
      .type-badge {
        padding: 0.125rem 0.5rem;
        font-size: 10px;
        text-transform: uppercase;
        font-weight: 700;
        border-radius: 0.25rem;
        
        &.is-select {
          background-color: var(--badge-sql-select-bg);
          color: var(--badge-sql-select-text);
        }
        
        &.is-insert {
          background-color: var(--badge-sql-insert-bg);
          color: var(--badge-sql-insert-text);
        }
        
        &.is-update {
          background-color: var(--badge-sql-update-bg);
          color: var(--badge-sql-update-text);
        }
        
        &.is-delete {
          background-color: var(--badge-sql-delete-bg);
          color: var(--badge-sql-delete-text);
        }
      }
    }
    
    .file-meta {
      font-size: 0.75rem;
      color: var(--text-muted);
      
      .filename {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        color: var(--text-tertiary);
      }
    }
  }
  
  .line-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--text-disabled);
    white-space: nowrap;
    background-color: var(--bg-surface);
    border: 1px solid var(--border-base);
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    
    .arrow-icon {
      opacity: 0;
      transition: all 0.15s ease-in-out;
    }
  }
}
</style>
