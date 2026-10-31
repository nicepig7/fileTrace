<template>
  <div class="table-header-actions">
    <div class="search-box">
      <div class="search-icon-wrapper">
        <BaseIcon :icon="IconSearch" size="sm" color="muted" />
      </div>
      <input
        type="text"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        placeholder="Search Table, Description, API URL, or DBIO..."
        class="search-input"
      >
      <button
        v-if="modelValue"
        @click="$emit('update:modelValue', '')"
        type="button"
        title="Clear search"
        class="clear-btn"
      >
        <BaseIcon :icon="IconClose" size="sm" />
      </button>
    </div>
    
    <div class="dropdown" ref="dropdownRef">
      <button @click="toggleDropdown" class="options-btn" :class="{ active: isOpen }">
        <BaseIcon :icon="IconChevronDown" size="sm" />
        Options
      </button>

      <div v-if="isOpen" class="dropdown-menu">
        <button class="dropdown-item" @click="handleDownloadList">
          <BaseIcon :icon="IconDownload" size="sm" />
          Download Table List
        </button>
        
        <button 
          class="dropdown-item" 
          :disabled="!selectedTableName"
          @click="handleDownloadDetail"
        >
          <BaseIcon :icon="IconDocumentText" size="sm" />
          <span v-if="selectedTableName">Download Def ({{ selectedTableName }})</span>
          <span v-else>Download Table Def</span>
        </button>

        <div class="dropdown-divider"></div>

        <button class="dropdown-item" @click="handleOpenSource">
          <BaseIcon :icon="IconExternalLink" size="sm" />
          Open Data Folder
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import BaseIcon from '@common/compo/icon/BaseIcon.vue';
import IconSearch from '@assets/icon/IconSearch.vue';
import IconClose from '@assets/icon/IconClose.vue';
import IconExternalLink from '@assets/icon/IconExternalLink.vue';
import IconChevronDown from '@assets/icon/IconChevronDown.vue';
import IconDownload from '@assets/icon/IconDownload.vue';
import IconDocumentText from '@assets/icon/IconDocumentText.vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  selectedTableName: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'openSource', 'downloadList', 'downloadDetail']);

const isOpen = ref(false);
const dropdownRef = ref(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const closeDropdown = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});

const handleDownloadList = () => {
  emit('downloadList');
  isOpen.value = false;
};

const handleDownloadDetail = () => {
  if (!props.selectedTableName) return;
  emit('downloadDetail');
  isOpen.value = false;
};

const handleOpenSource = () => {
  emit('openSource');
  isOpen.value = false;
};
</script>

<style scoped lang="scss">
.table-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 24rem;
  
  .search-box {
    position: relative;
    flex: 1 1 0%;
    
    .search-icon-wrapper {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      padding-left: 0.75rem;
      display: flex;
      align-items: center;
      pointer-events: none;
    }
    
    .search-input {
      display: block;
      width: 100%;
      padding: 0.375rem 2.25rem;
      border: 1px solid var(--border-input);
      border-radius: 0.5rem;
      background-color: var(--bg-input);
      color: var(--text-secondary);
      font-size: 0.875rem;
      transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
      
      &::placeholder {
        color: var(--text-muted);
      }
      
      &:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
        box-shadow: 0 0 0 2px var(--border-focus-table);
        border-color: var(--border-focus-table);
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
      transition: color 0.15s ease-in-out;
      
      &:hover {
        color: var(--text-secondary);
      }
    }
  }
  
  .dropdown {
    position: relative;

    .options-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 1rem;
      background-color: var(--bg-input);
      color: var(--text-tertiary);
      border-radius: 0.5rem;
      border: 1px solid var(--scrollbar-thumb);
      transition: all 0.15s ease-in-out;
      font-size: 0.875rem;
      font-weight: 500;
      flex-shrink: 0;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      
      &:hover, &.active {
        background-color: var(--scrollbar-thumb);
        color: var(--text-primary);
      }
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      z-index: 50;
      min-width: 14rem;
      background-color: var(--bg-panel);
      border: 1px solid var(--border-input);
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      padding: 0.5rem 0;
      display: flex;
      flex-direction: column;

      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        width: 100%;
        text-align: left;
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 0.875rem;
        cursor: pointer;
        transition: background-color 0.15s;

        &:hover:not(:disabled) {
          background-color: var(--bg-hover);
          color: var(--text-primary);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      .dropdown-divider {
        height: 1px;
        background-color: var(--border-input);
        margin: 0.5rem 0;
      }
    }
  }
}
</style>
