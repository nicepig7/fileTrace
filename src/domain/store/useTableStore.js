import { defineStore } from 'pinia';
import { ref } from 'vue';
import { sqliteService } from '@extern/sqlite/sqliteService.js';

export const useTableStore = defineStore('tableV2', () => {
  const isLoaded = ref(false);
  const tables = ref([]);
  const tableMap = ref({});

  async function init() {
    if (isLoaded.value) return;

    await sqliteService.init();

    // 1. Fetch all distinct tables from query_tables and join with table_info
    const result = sqliteService.query(`
      WITH RECURSIVE call_tree(caller_id, callee_id, origin_callee_id) AS (
          SELECT mc.caller_id, mc.callee_id, mc.callee_id as origin_callee_id
          FROM fd_query_info qi
          JOIN fd_method_calls mc ON mc.callee_id = qi.method_id
          
          UNION
          
          SELECT mc.caller_id, mc.callee_id, ct.origin_callee_id
          FROM fd_method_calls mc
          JOIN call_tree ct ON mc.callee_id = ct.caller_id
      ),
      api_counts AS (
          SELECT qt.table_id, 
                 count(DISTINCT e.id) as apiCount,
                 GROUP_CONCAT(DISTINCT e.url) as apiUrls
          FROM fd_query_tables qt
          JOIN fd_query_info qi ON qt.query_id = qi.id
          JOIN call_tree ct ON ct.origin_callee_id = qi.method_id
          JOIN fd_endpoint_info e ON ct.caller_id = e.method_id
          GROUP BY qt.table_id
      ),
      query_counts AS (
          SELECT qt.table_id, 
                 count(qt.query_id) as queryCount,
                 GROUP_CONCAT(DISTINCT qi.query_name) as queryNames,
                 GROUP_CONCAT(DISTINCT qi.dbio_file) as dbioFiles
          FROM fd_query_tables qt
          JOIN fd_query_info qi ON qt.query_id = qi.id
          GROUP BY qt.table_id
      ),
      column_counts AS (
          SELECT table_name, 
                 GROUP_CONCAT(column_id) as colIds,
                 GROUP_CONCAT(desc_ko) as colKos
          FROM fd_column_info
          GROUP BY table_name
      )
      SELECT 
        i.id as name,
        i.desc_ko,
        i.desc_en,
        i.desc_vi,
        i.owner,
        IFNULL(qc.queryCount, 0) as queryCount,
        IFNULL(ac.apiCount, 0) as apiCount,
        IFNULL(qc.queryNames, '') as queryNames,
        IFNULL(qc.dbioFiles, '') as dbioFiles,
        IFNULL(ac.apiUrls, '') as apiUrls,
        IFNULL(cc.colIds, '') as colIds,
        IFNULL(cc.colKos, '') as colKos
      FROM fd_table_info i
      LEFT JOIN query_counts qc ON i.id = qc.table_id
      LEFT JOIN api_counts ac ON i.id = ac.table_id
      LEFT JOIN column_counts cc ON i.id = cc.table_name
      ORDER BY i.id ASC
    `);

    const tMap = {};
    const tList = [];

    for (const row of result) {
      tList.push(row.name);
      tMap[row.name] = {
        info: {
          desc_ko: row.desc_ko,
          desc_en: row.desc_en,
          desc_vi: row.desc_vi,
          owner: row.owner,
          queryCount: row.queryCount,
          apiCount: row.apiCount,
          search_text: (row.queryNames + ' ' + row.dbioFiles + ' ' + row.apiUrls + ' ' + row.colIds + ' ' + row.colKos).toLowerCase()
        },
        queries: [],
        apis: [],
        columns: []
      };
    }

    tables.value = tList;
    tableMap.value = tMap;
    isLoaded.value = true;
  }

  function fetchTableDetail(tableName) {
    if (!tableName || !tableMap.value[tableName]) return null;
    
    // Check if already fetched
    if (tableMap.value[tableName].queries.length > 0 || tableMap.value[tableName].apis.length > 0) {
      return tableMap.value[tableName];
    }

    // Fetch queries for this table
    const queryData = sqliteService.query(`
      SELECT
          qi.query_type as type,
          (c.package_name || '.' || qi.dbio_file) as dbmFile,
          qi.line as line,
          m.method_name as method,
          c.class_name as originalDbmClass,
          c.project_id as projectId
      FROM fd_query_tables qt
      JOIN fd_query_info qi ON qt.query_id = qi.id
      JOIN fd_method_info m ON qi.method_id = m.id
      JOIN fd_class_info c ON m.class_id = c.id
      WHERE qt.table_id = $tableName
    `, { $tableName: tableName });

    const formattedQueries = queryData.map(q => {
      const proj = q.projectId ? q.projectId.toUpperCase() : 'MBW';
      return {
        ...q,
        dbmClass: `[${proj}] ${q.originalDbmClass}`
      };
    });

    // Fetch related APIs by tracing the method call graph up to the endpoints
    const apiData = sqliteService.query(`
      WITH RECURSIVE call_tree(caller_id, callee_id) AS (
          -- Base case: Methods that call the queries accessing this table
          SELECT mc.caller_id, mc.callee_id
          FROM fd_query_tables qt
          JOIN fd_query_info qi ON qt.query_id = qi.id
          JOIN fd_method_calls mc ON mc.callee_id = qi.method_id
          WHERE qt.table_id = $tableName
          
          UNION
          
          -- Recursive case
          SELECT mc.caller_id, mc.callee_id
          FROM fd_method_calls mc
          JOIN call_tree ct ON mc.callee_id = ct.caller_id
      )
      SELECT DISTINCT
          e.url,
          e.http_method as method,
          c.class_name as ctrClass,
          m.method_name as methodName
      FROM call_tree ct
      JOIN fd_endpoint_info e ON ct.caller_id = e.method_id
      JOIN fd_method_info m ON e.method_id = m.id
      JOIN fd_class_info c ON m.class_id = c.id
    `, { $tableName: tableName });

    // Fetch column metadata for this table
    const columnData = sqliteService.query(`
      SELECT
        column_id,
        data_type,
        length,
        pk,
        nullable,
        desc_ko,
        desc_en,
        desc_vi
      FROM fd_column_info
      WHERE table_name = $tableName
      ORDER BY pk DESC, column_id ASC
    `, { $tableName: tableName });

    tableMap.value[tableName].queries = formattedQueries;
    tableMap.value[tableName].apis = apiData;
    tableMap.value[tableName].columns = columnData;

    return tableMap.value[tableName];
  }

  return {
    isLoaded,
    tables,
    tableMap,
    init,
    fetchTableDetail
  };
});
