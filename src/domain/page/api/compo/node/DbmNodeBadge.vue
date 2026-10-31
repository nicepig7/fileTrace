<template>
  <span v-if="node.queryName" class="dbm-node-container">
    <span 
        @click.stop="openDbmGitlab"
        :class="['query-type-badge', ['select', 'insert', 'update', 'delete'].includes((node.queryType || '').toLowerCase()) ? `is-${node.queryType.toLowerCase()}` : 'is-default', { 'has-link': !!node.dbioFile }]"
        :title="node.dbioFile ? 'View query source on GitLab' : ''"
    >
        <span>{{ (node.queryType || 'UNKNOWN').toUpperCase() }}</span>
        <BaseIcon v-if="node.dbioFile" :icon="IconGitLab" :size="12" class="link-icon" />
    </span>
    <span v-if="allTables.length > 0" class="table-list">
        <template v-for="table in allTables" :key="table.name">
            <TooltipPopover v-if="table.isValid" width-class="w-80" position="bottom">
                <template #trigger>
                    <span class="table-item-badge">
                        <BaseIcon :icon="IconDatabase" :size="12" class="icon-database" />
                        <HighlightedText :text="table.name" />
                    </span>
                </template>
                <template #default>
                    <TableTooltipContent :table-name="table.name" :details="table.details" />
                </template>
            </TooltipPopover>
            <span v-else class="table-item-badge is-invalid" title="Table info not found">
                <BaseIcon :icon="IconDatabase" :size="12" class="icon-database" />
                <HighlightedText :text="table.name" />
            </span>
        </template>
    </span>
  </span>
</template>

<script setup>
import BaseIcon from '@common/compo/icon/BaseIcon.vue';
import IconDatabase from '@assets/icon/IconDatabase.vue';
import IconGitLab from '@assets/icon/IconGitLab.vue';
import TooltipPopover from '@common/compo/overlay/TooltipPopover.vue';
import TableTooltipContent from '@domain/module/tableTooltip/TableTooltipContent.vue';
import HighlightedText from '@common/compo/text/HighlightedText.vue';
import { useTableInfo } from '@domain/store/composables/useTableInfo.js';
import { CONFIG } from '@common/config/config.js';
import { computed } from 'vue';

const { getTableDetails } = useTableInfo();

const props = defineProps({
  node: {
    type: Object,
    required: true
  }
});

const allTables = computed(() => {
  if (!props.node || !props.node.tables) return [];
  return props.node.tables.map(tableName => {
    return {
      name: tableName,
      details: getTableDetails(tableName),
      isValid: getTableDetails(tableName) !== null
    };
  });
});

const openDbmGitlab = () => {
  const dbmFile = props.node.dbioFile;
  const pkgName = props.node.packageName;
  if (!dbmFile) return;

  // e.g., dbmFile is 'User001_DBM', pkgName is 'com.example.user'
  let fullPath = dbmFile;
  if (pkgName) {
    fullPath = `${pkgName}.${dbmFile}`;
  }

  const path = fullPath.replace(/\./g, '/');
  
  let projId = props.node.projectId;
  if (!projId) {
    projId = 'MBW';
    if (dbmFile.includes('.adm.')) projId = 'ADM';
    else if (dbmFile.includes('.cor.')) projId = 'COR';
  }

  const project = CONFIG.PROJECTS?.find(p => p.id === projId && p.type === 'ONLINE')
               || CONFIG.PROJECTS?.find(p => p.id === projId);
  const gitlabBase = project?.gitlabBase || `${CONFIG.REPO_CONFIG?.PROJECT_REPO_URL || 'https://github.com/nicepig7/fileTrace'}/blob/main/src/`;
  
  const line = props.node.queryLine;
  const lineSuffix = line ? `#L${line}` : '';
  const url = `${gitlabBase}${path}.dbio${lineSuffix}`;
  
  window.open(url, '_blank');
};
</script>

<style scoped lang="scss">
.dbm-node-container {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-left: 0.5rem;
}

.query-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

  &.has-link {
    cursor: pointer;
    transition: opacity 0.15s ease-in-out;
    &:hover {
      opacity: 0.8;
    }
    
    .link-icon {
      opacity: 0.7;
    }
    &:hover .link-icon {
      opacity: 1;
    }
  }

  &.is-select {
    background-color: var(--query-select-bg);
    color: var(--query-select-text);
  }
  &.is-insert {
    background-color: var(--query-insert-bg);
    color: var(--query-insert-text);
  }
  &.is-update {
    background-color: var(--query-update-bg);
    color: var(--query-update-text);
  }
  &.is-delete {
    background-color: var(--query-delete-bg);
    color: var(--query-delete-text);
  }
  &.is-default {
    background-color: var(--query-default-bg);
    color: var(--query-default-text);
  }
}

.table-list {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.table-item-badge {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: var(--table-badge-text);
  background-color: var(--table-badge-bg);
  border: 1px solid var(--table-badge-border);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  cursor: help;
  height: 100%;
  transition: background-color 0.15s ease-in-out;

  &:hover {
    background-color: var(--table-badge-hover-bg);
  }

  .icon-database {
    color: var(--table-badge-icon);
    margin-right: 0.25rem;
  }

  &.is-invalid {
    cursor: default;
    opacity: 0.6;
    filter: grayscale(100%);
    
    &:hover {
      background-color: var(--table-badge-bg);
    }
  }
}
</style>
