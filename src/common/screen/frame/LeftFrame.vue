<template>
  <aside class="left-frame" :class="{ 'is-collapsed': isCollapsed }">
    <!-- Logo & Toggle -->
    <div class="logo-area">
      <div v-if="!isCollapsed" class="logo-title">
        <BaseIcon :icon="IconBolt" size="lg" color="primary" />
        <span class="logo-text">TraceFile</span>
      </div>
      <button @click="isCollapsed = !isCollapsed" class="toggle-btn" :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'">
        <BaseIcon v-if="!isCollapsed" :icon="IconChevronDoubleLeft" size="md" />
        <BaseIcon v-else :icon="IconChevronDoubleRight" size="md" />
      </button>
    </div>

    <!-- Navigation Links -->
    <nav class="nav-menu">
      <router-link 
        v-for="item in MENU_CONFIG"
        :key="item.path"
        :to="item.path" 
        class="nav-item"
        :class="{ [`is-active-${item.activeKey}`]: $route.path.startsWith(item.path) }"
        :title="isCollapsed ? item.title : ''"
      >
        <component :is="item.icon" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-text">{{ item.title }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import BaseIcon from '@common/compo/icon/BaseIcon.vue';
import IconBolt from '@assets/icon/IconBolt.vue';
import IconChevronDoubleLeft from '@assets/icon/IconChevronDoubleLeft.vue';
import IconChevronDoubleRight from '@assets/icon/IconChevronDoubleRight.vue';
import { MENU_CONFIG } from '@common/config/menuConfig.js';

const isCollapsed = ref(false);
</script>

<style scoped lang="scss">
.left-frame {
  background-color: var(--bg-base);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-shrink: 0;
  transition: all 0.3s;
  width: 16rem; /* w-64 */

  &.is-collapsed {
    width: 4rem; /* w-16 */
  }
}

.logo-area {
  height: 4rem; /* h-16 */
  display: flex;
  align-items: center;
  padding: 0 1rem;
  border-bottom: 1px solid var(--border-light);
  justify-content: space-between;
}

.logo-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
  white-space: nowrap;
}

.logo-text {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.125rem; /* text-lg */
  letter-spacing: -0.025em; /* tracking-tight */
}

.toggle-btn {
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0.375rem; /* p-1.5 */
  border-radius: 0.5rem;
  color: var(--text-muted);
  transition: background-color 0.15s, color 0.15s;
  
  &:hover {
    color: var(--text-primary);
    background-color: var(--bg-input);
  }
}

.nav-menu {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0.5rem; /* py-4 px-2 */
  display: flex;
  flex-direction: column;
  gap: 0.25rem; /* space-y-1 */
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem; /* py-2.5 px-3 */
  border-radius: 0.5rem;
  transition: background-color 0.15s, color 0.15s;
  color: var(--text-muted);

  &:not(.is-active-api):not(.is-active-db):not(.is-active-mci):hover {
    background-color: var(--bg-input);
    color: var(--text-primary);
  }

  &.is-active-api {
    background-color: var(--bg-active-api);
    color: var(--text-active-api);
  }

  &.is-active-db {
    background-color: var(--bg-active-db);
    color: var(--text-active-db);
  }

  &.is-active-mci {
    background-color: var(--bg-active-mci);
    color: var(--text-active-mci);
  }
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.nav-text {
  font-weight: 500;
  white-space: nowrap;
}
</style>
