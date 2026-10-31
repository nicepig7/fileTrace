<template>
  <TooltipPopover
    width-class="table-tooltip-width"
    position="right"
    wrapper-class="table-tooltip-wrapper"
  >
    <template #trigger>
      <button
        type="button"
        :class="['table-list-item', { 'is-active': isSelected }]"
        :data-table-name="table"
        @click="$emit('select', table)"
      >
        <div class="item-header">
          <span class="name">
            <HighlightedText :text="table" :query-str="searchQuery" />
          </span>
          <span v-if="info?.owner" class="owner-badge">
            {{ info.owner }}
          </span>
        </div>
        <div class="item-body">
          <span v-if="info?.desc_en" class="desc">
            <HighlightedText :text="info.desc_en" :query-str="searchQuery" />
          </span>
          <span v-else class="desc is-empty">No Description</span>
          
          <div class="counts" v-if="(info?.queryCount > 0) || (info?.apiCount > 0)">
            <span v-if="info?.queryCount > 0">DB: {{ info.queryCount }}</span>
            <span v-if="(info?.queryCount > 0) && (info?.apiCount > 0)" class="sep">|</span>
            <span v-if="info?.apiCount > 0">API: {{ info.apiCount }}</span>
          </div>
        </div>
      </button>
    </template>
    <template #default>
      <TableTooltipContent
        :table-name="table"
        :details="info"
      />
    </template>
  </TooltipPopover>
</template>

<script setup>
import TooltipPopover from '@common/compo/overlay/TooltipPopover.vue';
import TableTooltipContent from '@domain/module/tableTooltip/TableTooltipContent.vue';
import HighlightedText from '@common/compo/text/HighlightedText.vue';

defineProps({
  table: {
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
  searchQuery: {
    type: String,
    default: ''
  }
});

defineEmits(['select']);
</script>

<style scoped lang="scss">
.table-list-item {
  background-color: transparent;
  cursor: pointer;
  width: 100%;
  text-align: left;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;
  display: flex;
  flex-direction: column;
  border: 1px solid transparent;
  
  &:hover {
    background-color: var(--bg-input);
    
    .name {
      color: var(--text-primary);
    }
  }
  
  &.is-active {
    background-color: var(--bg-table-item-active);
    border-color: var(--border-table-item-active);
    
    .name {
      color: var(--accent-vue);
    }
    
    .desc {
      color: var(--text-table-item-desc-active);
    }
  }
  
  .item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    
    .name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-tertiary);
    }
    
    .owner-badge {
      margin-left: 0.5rem;
      flex-shrink: 0;
      font-size: 10px;
      font-weight: 700;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      background-color: var(--bg-input);
      color: var(--text-muted);
      border: 1px solid var(--border-light);
    }
  }
  
  .item-body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 0.25rem;
    
    .desc {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.75rem;
      color: var(--text-disabled);
      flex: 1 1 0%;
      padding-right: 0.5rem;
      
      &.is-empty {
        font-style: italic;
        opacity: 0.5;
      }
    }
    
    .counts {
      flex-shrink: 0;
      font-size: 0.6875rem;
      color: var(--text-muted);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background-color: var(--bg-panel);
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      border: 1px solid var(--border-light);
      
      .sep {
        color: var(--border-input);
        font-weight: 400;
      }
    }
  }
}

.table-tooltip-wrapper {
  display: block;
  width: 100%;
}

.table-tooltip-width {
  width: 20rem;
}
</style>
