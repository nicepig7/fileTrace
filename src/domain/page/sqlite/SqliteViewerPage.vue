<template>
  <div class="sqlite-viewer">
    <div class="header">
      <h2>SQLite Query Viewer</h2>
      <div v-if="loading" class="status loading">Loading DB...</div>
      <div v-else class="status ready">DB Ready</div>
    </div>
    
    <div class="content-split">
      <div class="left-panel">
        <h3>Tables</h3>
        <ul class="table-list">
          <li v-for="table in tables" :key="table.name" @click="selectTable(table.name)">
            {{ table.name }}
          </li>
        </ul>
      </div>
      
      <div class="right-panel">
        <div class="query-box">
          <textarea v-model="sqlQuery" placeholder="Enter SQL query here..." @keydown.ctrl.enter="executeQuery"></textarea>
          <div class="query-actions">
            <div class="execution-time"><span v-if="executionTime !== null">실행 시간: {{ executionTime }}ms</span></div>
            <button @click="executeQuery" :disabled="loading">Run Query</button>
          </div>
        </div>
        
        <div class="error-msg" v-if="error">{{ error }}</div>
        
        <div class="results" v-if="results.length > 0">
          <table>
            <thead>
              <tr>
                <th v-for="key in Object.keys(results[0])" :key="key">{{ key }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in results" :key="idx">
                <td v-for="key in Object.keys(row)" :key="key">{{ row[key] }}</td>
              </tr>
            </tbody>
          </table>
          <div class="summary">{{ results.length }} rows returned.</div>
        </div>
        <div v-else-if="executed && results.length === 0" class="no-results">
          No results found.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { sqliteService } from '@extern/sqlite/sqliteService.js';

const loading = ref(true);
const tables = ref([]);
const sqlQuery = ref('');
const results = ref([]);
const error = ref(null);
const executed = ref(false);
const executionTime = ref(null);

onMounted(async () => {
  try {
    await sqliteService.init();
    tables.value = sqliteService.getTables();
  } catch (err) {
    error.value = 'Failed to load database: ' + err.message;
  } finally {
    loading.value = false;
  }
});

function selectTable(tableName) {
  sqlQuery.value = `SELECT * FROM ${tableName} LIMIT 50;`;
  executeQuery();
}

function executeQuery() {
  if (!sqlQuery.value.trim()) return;
  
  error.value = null;
  executed.value = true;
  results.value = [];
  executionTime.value = null;
  
  const startTime = performance.now();
  try {
    results.value = sqliteService.query(sqlQuery.value);
    const endTime = performance.now();
    executionTime.value = (endTime - startTime).toFixed(2);
  } catch (err) {
    error.value = err.message;
  }
}
</script>

<style scoped>
.sqlite-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.status.loading { color: #f39c12; }
.status.ready { color: #27ae60; }

.content-split {
  display: flex;
  gap: 1rem;
  flex: 1;
  min-height: 0;
}

.left-panel {
  width: 250px;
  background: var(--bg-surface, #1e1e1e);
  border: 1px solid var(--border-color, #333);
  border-radius: 8px;
  padding: 1rem;
  overflow-y: auto;
}

.table-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.table-list li {
  padding: 0.5rem;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color, #333);
  font-family: 'D2Coding', monospace;
  text-transform: uppercase;
}

.table-list li:hover {
  background: var(--bg-hover, #2d2d2d);
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.query-box {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

textarea {
  width: 100%;
  height: 100px;
  padding: 0.5rem;
  font-family: 'D2Coding', monospace;
  background: var(--bg-input, #2d2d2d);
  color: var(--text-primary, #fff);
  border: 1px solid var(--border-color, #444);
  border-radius: 4px;
}

.query-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.execution-time {
  font-size: 0.85rem;
  color: var(--text-secondary, #aaa);
}

button {
  padding: 0.5rem 1rem;
  background: var(--primary-color, #3498db);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-msg {
  color: #e74c3c;
  padding: 0.5rem;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 4px;
}

.results {
  flex: 1;
  overflow: auto;
  border: 1px solid var(--border-color, #333);
  border-radius: 8px;
  background: var(--bg-surface, #1e1e1e);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'D2Coding', monospace;
  font-size: 14px;
}

th, td {
  padding: 0.5rem;
  border: 1px solid var(--border-color, #333);
  text-align: left;
  white-space: nowrap;
}

th {
  background: var(--bg-header, #2d2d2d);
  position: sticky;
  top: 0;
}

.summary {
  padding: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary, #aaa);
}

.no-results {
  padding: 1rem;
  color: var(--text-secondary, #aaa);
  text-align: center;
}
</style>
