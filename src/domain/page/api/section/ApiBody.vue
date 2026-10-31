<template>
  <main class="api-body" @scroll="onScroll">
    <!-- Loading State -->
    <LoadingBox v-if="!store.isLoaded" text="Loading API Endpoints from DB..." />

    <!-- No Data State -->
    <EmptyBox v-else-if="filteredEndpoints.length === 0" message="No matching endpoints found." />

    <!-- Main Data Content -->
    <div v-else class="api-content">
      <EndpointCard 
        v-for="endpoint in visibleEndpoints" 
        :key="endpoint.methodId" 
        :endpoint="endpoint" 
        @toggleNode="store.toggleEndpoint" 
      />
    </div>
  </main>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useApiStore } from '@domain/store/useApiStore.js';
import LoadingBox from '@common/compo/box/LoadingBox.vue';
import EmptyBox from '@common/compo/box/EmptyBox.vue';
import EndpointCard from '../compo/EndpointCard.vue';

const store = useApiStore();
const { filteredEndpoints, searchQuery, selectedProject, selectedPackage } = storeToRefs(store);

const limit = ref(50);

const visibleEndpoints = computed(() => {
  return filteredEndpoints.value.slice(0, limit.value);
});

watch([searchQuery, selectedProject, selectedPackage], () => {
  limit.value = 50;
});

const onScroll = (e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target;
  if (scrollTop + clientHeight >= scrollHeight - 300) {
    if (limit.value < filteredEndpoints.value.length) {
      limit.value += 50;
    }
  }
};
</script>

<style scoped lang="scss">
.api-body {
  flex: 1 1 0%;
  width: 100%;
  overflow-y: auto;
}

.api-content {
  max-width: 72rem;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  padding-bottom: 5rem;
}
</style>
