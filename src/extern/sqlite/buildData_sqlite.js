import path from 'path';
import fs from 'fs';
import { initializeDatabase } from './dbUtils.js';
import { buildInfoData } from './builders/infoBuilder.js';
import { buildBackendV2Data } from './builders/backendBuilder.js';
import { buildUiData } from './builders/uiBuilder.js';

function loadJsonSafe(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(raw);
        }
    } catch (err) {
        console.warn(`[SQLite] Failed to load JSON: ${filePath}`, err.message);
    }
    return null;
}

/**
 * Builds the SQLite database from the generated report data.
 * @param {string} outputDbPath - The output path for the SQLite database.
 * @param {Object} results - The results object containing all parsed reports in memory.
 */
export async function buildSqliteDatabase(outputDbPath, results) {
    console.log(`\n[SQLite Builder] 🚀 Starting DB Generation...`);
    const startTime = Date.now();
    
    // 1. Initialize DB and schema
    const db = initializeDatabase(outputDbPath);

    try {
        // Load Raw Info JSONs
        const mciInfoPath = path.join(process.cwd(), 'src', 'extern', 'raw', 'mci', 'mciInfo.json');
        const tableInfoPath = path.join(process.cwd(), 'src', 'extern', 'raw', 'table', 'tableInfo.json');
        const columnInfoPath = path.join(process.cwd(), 'src', 'extern', 'raw', 'table', 'columnInfo.json');
        const mciInfoMap = loadJsonSafe(mciInfoPath);
        const tableInfoMap = loadJsonSafe(tableInfoPath);
        const columnInfoMap = loadJsonSafe(columnInfoPath);

        // 2. Insert data using specialized builders
        buildInfoData(db, mciInfoMap, tableInfoMap, columnInfoMap);

        // 신규 V2 백엔드 파서 데이터 삽입
        if (results.allClassesV2 && results.allDbiosV2) {
            buildBackendV2Data(db, results.allClassesV2, results.allDbiosV2);
        }

        // UI data (Android & Vue)
        if (results.allUi) {
            buildUiData(db, results.allUi);
        }
    } catch (err) {
        console.error(`[SQLite Builder] Error during DB insertion:`, err);
    } finally {
        // 3. Close connection
        db.close();
    }
    
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[SQLite Builder] DB generated successfully at: ${outputDbPath}`);
    console.log(`[SQLite Builder] Task completed in ${elapsedSec}s\n`);
}
