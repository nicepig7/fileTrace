<template>
  <main class="table-detail-panel">
    <template v-if="selectedTableName && selectedTableData">
      <header class="detail-header">
        <div>
          <div class="title-area">
            <button 
              class="collapse-btn" 
              @click="$emit('toggleCollapse')"
              title="Toggle Master List"
            >
              <BaseIcon :icon="isMasterCollapsed ? IconChevronRight : IconChevronLeft" :size="20" />
            </button>
            <h3 class="title">{{ selectedTableName }}</h3>
            <span v-if="selectedTableData.info?.owner" class="owner-badge">
              {{ selectedTableData.info.owner }}
            </span>
          </div>
          <div v-if="selectedTableData.info" class="desc-area">
            <span class="desc-ko">{{ selectedTableData.info.desc_ko }}</span>
            <span v-if="selectedTableData.info.desc_vi" class="separator">|</span>
            <span v-if="selectedTableData.info.desc_vi" class="desc-vi">{{ selectedTableData.info.desc_vi }}</span>
          </div>
          <p class="stats">
            Used in {{ selectedTableData.queries?.length || 0 }} DB queries and {{ selectedTableData.apis?.length || 0 }} APIs
          </p>
        </div>
      </header>

      <!-- Tabs Navigation -->
      <nav class="detail-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'columns' }" 
          @click="activeTab = 'columns'"
        >
          <BaseIcon :icon="IconDocumentDuplicate" size="sm" />
          Columns
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'relations' }" 
          @click="activeTab = 'relations'"
        >
          <BaseIcon :icon="IconDatabase" size="sm" />
          Relations
        </button>
      </nav>
      
      <div class="detail-scroll">
        <!-- TAB 1: Columns -->
        <div v-if="activeTab === 'columns'" class="tab-content">
          <div class="table-wrapper" v-if="selectedTableData.columns?.length > 0">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 60px">PK</th>
                  <th>Column ID</th>
                  <th>Type</th>
                  <th>Null</th>
                  <th>Description (KO)</th>
                  <th>Description (VI)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="col in selectedTableData.columns" :key="col.column_id">
                  <td class="center-align">
                    <span v-if="col.pk === 'Y'" class="pk-badge">PK</span>
                  </td>
                  <td class="font-mono font-medium">
                    <HighlightedText :text="col.column_id" :query-str="searchQuery" />
                  </td>
                  <td class="font-mono text-muted">
                    {{ col.data_type }}<template v-if="col.length">({{ col.length }})</template>
                  </td>
                  <td class="center-align text-muted">{{ col.nullable }}</td>
                  <td class="text-ko">
                    <HighlightedText :text="col.desc_ko" :query-str="searchQuery" />
                  </td>
                  <td class="text-vi">
                    <HighlightedText :text="col.desc_vi" :query-str="searchQuery" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-message">
            No column information found.
          </div>
        </div>

        <!-- TAB 2: Relations -->
        <div v-else-if="activeTab === 'relations'" class="tab-content relations-tab">
          <!-- DBIO Queries Section -->
          <section class="accordion-section">
            <h4 class="section-title" @click="isDbioOpen = !isDbioOpen">
              <div class="title-left">
                <BaseIcon :icon="IconDatabase" size="md" color="var(--accent-svc)" />
                DBIO Queries <span v-if="selectedTableData.queries?.length > 0" class="query-stats">({{ queryStatsText }})</span>
              </div>
              <BaseIcon :icon="IconChevronDown" :size="20" class="chevron-icon" :class="{ 'is-closed': !isDbioOpen }" />
            </h4>
            <div v-show="isDbioOpen" class="section-content">
              <div v-if="selectedTableData.queries?.length > 0" class="dbm-groups">
                <div v-for="(queries, dbmClass) in groupedQueries" :key="dbmClass" class="dbm-group">
                  <h5 class="dbm-group-title">
                    <BaseIcon :icon="IconDocumentDuplicate" :size="16" class="dbm-group-icon" />
                    {{ dbmClass }}
                  </h5>
                  <div class="list-grid">
                    <TableDbmCard
                      v-for="(q, idx) in queries"
                      :key="idx"
                      :query="q"
                      hide-filename
                      @click="$emit('openDbm', q.dbmFile, q.line, q.projectId)"
                    />
                  </div>
                </div>
              </div>
              <div v-else class="empty-message">
                No direct DB queries found.
              </div>
            </div>
          </section>
  
          <!-- Associated APIs Section -->
          <section class="accordion-section">
            <h4 class="section-title" @click="isApiOpen = !isApiOpen">
              <div class="title-left">
                <BaseIcon :icon="IconBolt" size="md" color="var(--accent-api)" />
                Associated APIs <span v-if="selectedTableData.apis?.length > 0" class="query-stats">({{ selectedTableData.apis.length }})</span>
              </div>
              <BaseIcon :icon="IconChevronDown" :size="20" class="chevron-icon" :class="{ 'is-closed': !isApiOpen }" />
            </h4>
            <div v-show="isApiOpen" class="section-content">
              <div v-if="selectedTableData.apis?.length > 0" class="list-grid">
                <ApiCard
                  v-for="(api, idx) in selectedTableData.apis"
                  :key="idx"
                  :api="api"
                  @click="$emit('goToApi', api.url)"
                />
              </div>
              <div v-else class="empty-message">
                No direct API associations found.
              </div>
            </div>
          </section>
        </div>
      </div>
    </template>
    <EmptyBox v-else class="empty-state">
      <div class="state-content">
        <BaseIcon :icon="IconDocumentDuplicate" :size="64" color="var(--icon-empty)" class="state-icon" />
        <h3 class="state-title">Select a Table</h3>
        <p class="state-desc">Choose a database table from the list to view its associated DBIO files, queries, and impacted APIs.</p>
      </div>
    </EmptyBox>
  </main>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import BaseIcon from '@common/compo/icon/BaseIcon.vue';
import EmptyBox from '@common/compo/box/EmptyBox.vue';
import IconBolt from '@assets/icon/IconBolt.vue';
import IconDatabase from '@assets/icon/IconDatabase.vue';
import IconDocumentDuplicate from '@assets/icon/IconDocumentDuplicate.vue';
import IconChevronDown from '@assets/icon/IconChevronDown.vue';
import IconChevronLeft from '@assets/icon/IconChevronLeft.vue';
import IconChevronRight from '@assets/icon/IconChevronRight.vue';
import ApiCard from '@common/compo/card/ApiCard.vue';
import TableDbmCard from '../compo/TableDbmCard.vue';
import HighlightedText from '@common/compo/text/HighlightedText.vue';

const props = defineProps({
  selectedTableName: {
    type: String,
    default: null
  },
  selectedTableData: {
    type: Object,
    default: null
  },
  isMasterCollapsed: {
    type: Boolean,
    default: false
  },
  searchQuery: {
    type: String,
    default: ''
  }
});

const activeTab = ref('columns');
const isDbioOpen = ref(true);
const isApiOpen = ref(true);

// 테이블 변경 시 탭 리셋
watch(() => props.selectedTableName, () => {
  activeTab.value = 'columns';
  isDbioOpen.value = true;
  isApiOpen.value = true;
});

const queryStatsText = computed(() => {
  if (!props.selectedTableData || !props.selectedTableData.queries) return '';
  const total = props.selectedTableData.queries.length;
  const readCount = props.selectedTableData.queries.filter(q => ['select', 'SELECT'].includes(q.type)).length;
  const modifyCount = total - readCount;
  return `Total ${total} / Read ${readCount} / CUD ${modifyCount}`;
});

const groupedQueries = computed(() => {
  if (!props.selectedTableData || !props.selectedTableData.queries) return {};
  const map = {};
  props.selectedTableData.queries.forEach(q => {
    if (!map[q.dbmClass]) map[q.dbmClass] = [];
    map[q.dbmClass].push(q);
  });
  return map;
});

defineEmits(['goToApi', 'openDbm', 'toggleCollapse']);
</script>

<style scoped lang="scss">
.table-detail-panel {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-surface);
  overflow: hidden;
  
  .detail-header {
    flex-shrink: 0;
    padding: 1.5rem 2rem 1rem 2rem;
    border-bottom: 1px solid var(--border-light);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--bg-panel);
    
    .title-area {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .collapse-btn {
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--icon-muted);
        padding: 0.25rem;
        border-radius: 0.25rem;
        transition: all 0.2s ease;

        &:hover {
          background-color: var(--bg-input);
          color: var(--icon-base);
        }
      }
      
      .title {
        font-size: 1.5rem;
        line-height: 2rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      
      .owner-badge {
        padding: 0.25rem 0.625rem;
        font-size: 0.75rem;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-weight: 700;
        border-radius: 0.25rem;
        background-color: var(--bg-input);
        color: var(--text-tertiary);
        border: 1px solid var(--border-light);
      }
    }
    
    .desc-area {
      margin-top: 0.5rem;
      font-size: 1rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      
      .desc-ko {
        color: var(--accent-vue);
      }
      
      .separator {
        color: var(--border-input);
      }
      
      .desc-vi {
        color: var(--text-accent-emerald);
      }
    }
    
    .stats {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-top: 0.5rem;
    }
  }

  .detail-tabs {
    display: flex;
    padding: 0 2rem;
    background-color: var(--bg-panel);
    border-bottom: 1px solid var(--border-base);
    gap: 1.5rem;
    flex-shrink: 0;

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 0;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-tertiary);
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: -1px;

      &:hover {
        color: var(--text-secondary);
      }

      &.active {
        color: var(--text-primary);
        border-bottom-color: var(--accent-primary, #3b82f6);
      }
    }
  }
  
  .detail-scroll {
    flex: 1 1 0%;
    overflow-y: auto;
    padding: 2rem;
    display: flex;
    flex-direction: column;
  }

  .tab-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    
    &.relations-tab {
      /* Keep same padding/gap as before */
    }
  }

  /* Table styling for Columns Tab */
  .table-wrapper {
    border: 1px solid var(--border-base);
    border-radius: 0.5rem;
    overflow: hidden;
    background-color: var(--bg-panel);

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;

      th, td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--border-light);
      }

      th {
        background-color: var(--bg-panel-light);
        font-weight: 600;
        color: var(--text-secondary);
        white-space: nowrap;
      }

      tbody tr:last-child td {
        border-bottom: none;
      }

      tbody tr:hover {
        background-color: var(--bg-input);
      }

      .center-align {
        text-align: center;
      }

      .font-mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      }

      .font-medium {
        font-weight: 500;
        color: var(--text-primary);
      }

      .text-muted {
        color: var(--text-muted);
      }

      .text-ko {
        color: var(--text-secondary);
      }

      .text-vi {
        color: var(--text-accent-emerald);
      }

      .pk-badge {
        display: inline-block;
        padding: 0.125rem 0.375rem;
        font-size: 0.6875rem;
        font-weight: 700;
        color: var(--text-accent-emerald, #34d399);
        background-color: rgba(52, 211, 153, 0.1);
        border: 1px solid rgba(52, 211, 153, 0.25);
        border-radius: 0.25rem;
      }
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
  
  .list-grid {
    display: grid;
    gap: 0.75rem;
  }
  
  .dbm-groups {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .dbm-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    
    .dbm-group-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-tertiary);
      display: flex;
      align-items: center;
      gap: 0.375rem;
      margin: 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      
      .dbm-group-icon {
        color: var(--icon-muted);
      }
    }
  }
  
  .empty-message {
    color: var(--text-disabled);
    font-size: 0.875rem;
    font-style: italic;
    background-color: var(--bg-panel-light);
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--border-base);
  }
  
  .empty-state {
    flex: 1 1 0%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-disabled);
    padding: 2rem;
    
    .state-content {
      text-align: center;
      max-width: 28rem;
      
      .state-icon {
        margin-bottom: 1rem;
      }
      
      .state-title {
        font-size: 1.125rem;
        font-weight: 500;
        color: var(--text-tertiary);
        margin-bottom: 0.5rem;
      }
      
      .state-desc {
        font-size: 0.875rem;
      }
    }
  }
}
</style>
