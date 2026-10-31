<template>
  <div class="page-layout">
    <!-- Top Header Area -->
    <header v-if="!hideHeader" class="page-header glass-panel">
      <div class="page-title-area">
        <slot name="title">
          <component :is="resolvedIcon" v-if="resolvedIcon" class="page-title-icon" />
          <h2 class="page-title-text">{{ resolvedTitle }}</h2>
        </slot>
      </div>

      <div v-if="$slots.actions" class="page-header-actions">
        <slot name="actions" />
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="page-main-content" :class="contentClass">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  icon: {
    type: [Object, Function],
    default: null
  },
  hideHeader: {
    type: Boolean,
    default: false
  },
  contentClass: {
    type: String,
    default: ''
  }
});

const route = useRoute();

const resolvedTitle = computed(() => {
  return props.title || route.meta?.title || '';
});

const resolvedIcon = computed(() => {
  return props.icon || route.meta?.icon || null;
});
</script>

<style scoped lang="scss">
.page-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  flex: 1 1 0%;
  min-width: 0;
  overflow: hidden;
  background-color: var(--bg-surface);
}

.page-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  min-height: 4rem;
  background-color: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--glass-border);
  z-index: 10;
  gap: 1rem;
}

.page-title-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.page-title-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--accent-brand);
  flex-shrink: 0;
}

.page-title-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
  white-space: nowrap;
}

.page-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}

.page-main-content {
  flex: 1 1 0%;
  display: flex;
  overflow: hidden;
  min-width: 0;
  position: relative;
}
</style>
