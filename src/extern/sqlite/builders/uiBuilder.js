import { normalizeUrl } from './urlUtils.js';

export function buildUiData(db, allUiMappings) {
    if (!allUiMappings || (!allUiMappings.screens.length && !allUiMappings.apis.length)) return;

    const insertScreenInfo = db.prepare(`
        INSERT OR IGNORE INTO fd_ui_screen_info (project_id, screen_id, target_type, file_path, file_name, file_ext)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertApiInfo = db.prepare(`
        INSERT OR IGNORE INTO fd_ui_api_info (project_id, api_url, http_method, file_path, class_name, method_name, target_type, file_ext)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const getScreenId = db.prepare(`SELECT id FROM fd_ui_screen_info WHERE screen_id = ?`);
    const getApiId = db.prepare(`SELECT id FROM fd_ui_api_info WHERE api_url = ?`);

    const insertMapping = db.prepare(`
        INSERT OR IGNORE INTO fd_ui_screen_api_map (screen_id, api_id)
        VALUES (?, ?)
    `);

    const insertMany = db.transaction((data) => {
        // 1. Insert screens
        for (const s of data.screens) {
            insertScreenInfo.run(s.projectId || null, s.screenId, s.targetType || null, s.filePath || null, s.fileName || null, s.fileExt || null);
        }

        // 2. Insert APIs
        for (const a of data.apis) {
            const normUrl = normalizeUrl(a.url);
            insertApiInfo.run(a.projectId || null, normUrl, a.httpMethod || 'POST', a.filePath || null, a.className || null, a.methodName || null, a.targetType || null, a.fileExt || null);
        }

        // 3. Insert mappings
        for (const m of data.mappings) {
            const screenRow = getScreenId.get(m.screenId);
            const apiRows = getApiId.all(normalizeUrl(m.apiUrl));

            if (screenRow && apiRows && apiRows.length > 0) {
                for (const apiRow of apiRows) {
                    insertMapping.run(screenRow.id, apiRow.id);
                }
            } else if (m.apiUrl.includes('findSplitBills')) {
                console.log('Failed mapping:', m, screenRow, apiRows, m.apiUrl);
            }
        }
    });

    try {
        insertMany(allUiMappings);
        console.log(`[SQLite V2] Successfully inserted ${allUiMappings.screens.length} Screens, ${allUiMappings.apis.length} APIs, and ${allUiMappings.mappings.length} mappings.`);
    } catch (error) {
        console.error(`[SQLite V2] Error inserting UI Screen data:`, error.message);
    }
}
