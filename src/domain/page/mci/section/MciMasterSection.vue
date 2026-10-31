<template>
  <aside class="left-panel">
    <div class="mci-list">
      <MciListItem
        v-for="mci in filteredMcis"
        :key="mci"
        :mci="mci"
        :is-selected="selectedMci === mci"
        :info="mciMap[mci]?.info"
        :class-ids="mciMap[mci]?.classIds"
        :api-counts="mciMap[mci]?.apiCounts"
        @select="$emit('select', $event)"
      />
      <EmptyBox v-if="filteredMcis.length === 0" message="No MCI found" class="no-mci-found" />
    </div>
  </aside>
</template>

<script setup>
import EmptyBox from '@common/compo/box/EmptyBox.vue';
import MciListItem from '../compo/MciListItem.vue';

defineProps({
  filteredMcis: {
    type: Array,
    default: () => []
  },
  selectedMci: {
    type: String,
    default: null
  },
  mciMap: {
    type: Object,
    default: () => ({})
  }
});

defineEmits(['select']);
</script>

<style scoped lang="scss">
.left-panel {
  width: 25%;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-base);
  background-color: var(--bg-panel-light);
}

.mci-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  
  & > * + * {
    margin-top: 0.25rem;
  }
}

.no-mci-found {
  text-align: center;
  padding-top: 2rem;
  padding-bottom: 2rem;
  color: var(--text-disabled);
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
