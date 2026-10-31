<template>
  <main class="right-panel">
    <template v-if="selectedMci && selectedMciData">
      <header class="detail-header">
        <div>
          <div class="detail-title-wrapper">
            <h3 class="detail-title">{{ selectedMci }}</h3>
            <span v-if="selectedMciData.info?.asisId" class="detail-asis-id">
              {{ selectedMciData.info.asisId }}
            </span>
            <span v-if="selectedMciData.info?.inOut" :class="['detail-inout-badge', selectedMciData.info.inOut.toLowerCase()]">
              {{ selectedMciData.info.inOut }}
            </span>
          </div>
          
          <div v-if="selectedMciData.info" class="detail-subtitle">
            {{ selectedMciData.info.nameKr }} <span class="detail-subtitle-divider">|</span> {{ selectedMciData.info.nameVi }}
          </div>
          
          <p class="detail-stats">
            Referenced by {{ selectedMciData.inboundApis?.length || 0 }} Inbound APIs and {{ selectedMciData.apis?.length || 0 }} Outbound APIs.
          </p>
        </div>
      </header>
      
      <div class="detail-content">
        <!-- Associated APIs Section -->
        <section class="accordion-section">
          <h4 class="section-title" @click="isApiOpen = !isApiOpen">
            <div class="title-left">
              <BaseIcon :icon="IconBolt" size="md" color="var(--accent-api)" />
              Associated APIs (Outbound) <span v-if="selectedMciData.apis?.length > 0" class="query-stats">({{ selectedMciData.apis.length }})</span>
            </div>
            <BaseIcon :icon="IconChevronDown" :size="20" class="chevron-icon" :class="{ 'is-closed': !isApiOpen }" />
          </h4>
          <div v-show="isApiOpen" class="section-content">
            <div v-if="selectedMciData.apis?.length > 0" class="impact-grid">
              <ApiCard
                v-for="(api, idx) in selectedMciData.apis"
                :key="idx"
                :api="api"
                @click="$emit('goToApi', api.url)"
              />
            </div>
            <div v-else class="no-impact">
              No direct API associations found.
            </div>
          </div>
        </section>

        <!-- Inbound APIs Section -->
        <section class="accordion-section">
          <h4 class="section-title" @click="isInboundApiOpen = !isInboundApiOpen">
            <div class="title-left">
              <BaseIcon :icon="IconDatabase" size="md" color="var(--accent-svc)" />
              Inbound APIs (CTR) <span v-if="selectedMciData.inboundApis?.length > 0" class="query-stats">({{ selectedMciData.inboundApis.length }})</span>
            </div>
            <BaseIcon :icon="IconChevronDown" :size="20" class="chevron-icon" :class="{ 'is-closed': !isInboundApiOpen }" />
          </h4>
          <div v-show="isInboundApiOpen" class="section-content">
            <div v-if="selectedMciData.inboundApis?.length > 0" class="impact-grid">
              <ApiCard
                v-for="(api, idx) in selectedMciData.inboundApis"
                :key="idx"
                :api="api"
                @click="$emit('goToApi', api.url)"
              />
            </div>
            <div v-else class="no-impact">
              No direct Inbound APIs found.
            </div>
          </div>
        </section>
      </div>
    </template>
    
    <EmptyBox v-else class="empty-state">
      <div class="empty-state-content">
        <BaseIcon :icon="IconLink" :size="64" color="var(--icon-empty)" class="empty-state-icon" />
        <h3 class="empty-state-title">Select an MCI</h3>
        <p class="empty-state-desc">Choose an MCI from the list to view its associated Services, APIs, and impacted Vue Pages.</p>
      </div>
    </EmptyBox>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import BaseIcon from '@common/compo/icon/BaseIcon.vue';
import EmptyBox from '@common/compo/box/EmptyBox.vue';
import IconBolt from '@assets/icon/IconBolt.vue';
import IconDatabase from '@assets/icon/IconDatabase.vue';
import IconLink from '@assets/icon/IconLink.vue';
import IconChevronDown from '@assets/icon/IconChevronDown.vue';
import ApiCard from '@common/compo/card/ApiCard.vue';

defineProps({
  selectedMci: {
    type: String,
    default: null
  },
  selectedMciData: {
    type: Object,
    default: null
  }
});

const isApiOpen = ref(true);
const isInboundApiOpen = ref(true);

defineEmits(['goToApi', 'openSvc']);
</script>

<style scoped lang="scss">
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-surface);
  overflow: hidden;
}

.detail-header {
  flex-shrink: 0;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-base);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--bg-panel);
}

.detail-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.detail-title {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.detail-asis-id {
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  line-height: 1rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-weight: 700;
  border-radius: 0.25rem;
  background-color: var(--bg-input);
  color: var(--text-tertiary);
}

.detail-inout-badge {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 0.25rem;
  display: inline-flex;
  align-items: center;

  &.in {
    background-color: rgba(34, 197, 94, 0.15);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }
  &.out {
    background-color: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
    border: 1px solid rgba(59, 130, 246, 0.3);
  }
}

.detail-subtitle {
  margin-top: 0.5rem;
  color: var(--accent-primary-hover);
  font-weight: 500;
}

.detail-subtitle-divider {
  color: var(--border-input);
  margin-left: 0.25rem;
  margin-right: 0.25rem;
}

.detail-stats {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  
  & > * + * {
    margin-top: 2rem;
  }
}

.section-title {
  font-size: 1.125rem;
  line-height: 1.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  border-radius: 0.375rem;
  padding: 0.25rem 0;
  transition: color 0.15s ease;
  
  &:hover {
    color: var(--text-primary);
    
    .chevron-icon {
      color: var(--icon-base);
    }
  }
  
  .title-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .chevron-icon {
    color: var(--icon-muted);
    transition: transform 0.2s ease, color 0.15s ease;
    
    &.is-closed {
      transform: rotate(-90deg);
    }
  }
  
  .query-stats {
    font-size: 0.875rem;
    color: var(--text-muted);
    font-weight: 500;
    margin-left: 0.25rem;
  }
}

.impact-grid {
  display: grid;
  gap: 0.75rem;
}

.no-impact {
  color: var(--text-disabled);
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-style: italic;
  background-color: var(--bg-panel-light);
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-base);
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-disabled);
  padding: 2rem;
}

.empty-state-content {
  text-align: center;
  max-width: 28rem;
}

.empty-state-icon {
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 1rem;
}

.empty-state-title {
  font-size: 1.125rem;
  line-height: 1.75rem;
  font-weight: 500;
  color: var(--text-tertiary);
  margin-bottom: 0.5rem;
}

.empty-state-desc {
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
