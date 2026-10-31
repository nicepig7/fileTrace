import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { sqliteService } from '@extern/sqlite/sqliteService.js';

export const useApiStore = defineStore('apiV2', () => {
  const isLoaded = ref(false);
  const endpoints = ref([]);

  // 필터 관련 상태
  const searchQuery = ref('');
  const debouncedQuery = ref('');
  const selectedProject = ref('All');
  const selectedPackage = ref('All');

  let debounceTimer = null;
  watch(searchQuery, (newVal) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (!newVal) {
      debouncedQuery.value = '';
    } else {
      debounceTimer = setTimeout(() => {
        debouncedQuery.value = newVal;
      }, 250);
    }
  });

  // 필터 옵션
  const projects = ref(['All']);

  const packages = computed(() => {
    const pkgSet = new Set(['All']);
    endpoints.value.forEach(ep => {
      if (selectedProject.value === 'All' || ep.projectId === selectedProject.value) {
        if (ep.packageName) pkgSet.add(ep.packageName);
      }
    });

    return Array.from(pkgSet).map(pkg => {
      if (pkg === 'All') return { value: 'All', label: 'All' };

      let label = pkg;
      if (pkg.endsWith('.ctr')) {
        const parts = pkg.replace(/\.ctr$/, '').split('.');
        if (parts.length > 0) {
          label = parts[parts.length - 1].toUpperCase();
        }
      }
      return { value: pkg, label };
    });
  });

  watch(selectedProject, () => {
    selectedPackage.value = 'All';
  });

  async function init() {
    if (isLoaded.value) return;
    await sqliteService.init();
    loadAllData();
    isLoaded.value = true;
  }

  function loadAllData() {
    console.time("Pre-load All Data");

    // 1. 엔드포인트 목록 조회
    const epResult = sqliteService.query(`
      SELECT 
        e.method_id as methodId,
        e.url,
        e.http_method as httpMethod,
        c.project_id as projectId,
        c.package_name as packageName,
        c.class_name as className,
        m.method_name as methodName,
        (
            SELECT GROUP_CONCAT(DISTINCT s.screen_id)
            FROM fd_ui_api_info ui_api
            JOIN fd_ui_screen_api_map map ON ui_api.id = map.api_id
            JOIN fd_ui_screen_info s ON map.screen_id = s.id
            WHERE ui_api.api_url = e.normalized_url 
              AND (ui_api.http_method = e.http_method OR ui_api.http_method IS NULL OR e.http_method IS NULL)
              AND ui_api.project_id = c.project_id
              AND s.target_type = 'WEB'
        ) as vueScreensRaw,
        (
            SELECT GROUP_CONCAT(DISTINCT s.screen_id)
            FROM fd_ui_api_info ui_api
            JOIN fd_ui_screen_api_map map ON ui_api.id = map.api_id
            JOIN fd_ui_screen_info s ON map.screen_id = s.id
            WHERE ui_api.api_url = e.normalized_url 
              AND (ui_api.http_method = e.http_method OR ui_api.http_method IS NULL OR e.http_method IS NULL)
              AND ui_api.project_id = c.project_id
              AND s.target_type = 'AOS'
        ) as aosScreensRaw
      FROM fd_endpoint_info e
      JOIN fd_method_info m ON e.method_id = m.id
      JOIN fd_class_info c ON m.class_id = c.id
      ORDER BY c.project_id desc, e.http_method desc, e.url ASC
    `);

    // 2. 전체 메서드 노드 정보 조회 (쿼리, MCI 등 조인)
    const nodeResult = sqliteService.query(`
      SELECT 
        m.id as methodId,
        m.method_name as methodName,
        m.line as methodLine,
        c.package_name as packageName,
        c.class_name as className,
        c.class_type as classType,
        c.project_id as projectId,
        mci.id as mciId,
        mci.asis_id as mciAsisId,
        q.query_name as queryName,
        q.query_type as queryType,
        q.dbio_file as dbioFile,
        q.line as queryLine,
        (
            SELECT GROUP_CONCAT(qt.table_id) 
            FROM fd_query_tables qt 
            WHERE qt.query_id = q.id
        ) as tables
      FROM fd_method_info m
      JOIN fd_class_info c ON m.class_id = c.id
      LEFT JOIN fd_mci_info mci ON (
          c.class_name LIKE '%' || mci.id || '%' 
          OR (mci.asis_id != '' AND mci.asis_id != '#N/A' AND length(mci.asis_id) > 3 AND c.class_name LIKE '%' || mci.asis_id || '%')
      ) AND c.class_type IN ('JAVA_COM', 'JAVA_CTR', 'JAVA_MCI', 'JAVA_CARD') AND m.method_name = 'callTrx'
      LEFT JOIN fd_query_info q ON q.method_id = m.id
    `);

    // 3. 전체 호출 관계 조회
    const callsResult = sqliteService.query(`
      SELECT caller_id, callee_id 
      FROM fd_method_calls
    `);

    // 4. 노드 맵 구성
    const nodeMap = new Map();
    nodeResult.forEach(item => {
      nodeMap.set(item.methodId, {
        methodId: item.methodId,
        packageName: item.packageName,
        className: item.className,
        methodName: item.methodName,
        lineNumber: item.methodLine,
        classType: item.classType,
        type: item.classType ? item.classType.replace('JAVA_', '') : 'CLASS',
        projectId: item.projectId,
        mciId: item.mciId,
        mciAsisId: item.mciAsisId,
        queryName: item.queryName,
        queryType: item.queryType,
        dbioFile: item.dbioFile,
        queryLine: item.queryLine,
        tables: item.tables ? item.tables.split(',') : [],
        children: []
      });
    });

    // 5. 호출 관계 구성 (caller_id -> [callee_ids])
    const childrenMap = new Map();
    callsResult.forEach(call => {
      if (!childrenMap.has(call.caller_id)) {
        childrenMap.set(call.caller_id, []);
      }
      childrenMap.get(call.caller_id).push(call.callee_id);
    });

    // 재귀 트리 조립 함수
    function assemble(nodeId, visited = new Set()) {
      if (visited.has(nodeId)) {
        const circularNode = { ...nodeMap.get(nodeId), isCircular: true, children: [] };
        if (!circularNode.className) circularNode.className = "Unknown (Circular)";
        return circularNode;
      }
      visited.add(nodeId);

      const originalNode = nodeMap.get(nodeId);
      if (!originalNode) return null;

      const node = { ...originalNode };
      const childIds = childrenMap.get(nodeId) || [];
      node.children = childIds.map(cid => assemble(cid, new Set(visited))).filter(Boolean);
      return node;
    }

    // DBM/MCI 여부 검사 함수
    function checkMci(node) {
      if (node.mciAsisId) return true;
      return node.children.some(c => checkMci(c));
    }
    function checkDbm(node) {
      if (node.classType === 'JAVA_DBM' || node.queryName) return true;
      return node.children.some(c => checkDbm(c));
    }

    // 6. 각 Endpoint별 트리 구성 및 플래그 계산
    const projSet = new Set(['All']);
    const builtEndpoints = epResult.map(row => {
      const treeData = assemble(row.methodId);

      let hasDbm = false;
      let hasMci = false;
      if (treeData) {
        hasDbm = checkDbm(treeData);
        hasMci = checkMci(treeData);
      }

      if (row.projectId) projSet.add(row.projectId);

      return {
        ...row,
        vueScreens: row.vueScreensRaw ? row.vueScreensRaw.split(',') : [],
        aosScreens: row.aosScreensRaw ? row.aosScreensRaw.split(',') : [],
        isOpen: false,
        treeData: treeData,
        loadingTree: false,
        hasDbm,
        hasMci
      };
    });

    endpoints.value = builtEndpoints;
    projects.value = Array.from(projSet).sort();

    console.timeEnd("Pre-load All Data");
  }

  // Deep Search 필터링 로직
  const filteredEndpoints = computed(() => {
    let result = endpoints.value;

    if (selectedProject.value !== 'All') {
      result = result.filter(ep => ep.projectId === selectedProject.value);
    }

    if (selectedPackage.value !== 'All') {
      result = result.filter(ep => ep.packageName === selectedPackage.value);
    }

    const q = debouncedQuery.value.toLowerCase();
    if (q) {
      result = result.filter(ep => {
        // 기본 텍스트 체크 (URL, Screens)
        const hasVueScreenMatch = ep.vueScreens && ep.vueScreens.some(s => s.toLowerCase().includes(q));
        const hasAosScreenMatch = ep.aosScreens && ep.aosScreens.some(s => s.toLowerCase().includes(q));
        if (ep.url?.toLowerCase().includes(q) || hasVueScreenMatch || hasAosScreenMatch) return true;

        // Tree Deep Check
        let found = false;
        const checkChildren = (children) => {
          if (!children || found) return;
          for (const child of children) {
            // 클래스/메서드 매칭
            const nodeLabel = `${child.className}.${child.methodName}`.toLowerCase();
            if (nodeLabel.includes(q)) { found = true; return; }

            // MCI (Interface) 매칭
            if (child.mciId && child.mciId.toLowerCase().includes(q)) { found = true; return; }
            if (child.mciAsisId && child.mciAsisId.toLowerCase().includes(q)) { found = true; return; }

            // DBM 쿼리 / 테이블 매칭
            if (child.queryName && child.queryName.toLowerCase().includes(q)) { found = true; return; }
            if (child.tables && child.tables.some(t => t.toLowerCase().includes(q))) { found = true; return; }

            checkChildren(child.children);
          }
        };

        if (ep.treeData) {
          checkChildren([ep.treeData]);
        }
        return found;
      });
    }

    return result;
  });

  function toggleEndpoint(methodId) {
    const ep = endpoints.value.find(e => e.methodId === methodId);
    if (ep) {
      ep.isOpen = !ep.isOpen;
    }
  }

  return {
    isLoaded,
    endpoints,
    filteredEndpoints,
    searchQuery,
    selectedProject,
    selectedPackage,
    projects,
    packages,
    init,
    toggleEndpoint
  };
});
