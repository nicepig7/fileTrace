import { normalizeUrl } from './urlUtils.js';

export function buildBackendV2Data(db, classes, dbios) {
    db.exec("BEGIN TRANSACTION");

    // Pre-compile statements
    const insertClass = db.prepare(`
        INSERT INTO fd_class_info (project_id, package_name, class_name, class_type)
        VALUES (?, ?, ?, ?)
        RETURNING id
    `);

    const insertMethod = db.prepare(`
        INSERT INTO fd_method_info (class_id, method_name, param_count, line)
        VALUES (?, ?, ?, ?)
        RETURNING id
    `);

    const insertEndpoint = db.prepare("INSERT INTO fd_endpoint_info (method_id, url, normalized_url, http_method) VALUES (?, ?, ?, ?)");
    const insertCall = db.prepare("INSERT OR IGNORE INTO fd_method_calls (caller_id, callee_id) VALUES (?, ?)");

    const insertQuery = db.prepare(`
        INSERT INTO fd_query_info (method_id, query_name, query_type, dbio_file, line) 
        VALUES (?, ?, ?, ?, ?) 
        RETURNING id
    `);
    const insertTable = db.prepare("INSERT INTO fd_query_tables (query_id, table_id) VALUES (?, ?)");

    const methodIdMap = new Map(); // key: "packageName.className.methodName_paramCount", value: method_id
    const methodFallbackMap = new Map(); // key: "className.methodName_paramCount", value: method_id
    const dbioLookupMap = new Map(); // key: "className.methodName", value: method_id (for DBIO mapping)

    // 1. 클래스, 메서드, 엔드포인트 적재
    for (const cls of classes) {
        try {
            const classRes = insertClass.get(cls.projectId, cls.packageName, cls.className, cls.classType);
            const classId = classRes.id;

            for (const m of cls.methods) {
                const methodRes = insertMethod.get(classId, m.methodName, m.paramCount || 0, m.line);
                const methodId = methodRes.id;
                methodIdMap.set(`${cls.packageName}.${cls.className}.${m.methodName}_${m.paramCount || 0}`, methodId);
                
                const fallbackKey = `${cls.className}.${m.methodName}_${m.paramCount || 0}`;
                if (!methodFallbackMap.has(fallbackKey)) {
                    methodFallbackMap.set(fallbackKey, methodId);
                }
                
                // DBIO lookup keys with hierarchy:
                // 1) Full: projectId.packageName.className.methodName
                dbioLookupMap.set(`${cls.projectId}.${cls.packageName}.${cls.className}.${m.methodName}`, methodId);
                // 2) Project-level: projectId.className.methodName
                dbioLookupMap.set(`${cls.projectId}.${cls.className}.${m.methodName}`, methodId);
                // 3) Global fallback (only if not set yet): className.methodName
                if (!dbioLookupMap.has(`${cls.className}.${m.methodName}`)) {
                    dbioLookupMap.set(`${cls.className}.${m.methodName}`, methodId);
                }

                for (const ep of m.endpoints) {
                    try {
                        const normUrl = normalizeUrl(ep.url);
                        insertEndpoint.run(methodId, ep.url, normUrl, ep.httpMethod);
                    } catch (e) { /* ignore duplicate endpoint */ }
                }
            }
        } catch (e) {
            console.warn(`[SQLite V2] Insert class failed for ${cls.className}:`, e.message);
        }
    }

    // 2. DBIO 쿼리 및 테이블 적재 (메서드와 연결)
    for (const dbio of dbios) {
        // 프레임워크 규칙: Java className == DBIO dbioFile
        const className = dbio.dbioFile;
        for (const q of dbio.queries) {
            let methodId = null;
            if (dbio.projectId && dbio.packageName) {
                methodId = dbioLookupMap.get(`${dbio.projectId}.${dbio.packageName}.${className}.${q.queryId}`);
            }
            if (!methodId && dbio.projectId) {
                methodId = dbioLookupMap.get(`${dbio.projectId}.${className}.${q.queryId}`);
            }
            if (!methodId) {
                methodId = dbioLookupMap.get(`${className}.${q.queryId}`);
            }

            if (methodId) {
                try {
                    const queryRes = insertQuery.get(methodId, q.queryId, q.queryType, dbio.dbioFile, q.line);
                    const queryId = queryRes.id;

                    for (const tbl of q.tables) {
                        try {
                            insertTable.run(queryId, tbl);
                        } catch (e) { /* ignore duplicate */ }
                    }
                } catch (e) {
                    console.warn(`[SQLite V2] Insert query failed for ${q.queryId}:`, e.message);
                }
            } else {
                // console.warn(`[SQLite V2] Warning: Unlinked DBIO query found -> ${className}.${q.queryId}`);
            }
        }
    }

    // 3. 메서드 간 호출 관계(Call Graph) 적재
    const callSet = new Set();
    for (const cls of classes) {
        for (const m of cls.methods) {
            const callerId = methodIdMap.get(`${cls.packageName}.${cls.className}.${m.methodName}_${m.paramCount || 0}`);
            if (!callerId) continue;

            for (const call of m.calls) {
                let calleeId = methodIdMap.get(`${call.targetPackage}.${call.targetClass}.${call.targetMethod}_${call.targetParamCount || 0}`);
                if (!calleeId) {
                    // 패키지 매칭 실패 시 클래스명 기반 폴백 (와일드카드 임포트 등 대응)
                    calleeId = methodFallbackMap.get(`${call.targetClass}.${call.targetMethod}_${call.targetParamCount || 0}`);
                }
                
                if (calleeId) {
                    const callKey = `${callerId}:${calleeId}`;
                    if (!callSet.has(callKey)) {
                        callSet.add(callKey);
                        try {
                            insertCall.run(callerId, calleeId);
                        } catch (e) {
                            // ignore duplicate relationships if any
                        }
                    }
                }
            }
        }
    }

    db.exec("COMMIT");
    console.log(`[SQLite V2] Successfully inserted ${classes.length} classes and ${dbios.length} DBIOs.`);
}
