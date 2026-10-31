<template>
  <PageLayout>
    <!-- Header Actions -->
    <template #actions>
      <TableHeader
        v-model="searchQuery"
        :selected-table-name="selectedTableName"
        @openSource="openTableSource"
        @downloadList="downloadTableList"
        @downloadDetail="downloadTableDetail"
      />
    </template>

    <!-- Content (Master-Detail) -->
    <div class="table-content">
      <!-- Left Panel: Table Master List -->
      <TableMasterSection
        v-show="!isMasterCollapsed"
        :search-query="searchQuery"
        :filtered-tables="filteredTables"
        :selected-table-name="selectedTableName"
        :table-map="tableMap"
        @select="selectTable"
      />

      <!-- Right Panel: Table Details -->
      <TableDetailSection
        :selected-table-name="selectedTableName"
        :selected-table-data="selectedTableData"
        :is-master-collapsed="isMasterCollapsed"
        :search-query="searchQuery"
        @goToApi="goToApiPage"
        @openDbm="openDbmGitlab"
        @toggleCollapse="isMasterCollapsed = !isMasterCollapsed"
      />
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import writeXlsxFile from 'write-excel-file/browser';
import { useTableStore } from '@domain/store/useTableStore';
import { CONFIG } from '@common/config/config.js';
import { openGitlabSource } from '@common/utils/gitlabUtils.js';
import PageLayout from '@common/compo/layout/PageLayout.vue';
import TableHeader from './section/TableHeader.vue';
import TableMasterSection from './section/TableMasterSection.vue';
import TableDetailSection from './section/TableDetailSection.vue';

const tableStore = useTableStore();
const router = useRouter();

const { tables, tableMap } = storeToRefs(tableStore);

const selectedTableName = ref(null);
const selectedTableData = ref(null);
const searchQuery = ref('');
const isMasterCollapsed = ref(false);

const selectTable = (tableName) => {
  selectedTableName.value = tableName;
  if (tableName) {
    selectedTableData.value = tableStore.fetchTableDetail(tableName);
    localStorage.setItem('lastSelectedTableV2', tableName);
  } else {
    selectedTableData.value = null;
  }
};

const openTableSource = () => {
  const targetUrl = CONFIG.REPO_CONFIG?.RAW_META_URL || 'https://github.com/nicepig7/fileTrace';
  window.open(targetUrl, '_blank');
};

const downloadTableList = async () => {
  try {
    const data = [
      [
        { value: 'Table Name', fontWeight: 'bold' },
        { value: 'System', fontWeight: 'bold' },
        { value: 'Korean Desc', fontWeight: 'bold' },
        { value: 'English Desc', fontWeight: 'bold' },
        { value: 'Vietnamese Desc', fontWeight: 'bold' }
      ]
    ];

    filteredTables.value.forEach(t => {
      const info = tableMap.value[t]?.info || {};
      data.push([
        { value: t },
        { value: info.owner || '' },
        { value: info.desc_ko || '' },
        { value: info.desc_en || '' },
        { value: info.desc_vi || '' }
      ]);
    });

    const func = typeof writeXlsxFile === 'function' ? writeXlsxFile : writeXlsxFile.default;
    await func(data, {
      columns: [{ width: 30 }, { width: 15 }, { width: 40 }, { width: 40 }, { width: 40 }]
    }).toFile('table_list.xlsx');
  } catch (err) {
    console.error('Download Excel Failed:', err);
    alert('Excel 다운로드 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
  }
};

const downloadTableDetail = async () => {
  if (!selectedTableName.value || !selectedTableData.value) return;
  try {
    const tName = selectedTableName.value;
    const tData = selectedTableData.value;
    const info = tData.info || {};

    const data = [
      [
        { value: 'Table Definition', fontWeight: 'bold', span: 5 }
      ],
      [],
      [
        { value: 'Table Name', fontWeight: 'bold' },
        { value: tName },
        { value: 'System', fontWeight: 'bold' },
        { value: info.system || '' }
      ],
      [
        { value: 'Korean Desc', fontWeight: 'bold' },
        { value: info.desc_ko || '' },
        { value: 'English Desc', fontWeight: 'bold' },
        { value: info.desc_en || '' }
      ],
      [
        { value: 'Vietnamese Desc', fontWeight: 'bold' },
        { value: info.desc_vi || '' }
      ],
      [],
      [
        { value: 'Column Name', fontWeight: 'bold' },
        { value: 'Type', fontWeight: 'bold' },
        { value: 'Length', fontWeight: 'bold' },
        { value: 'Korean Desc', fontWeight: 'bold' },
        { value: 'English Desc', fontWeight: 'bold' },
        { value: 'Vietnamese Desc', fontWeight: 'bold' },
        { value: 'PK', fontWeight: 'bold' },
        { value: 'Nullable', fontWeight: 'bold' }
      ]
    ];

    const columns = tData.columns || [];
    console.log(Object.assign({}, columns[0]));
    columns.forEach(c => {
      data.push([
        { value: c.column_id || '' },
        { value: c.data_type || '' },
        { value: c.length || '' },
        { value: c.desc_ko || '' },
        { value: c.desc_en || '' },
        { value: c.desc_vi || '' },
        { value: c.pk ? 'Y' : '' },
        { value: c.nullable ? 'Y' : '' },
      ]);
    });

    const func = typeof writeXlsxFile === 'function' ? writeXlsxFile : writeXlsxFile.default;
    await func(data, {
      columns: [{ width: 25 }, { width: 15 }, { width: 8 }, { width: 30 }, { width: 30 }, { width: 30 }]
    }).toFile(`${tName}_definition.xlsx`);
  } catch (err) {
    console.error('Download Excel Detail Failed:', err);
    alert('Excel 다운로드 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
  }
};

const goToApiPage = (url) => {
  if (!url) return;
  router.push({ path: '/api-flow', query: { q: url } });
};

const openDbmGitlab = (dbmFile, line, projectId) => {
  openGitlabSource(dbmFile, line, 'dbio', projectId);
};

const filteredTables = computed(() => {
  if (!searchQuery.value) return tables.value;
  const q = searchQuery.value.toLowerCase();
  return tables.value.filter(t => {
    if (t.toLowerCase().includes(q)) return true;
    const info = tableMap.value[t]?.info;
    if (info) {
      if (info.desc_ko?.toLowerCase().includes(q)) return true;
      if (info.desc_en?.toLowerCase().includes(q)) return true;
      if (info.desc_vi?.toLowerCase().includes(q)) return true;
      if (info.search_text?.includes(q)) return true;
    }
    return false;
  });
});

onMounted(async () => {
  await tableStore.init();
  
  const savedTable = localStorage.getItem('lastSelectedTableV2');
  if (savedTable && tables.value.includes(savedTable)) {
    selectTable(savedTable);
    nextTick(() => {
      const selectedBtn = document.querySelector(`button[data-table-name="${savedTable}"]`);
      if (selectedBtn) {
        selectedBtn.scrollIntoView({ block: 'center', behavior: 'instant' });
      }
    });
  }
});
</script>

<style scoped lang="scss">
.table-content {
  flex: 1 1 0%;
  display: flex;
  overflow: hidden;
  width: 100%;
}
</style>
