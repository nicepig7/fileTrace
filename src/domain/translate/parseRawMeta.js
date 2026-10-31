import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { TranslateManager } from './translateManager.js';

const TABLE_RAW_DIR = path.join(process.cwd(), 'src/extern/raw/table');
const MCI_RAW_DIR = path.join(process.cwd(), 'src/extern/raw/mci');

function findLatestFile(dir, prefix) {
    if (!fs.existsSync(dir)) return null;
    const files = fs.readdirSync(dir);
    const matchedFiles = files.filter(f => f.startsWith(prefix) && f.endsWith('.txt'));
    if (matchedFiles.length === 0) return null;

    // Sort descending by name (includes date, e.g. table_2026-09-26.txt or IFList_2026-08-25.txt)
    matchedFiles.sort((a, b) => b.localeCompare(a));
    return path.join(dir, matchedFiles[0]);
}

async function parseTableFile(filePath, translator) {
    console.log(`[ParseMeta] Parsing table file: ${path.basename(filePath)}`);
    const results = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let isHeader = true;
    for await (const line of rl) {
        if (isHeader) { isHeader = false; continue; }
        const [owner, tableName, comments] = line.split('\t');
        if (!tableName) continue;

        const trans = translator.getTranslatedObject(comments);
        results.push({
            owner: owner?.trim(),
            tableName: tableName?.trim(),
            commentKo: trans.ko,
            commentEn: trans.en,
            commentVi: trans.vi
        });
    }
    return results;
}

async function parseColumnFile(filePath, translator) {
    console.log(`[ParseMeta] Parsing column file: ${path.basename(filePath)}`);
    const results = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let isHeader = true;
    for await (const line of rl) {
        if (isHeader) { isHeader = false; continue; }
        const [owner, tableName, columnId, columnName, type, length, scale, pk, nullable] = line.split('\t');
        if (!tableName || !columnId) continue;

        const trans = translator.getTranslatedObject(columnName);
        results.push({
            owner: owner?.trim(),
            tableName: tableName?.trim(),
            columnId: columnId?.trim(),
            dataType: type?.trim(),
            length: length ? parseInt(length, 10) : null,
            pk: pk?.trim() === 'Y' ? 'Y' : 'N',
            nullable: nullable?.trim() === 'Y' ? 'Y' : 'N',
            commentKo: trans.ko,
            commentEn: trans.en,
            commentVi: trans.vi
        });
    }
    return results;
}

async function parseMciFile(filePath, translator) {
    console.log(`[ParseMeta] Parsing MCI file: ${path.basename(filePath)}`);
    const results = {};
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let isHeader = true;
    for await (const line of rl) {
        if (isHeader) { isHeader = false; continue; }
        const [tobeId, actionItemNo, asisId, nameKr, nameEn, inOut] = line.split('\t');
        if (!tobeId || !tobeId.trim()) continue;

        const cleanTobeId = tobeId.trim();
        const cleanAsisId = asisId?.trim() || '';
        const cleanNameKr = nameKr?.trim() || '';
        const cleanNameEn = nameEn?.trim() || '';
        const cleanInOut = inOut?.trim() || '';

        // Query translation for both Korean and English names
        const transKr = cleanNameKr ? translator.getTranslatedObject(cleanNameKr) : { ko: '', en: '', vi: '' };
        const transEn = cleanNameEn ? translator.getTranslatedObject(cleanNameEn) : { ko: '', en: '', vi: '' };

        results[cleanTobeId] = {
            asisId: cleanAsisId,
            nameKr: transKr.ko || cleanNameKr || transEn.ko || '',
            nameEn: transEn.en || cleanNameEn || transKr.en || '',
            nameVi: transKr.vi || transEn.vi || '',
            inOut: cleanInOut
        };
    }
    return results;
}

export async function parseRawMetaAndGenerateJson() {
    console.log(`\n[ParseMeta] 🚀 Starting Raw Meta Parsing & Translation Check...`);
    
    const tableFile = findLatestFile(TABLE_RAW_DIR, 'table_');
    const columnFile = findLatestFile(TABLE_RAW_DIR, 'column_') || findLatestFile(TABLE_RAW_DIR, 'coluumn_'); // Fallback for typo
    const mciFile = findLatestFile(MCI_RAW_DIR, 'IFList_');

    if (!tableFile && !columnFile && !mciFile) {
        console.log(`[ParseMeta] No raw meta text files found (table_, column_, IFList_). Skipping.`);
        return;
    }

    const translator = new TranslateManager();
    
    let tableData = [];
    if (tableFile) {
        tableData = await parseTableFile(tableFile, translator);
    }

    let columnData = [];
    if (columnFile) {
        columnData = await parseColumnFile(columnFile, translator);
    }

    let mciData = null;
    if (mciFile) {
        mciData = await parseMciFile(mciFile, translator);
    }

    translator.saveCache();

    // Check if we have missing translations
    if (translator.hasMissingTranslations()) {
        console.warn(`\n[ParseMeta] ⚠️ Translation incomplete! Some keywords missed the cache.`);
        console.warn(`[ParseMeta] They have been added to 'src/extern/raw/translation/todo_translate.json'. Continuing build... \n`);
    }

    // Generate JSON files
    if (tableFile && tableData.length > 0) {
        fs.writeFileSync(path.join(TABLE_RAW_DIR, 'tableInfo.json'), JSON.stringify(tableData, null, 2), 'utf-8');
        console.log(`[ParseMeta] Generated tableInfo.json (${tableData.length} records)`);
    }

    if (columnFile && columnData.length > 0) {
        fs.writeFileSync(path.join(TABLE_RAW_DIR, 'columnInfo.json'), JSON.stringify(columnData, null, 2), 'utf-8');
        console.log(`[ParseMeta] Generated columnInfo.json (${columnData.length} records)`);
    }

    if (mciFile && mciData && Object.keys(mciData).length > 0) {
        fs.writeFileSync(path.join(MCI_RAW_DIR, 'mciInfo.json'), JSON.stringify(mciData, null, 2), 'utf-8');
        console.log(`[ParseMeta] Generated mciInfo.json (${Object.keys(mciData).length} records)`);
    }

    console.log(`[ParseMeta] Meta parsing completed.\n`);
}

