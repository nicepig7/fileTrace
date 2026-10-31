<template>
  <aside class="table-list-panel">
    <div class="list-container">
      <TableListItem
        v-for="table in filteredTables"
        :key="table"
        :table="table"
        :is-selected="selectedTableName === table"
        :info="tableMap[table]?.info"
        :search-query="searchQuery"
        @select="$emit('select', $event)"
      />
      <EmptyBox
        v-if="filteredTables.length === 0"
        message="No tables found"
        class="empty-list"
      />
    </div>
  </aside>
</template>

<script setup>
import EmptyBox from '@common/compo/box/EmptyBox.vue';
import TableListItem from '../compo/TableListItem.vue';

defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  filteredTables: {
    type: Array,
    default: () => []
  },
  selectedTableName: {
    type: String,
    default: null
  },
  tableMap: {
    type: Object,
    default: () => ({})
  }
});

defineEmits(['select']);
</script>

<style scoped lang="scss">
.table-list-panel {
  width: 33.333333%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-base);
  background-color: var(--bg-panel-light);
  
  .list-container {
    flex: 1 1 0%;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .empty-list {
    text-align: center;
    padding-top: 2rem;
    padding-bottom: 2rem;
    color: var(--text-disabled);
    font-size: 0.875rem;
  }
}
</style>
