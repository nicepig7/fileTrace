<template>
  <div class="export-dropdown" ref="dropdownRef">
    <button 
      @click="isDropdownOpen = !isDropdownOpen"
      class="export-btn"
      title="Download as Excel"
    >
      <BaseIcon :icon="IconDownload" size="sm" class="btn-icon" />
      <span>Export</span>
      <BaseIcon 
        :icon="IconChevronDown" 
        size="xs"
        class="chevron-icon"
        :class="{ 'is-open': isDropdownOpen }"
      />
    </button>

    <!-- Dropdown Menu -->
    <transition name="dropdown">
      <div 
        v-if="isDropdownOpen" 
        class="dropdown-menu"
      >
        <div class="menu-header">
          <span>Excel 내보내기</span>
          <span class="ext-badge">.xlsx</span>
        </div>

        <!-- 1. API Mapping Export -->
        <button 
          @click="handleExport('api_mapping')"
          class="menu-item is-api"
        >
          <div class="item-icon-wrapper">
            <BaseIcon :icon="IconDocumentText" size="sm" class="item-icon" />
          </div>
          <div class="item-content">
            <div class="item-title">
              <span>API 매핑 리포트</span>
              <span class="badge">기본</span>
            </div>
            <p class="item-desc">전체 Controller, Service, DBM, MCI 연계</p>
          </div>
        </button>

        <!-- 2. MCI Call List Export -->
        <button 
          @click="handleExport('second_excel')"
          class="menu-item is-mci"
        >
          <div class="item-icon-wrapper">
            <BaseIcon :icon="IconMci" size="sm" class="item-icon" />
          </div>
          <div class="item-content">
            <div class="item-title">
              <span>전체 MCI 호출 목록</span>
              <span class="badge">MCI</span>
            </div>
            <p class="item-desc">호출 위치(클래스/메소드/라인) 및 인터페이스 정보</p>
          </div>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import BaseIcon from '@common/compo/icon/BaseIcon.vue';
import IconDownload from '@assets/icon/IconDownload.vue';
import IconChevronDown from '@assets/icon/IconChevronDown.vue';
import IconDocumentText from '@assets/icon/IconDocumentText.vue';
import IconMci from '@assets/icon/IconMci.vue';

const emit = defineEmits(['export']);

const isDropdownOpen = ref(false);
const dropdownRef = ref(null);

const handleExport = (type) => {
  isDropdownOpen.value = false;
  emit('export', type);
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped lang="scss">
.export-dropdown {
  position: relative;

  .export-btn {
    padding: 0.375rem 0.75rem; // px-3 py-1.5
    background-color: var(--btn-primary-bg);
    color: var(--text-primary);
    font-size: 0.75rem; // text-xs
    font-weight: 600;
    border-radius: 0.375rem; // rounded-md
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 0.375rem; // gap-1.5
    
    &:hover {
      background-color: var(--btn-primary-hover);
    }
    &:active {
      background-color: var(--btn-primary-active);
    }
    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px var(--accent-svc);
    }

    .btn-icon {
      /* Size handled by BaseIcon */
    }

    .chevron-icon {
      transition: transform 0.2s;
      
      &.is-open {
        transform: rotate(180deg);
      }
    }
  }

  .dropdown-menu {
    position: absolute;
    right: 0;
    margin-top: 0.5rem; // mt-2
    width: 18rem; // w-72
    border-radius: 0.5rem; // rounded-lg
    background-color: var(--bg-menu);
    border: 1px solid var(--border-menu);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); // shadow-2xl
    padding: 0.375rem 0; // py-1.5
    z-index: 50;
    text-align: left;
    backdrop-filter: blur(12px);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.3); // ring-1 ring-black/30
  }

  .menu-header {
    padding: 0.375rem 0.75rem; // px-3 py-1.5
    font-size: 11px; // text-[11px]
    font-weight: 600;
    color: var(--text-muted);
    border-bottom: 1px solid var(--border-base);
    display: flex;
    align-items: center;
    justify-content: space-between;

    .ext-badge {
      font-size: 10px; // text-[10px]
      background-color: var(--bg-input);
      color: var(--text-muted);
      padding: 0.125rem 0.375rem; // px-1.5 py-0.5
      border-radius: 0.25rem; // rounded
      border: 1px solid var(--border-badge-ext);
    }
  }

  .menu-item {
    width: 100%;
    padding: 0.625rem 0.75rem; // px-3 py-2.5
    text-align: left;
    transition: background-color 0.15s;
    display: flex;
    align-items: flex-start;
    gap: 0.625rem; // gap-2.5
    background: transparent;

    &:hover {
      background-color: var(--bg-menu-item-hover);

      .item-title span:first-child {
        color: var(--text-primary);
      }
    }

    .item-icon-wrapper {
      padding: 0.375rem; // p-1.5
      border-radius: 0.25rem; // rounded
      margin-top: 0.125rem; // mt-0.5
      transition: background-color 0.15s, border-color 0.15s;
      border-width: 1px;
      border-style: solid;
      display: flex;
      align-items: center;
      justify-content: center;

      .item-icon {
        /* Size handled by BaseIcon */
      }
    }

    &.is-api {
      .item-icon-wrapper {
        background-color: var(--export-item-api-bg);
        border-color: var(--export-item-api-border);
        color: var(--accent-vue);
      }
      
      &:hover .item-icon-wrapper {
        background-color: var(--export-item-api-hover-bg);
        border-color: var(--export-item-api-hover-border);
      }

      .badge {
        font-size: 10px;
        color: var(--accent-vue);
        font-weight: 500;
      }
    }

    &.is-mci {
      border-top: 1px solid var(--border-menu-divider);
      
      .item-icon-wrapper {
        background-color: var(--export-item-mci-bg);
        border-color: var(--export-item-mci-border);
        color: var(--export-item-mci-text);
      }
      
      &:hover .item-icon-wrapper {
        background-color: var(--export-item-mci-hover-bg);
        border-color: var(--export-item-mci-hover-border);
      }

      .badge {
        font-size: 10px;
        background-color: var(--export-item-mci-badge-bg);
        color: var(--export-item-mci-badge-text);
        border: 1px solid var(--export-item-mci-badge-border);
        padding: 0.125rem 0.375rem; // px-1.5 py-0.5
        border-radius: 0.25rem; // rounded
        font-weight: 500;
      }
    }

    .item-content {
      flex: 1;
      min-width: 0;
    }

    .item-title {
      font-size: 0.75rem; // text-xs
      font-weight: 500;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      span:first-child {
        transition: color 0.15s;
      }
    }

    .item-desc {
      font-size: 11px; // text-[11px]
      color: var(--text-muted);
      line-height: 1.25; // leading-tight
      margin-top: 0.125rem; // mt-0.5
    }
  }

  // Vue Transition styles for dropdown
  :deep(.dropdown-enter-active) {
    transition: all 0.15s ease-out; // duration-150 ease-out
  }
  :deep(.dropdown-leave-active) {
    transition: all 0.1s ease-in; // duration-100 ease-in
  }
  :deep(.dropdown-enter-from),
  :deep(.dropdown-leave-to) {
    transform: scale(0.95) translateY(-0.25rem); // scale-95 -translate-y-1
    opacity: 0;
  }
  :deep(.dropdown-enter-to),
  :deep(.dropdown-leave-from) {
    transform: scale(1) translateY(0); // scale-100 translate-y-0
    opacity: 1;
  }
}
</style>
