import { defineStore } from 'pinia';
import { ref } from 'vue';
import { sqliteService } from '@extern/sqlite/sqliteService.js';

export const useMciStore = defineStore('mciV2', () => {
  const isLoaded = ref(false);
  const mcis = ref([]);
  const mciMap = ref({});

  async function init() {
    if (isLoaded.value) return;

    await sqliteService.init();

    // Fetch all distinct MCI classes and join with fd_mci_info
    const result = sqliteService.query(`
      SELECT 
        m.id as name,
        c.id as classId,
        c.class_type as classType,
        m.asis_id as asisId,
        m.name_kr as nameKr,
        m.name_en as nameEn,
        m.name_vi as nameVi,
        m.in_out as inOut
      FROM fd_mci_info m
      LEFT JOIN fd_class_info c ON (
          c.class_name LIKE '%' || m.id || '%'
          OR (m.asis_id != '' AND m.asis_id != '#N/A' AND length(m.asis_id) > 3 AND c.class_name LIKE '%' || m.asis_id || '%')
        )
        AND c.class_type IN ('JAVA_COM', 'JAVA_CTR', 'JAVA_MCI', 'JAVA_CARD')
        AND (
          c.class_type = 'JAVA_CTR' 
          OR EXISTS (SELECT 1 FROM fd_method_info mi WHERE mi.class_id = c.id AND mi.method_name = 'callTrx')
        )
      ORDER BY m.id ASC
    `);

    const tMap = {};
    const tList = [];

    for (const row of result) {
      if (!tMap[row.name]) {
        tList.push(row.name);
        tMap[row.name] = {
          classIds: { inbound: [], outbound: [] },
          info: {
            asisId: row.asisId,
            nameKr: row.nameKr,
            nameEn: row.nameEn,
            nameVi: row.nameVi,
            inOut: row.inOut
          },
          apis: [],
          inboundApis: [],
          fetched: false
        };
      }
      if (row.classId) {
        if (row.classType === 'JAVA_CTR' && !tMap[row.name].classIds.inbound.includes(row.classId)) {
          tMap[row.name].classIds.inbound.push(row.classId);
        } else if (['JAVA_COM', 'JAVA_MCI', 'JAVA_CARD'].includes(row.classType) && !tMap[row.name].classIds.outbound.includes(row.classId)) {
          tMap[row.name].classIds.outbound.push(row.classId);
        }
      }
    }

    // Fetch API counts for outbound MCIs
    const outboundCountResult = sqliteService.query(`
      WITH RECURSIVE call_tree(caller_id, callee_id, root_mci_class_id) AS (
          SELECT mc.caller_id, mc.callee_id, m.class_id
          FROM fd_method_info m
          JOIN fd_method_calls mc ON mc.callee_id = m.id
          JOIN fd_class_info c ON m.class_id = c.id
          WHERE m.method_name = 'callTrx'
            AND c.class_type IN ('JAVA_COM', 'JAVA_MCI', 'JAVA_CARD')
          
          UNION
          
          SELECT mc.caller_id, mc.callee_id, ct.root_mci_class_id
          FROM fd_method_calls mc
          JOIN call_tree ct ON mc.callee_id = ct.caller_id
      )
      SELECT 
          mci.id as mci_id,
          COUNT(DISTINCT e.url) as api_count
      FROM call_tree ct
      JOIN fd_endpoint_info e ON ct.caller_id = e.method_id
      JOIN fd_class_info c ON ct.root_mci_class_id = c.id
      JOIN fd_mci_info mci ON (
          c.class_name LIKE '%' || mci.id || '%'
          OR (mci.asis_id != '' AND mci.asis_id != '#N/A' AND length(mci.asis_id) > 3 AND c.class_name LIKE '%' || mci.asis_id || '%')
      )
      GROUP BY mci.id
    `);

    // Fetch API counts for inbound MCIs
    const inboundCountResult = sqliteService.query(`
      SELECT 
          mci.id as mci_id,
          COUNT(DISTINCT e.url) as api_count
      FROM fd_endpoint_info e
      JOIN fd_method_info m ON e.method_id = m.id
      JOIN fd_class_info c ON m.class_id = c.id
      JOIN fd_mci_info mci ON (
          c.class_name LIKE '%' || mci.id || '%'
          OR (mci.asis_id != '' AND mci.asis_id != '#N/A' AND length(mci.asis_id) > 3 AND c.class_name LIKE '%' || mci.asis_id || '%')
      )
      WHERE c.class_type = 'JAVA_CTR'
      GROUP BY mci.id
    `);

    // Assign API counts to map
    for (const name of tList) {
      tMap[name].apiCounts = { inbound: 0, outbound: 0 };
    }
    for (const row of outboundCountResult) {
      if (tMap[row.mci_id]) tMap[row.mci_id].apiCounts.outbound = row.api_count;
    }
    for (const row of inboundCountResult) {
      if (tMap[row.mci_id]) tMap[row.mci_id].apiCounts.inbound = row.api_count;
    }

    mcis.value = tList;
    mciMap.value = tMap;
    isLoaded.value = true;
  }

  function fetchMciDetail(mciName) {
    if (!mciName || !mciMap.value[mciName]) return null;

    // Check if already fetched
    if (mciMap.value[mciName].fetched) {
      return mciMap.value[mciName];
    }

    const classIds = mciMap.value[mciName].classIds;

    // Fetch related APIs by tracing the method call graph UP to the endpoints (Outbound)
    if (classIds.outbound.length > 0) {
      const outboundIds = classIds.outbound.join(',');
      const apiData = sqliteService.query(`
        WITH RECURSIVE call_tree(caller_id, callee_id) AS (
            SELECT mc.caller_id, mc.callee_id
            FROM fd_method_info m
            JOIN fd_method_calls mc ON mc.callee_id = m.id
            WHERE m.class_id IN (${outboundIds}) AND m.method_name = 'callTrx'
            
            UNION
            
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
      `);
      mciMap.value[mciName].apis = apiData.map(q => ({
        url: q.url,
        method: q.method,
        ctrClass: q.ctrClass,
        methodName: q.methodName
      }));
    } else {
      mciMap.value[mciName].apis = [];
    }

    // Fetch direct endpoints for inbound CTR classes (Inbound)
    if (classIds.inbound.length > 0) {
      const inboundIds = classIds.inbound.join(',');
      const inboundData = sqliteService.query(`
        SELECT DISTINCT
            e.url,
            e.http_method as method,
            c.class_name as ctrClass,
            m.method_name as methodName
        FROM fd_endpoint_info e
        JOIN fd_method_info m ON e.method_id = m.id
        JOIN fd_class_info c ON m.class_id = c.id
        WHERE c.id IN (${inboundIds})
      `);
      mciMap.value[mciName].inboundApis = inboundData.map(q => ({
        url: q.url,
        method: q.method,
        ctrClass: q.ctrClass,
        methodName: q.methodName
      }));
    } else {
      mciMap.value[mciName].inboundApis = [];
    }

    mciMap.value[mciName].fetched = true;

    return mciMap.value[mciName];
  }

  return {
    isLoaded,
    mcis,
    mciMap,
    init,
    fetchMciDetail
  };
});
