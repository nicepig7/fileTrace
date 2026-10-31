<template>
  <div 
    class="project-toggle" 
    :class="{ 'is-all-selected': isAll }"
    :title="isAll ? '전체 프로젝트 조회 중 (버튼을 클릭하여 개별 프로젝트 필터링)' : '선택된 프로젝트 필터링 중 (다시 클릭하면 전체 보기)'"
  >
    <button 
      v-for="proj in displayProjects" 
      :key="proj"
      type="button"
      @click="onToggle(proj)"
      class="toggle-btn"
      :class="{ 
        'is-active': props.modelValue === proj,
        'is-all-state': isAll
      }"
      :title="props.modelValue === proj ? `${proj} 필터 해제 (전체 보기)` : `${proj} 필터 선택`"
    >
      {{ proj }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: 'All'
  },
  projects: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue']);

// 'All'을 제외하고 알파벳 역순(내림차순: MBW -> COR -> ADM)으로 정렬
const displayProjects = computed(() => {
  const list = (props.projects || []).filter(p => p && p !== 'All');
  return [...list].sort((a, b) => b.localeCompare(a));
});

const isAll = computed(() => !props.modelValue || props.modelValue === 'All');

function onToggle(proj) {
  if (props.modelValue === proj) {
    // 이미 선택된 프로젝트를 다시 클릭하면 해제(전체 조회 'All')
    emit('update:modelValue', 'All');
  } else {
    emit('update:modelValue', proj);
  }
}
</script>

<style scoped lang="scss">
.project-toggle {
  display: flex;
  padding: 0.25rem;
  background-color: var(--bg-toggle);
  border-radius: 0.5rem;
  border: 1px solid var(--border-light);
  flex-shrink: 0;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  gap: 0.125rem;

  // 전체(ALL) 선택 상태일 때 박스 전체 하이라이트
  &.is-all-selected {
    border-color: rgba(99, 102, 241, 0.5);
    background-color: rgba(30, 41, 59, 0.95);
    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.2), 0 2px 4px rgba(0, 0, 0, 0.15);

    .toggle-btn.is-all-state {
      color: var(--text-primary);
      background-color: rgba(99, 102, 241, 0.15);

      &:hover {
        background-color: rgba(99, 102, 241, 0.3);
        color: #ffffff;
      }
    }
  }

  .toggle-btn {
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    line-height: 1rem;
    font-weight: 700;
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);

    &:hover {
      color: var(--text-secondary);
      background-color: var(--bg-hover-muted);
    }

    // 개별 프로젝트가 선택되었을 때 해당 버튼만 하이라이트
    &.is-active {
      background-color: var(--bg-toggle-active);
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
