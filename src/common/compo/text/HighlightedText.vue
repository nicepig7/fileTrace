<template>
  <span v-if="!query" class="highlight-wrapper">{{ text }}</span>
  <span v-else class="highlight-wrapper" v-html="highlightedText"></span>
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useApiStore } from '@domain/store/useApiStore.js';

const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  queryStr: {
    type: String,
    default: undefined
  }
});

const store = useApiStore();
const { searchQuery } = storeToRefs(store);

const query = computed(() => {
  if (props.queryStr !== undefined) {
    return props.queryStr.trim();
  }
  return typeof searchQuery.value === 'string' ? searchQuery.value.trim() : '';
});

const highlightedText = computed(() => {
  if (!props.text) return '';
  if (!query.value) return props.text;
  
  try {
    const escapedQuery = query.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return props.text.replace(regex, '<mark class="highlight-mark">$1</mark>');
  } catch (e) {
    return props.text;
  }
});
</script>

<style scoped>
.highlight-wrapper {
  display: inline;
}
.highlight-wrapper :deep(.highlight-mark) {
  background-color: var(--accent-warning, #fde047);
  color: #000;
  padding: 0 0.125rem;
  border-radius: 0.125rem;
  font-weight: inherit;
}
</style>
