<template>
  <div class="api-header-actions">
    <div class="control-area">
      <!-- Project Toggle -->
      <ProjectSegmentToggle 
        v-model="store.selectedProject" 
        :projects="store.projects" 
      />

      <!-- Package Dropdown -->
      <div class="package-dropdown">
         <select v-model="store.selectedPackage" class="select-box">
            <option v-for="pkg in store.packages" :key="pkg.value" :value="pkg.value">
              {{ pkg.label }}
            </option>
         </select>
         <div class="icon-wrapper">
            <BaseIcon :icon="IconChevronDown" size="sm" />
         </div>
      </div>

      <!-- Search Input -->
      <div class="search-input">
          <div class="search-icon">
              <BaseIcon :icon="IconSearch" size="sm" color="muted" />
          </div>
          <input type="text" v-model="store.searchQuery" placeholder="Search API by URL, Class, Method..." class="input-box">
          <button v-if="store.searchQuery" @click="store.searchQuery = ''" type="button" title="Clear search" class="clear-btn">
              <BaseIcon :icon="IconClose" size="sm" />
          </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useApiStore } from '@domain/store/useApiStore.js';
import BaseIcon from '@common/compo/icon/BaseIcon.vue';
import IconChevronDown from '@assets/icon/IconChevronDown.vue';
import IconSearch from '@assets/icon/IconSearch.vue';
import IconClose from '@assets/icon/IconClose.vue';
import ProjectSegmentToggle from '../compo/ProjectSegmentToggle.vue';

const store = useApiStore();
</script>

<style scoped lang="scss">
.api-header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1.5rem;
  flex: 1 1 0%;
  min-width: 0;
}

.control-area {
  flex: 1 1 0%;
  max-width: 56rem;
  margin-left: 1.5rem;
  margin-right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}



.package-dropdown {
  position: relative;
  flex-shrink: 0;

  .select-box {
    display: block;
    width: 6rem;
    padding-left: 0.75rem;
    padding-right: 2rem;
    padding-top: 0.375rem;
    padding-bottom: 0.375rem;
    border: 1px solid var(--border-input);
    border-radius: 0.5rem;
    background-color: var(--bg-input);
    color: var(--text-secondary);
    font-size: 0.875rem;
    line-height: 1.25rem;
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
    appearance: none;
    cursor: pointer;

    &:hover {
      border-color: var(--border-hover);
    }

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
      box-shadow: 0 0 0 2px var(--bg-input), 0 0 0 4px var(--accent-brand);
      border-color: var(--accent-brand);
    }
  }

  .icon-wrapper {
    pointer-events: none;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    display: flex;
    align-items: center;
    padding-left: 0.625rem;
    padding-right: 0.625rem;
    color: var(--text-muted);
  }
}

.search-input {
  position: relative;
  flex: 1 1 0%;

  .search-icon {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    padding-left: 0.75rem;
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  .input-box {
    display: block;
    width: 100%;
    padding-left: 2.25rem;
    padding-right: 2.25rem;
    padding-top: 0.375rem;
    padding-bottom: 0.375rem;
    border: 1px solid var(--border-input);
    border-radius: 0.5rem;
    background-color: var(--bg-input);
    color: var(--text-secondary);
    font-size: 0.875rem;
    line-height: 1.25rem;
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;

    &::placeholder {
      color: var(--text-muted);
    }

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
      box-shadow: 0 0 0 2px var(--bg-input), 0 0 0 4px var(--accent-brand);
      border-color: var(--accent-brand);
    }
  }

  .clear-btn {
    background-color: transparent;
    border: none;
    cursor: pointer;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    padding-right: 0.75rem;
    display: flex;
    align-items: center;
    color: var(--text-muted);
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;

    &:hover {
      color: var(--text-secondary);
    }
  }
}
</style>
