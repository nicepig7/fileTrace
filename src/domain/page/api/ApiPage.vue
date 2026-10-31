<template>
  <PageLayout>
    <!-- Header Actions -->
    <template #actions>
      <ApiHeader />
    </template>

    <!-- Main Content -->
    <ApiBody />
  </PageLayout>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useApiStore } from '@domain/store/useApiStore.js';
import PageLayout from '@common/compo/layout/PageLayout.vue';
import ApiHeader from './section/ApiHeader.vue';
import ApiBody from './section/ApiBody.vue';

const store = useApiStore();
const route = useRoute();

onMounted(() => {
  store.init();
  
  // Apply query param if exists
  if (route.query.q) {
    store.searchQuery = route.query.q;
  }
});

// React to URL query changes when already on the page
watch(
  () => route.query.q,
  (newQ) => {
    if (newQ !== undefined) {
      store.searchQuery = newQ;
    }
  }
);
</script>
