import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), 'src/extern/raw/translation/translation_cache.json');
const TABLE_FILE = path.join(process.cwd(), 'src/extern/raw/table/tableInfo.json');
const MCI_FILE = path.join(process.cwd(), 'src/extern/raw/mci/mciInfo.json');

export function seedCache() {
    console.log('[Seed] Starting Cache Seeding...');
    let cacheMap = new Map(); // key -> { original, ko, en, vi }

    if (fs.existsSync(CACHE_FILE)) {
        try {
            const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
            const data = JSON.parse(raw);
            if (Array.isArray(data)) {
                for (const item of data) {
                    if (item.original) cacheMap.set(item.original.trim(), item);
                    if (item.ko) cacheMap.set(item.ko.trim(), item);
                    if (item.en) cacheMap.set(item.en.trim(), item);
                    if (item.vi) cacheMap.set(item.vi.trim(), item);
                }
            } else if (typeof data === 'object') {
                for (const [k, v] of Object.entries(data)) {
                    cacheMap.set(k.trim(), v);
                }
            }
        } catch (e) {
            console.error('[Seed] Error reading cache file:', e);
        }
    }

    let addCount = 0;

    function addEntry(ko, en, vi) {
        const cleanKo = ko?.trim() || '';
        const cleanEn = en?.trim() || '';
        const cleanVi = vi?.trim() || '';
        if (!cleanKo && !cleanEn && !cleanVi) return;

        // If neither ko nor en is in cacheMap, create new entry
        const existingKo = cleanKo ? cacheMap.get(cleanKo) : null;
        const existingEn = cleanEn ? cacheMap.get(cleanEn) : null;

        if (!existingKo && !existingEn) {
            const entry = {
                original: cleanKo || cleanEn,
                ko: cleanKo,
                en: cleanEn,
                vi: cleanVi
            };
            if (cleanKo) cacheMap.set(cleanKo, entry);
            if (cleanEn) cacheMap.set(cleanEn, entry);
            if (cleanVi) cacheMap.set(cleanVi, entry);
            addCount++;
        } else {
            // Update existing or add separate entry if definitions differ
            const target = existingKo || existingEn;
            let updated = false;
            if (!target.ko && cleanKo) { target.ko = cleanKo; updated = true; }
            if (!target.en && cleanEn) { target.en = cleanEn; updated = true; }
            if (!target.vi && cleanVi) { target.vi = cleanVi; updated = true; }

            // Ensure key mappings exist in cacheMap
            if (cleanKo && !cacheMap.has(cleanKo)) {
                const entry = { original: cleanKo, ko: cleanKo, en: cleanEn || target.en, vi: cleanVi || target.vi };
                cacheMap.set(cleanKo, entry);
                updated = true;
            }
            if (cleanEn && !cacheMap.has(cleanEn)) {
                const entry = { original: cleanEn, ko: cleanKo || target.ko, en: cleanEn, vi: cleanVi || target.vi };
                cacheMap.set(cleanEn, entry);
                updated = true;
            }
            if (updated) addCount++;
        }
    }

    // 1. Load tableInfo.json
    if (fs.existsSync(TABLE_FILE)) {
        try {
            const tableInfo = JSON.parse(fs.readFileSync(TABLE_FILE, 'utf-8'));
            if (Array.isArray(tableInfo)) {
                for (const t of tableInfo) {
                    addEntry(t.commentKo, t.commentEn, t.commentVi);
                }
            } else {
                for (const key of Object.keys(tableInfo)) {
                    const info = tableInfo[key];
                    addEntry(info.desc_ko, info.desc_en, info.desc_vi);
                }
            }
        } catch (e) {
            console.error('[Seed] Error reading tableInfo.json:', e);
        }
    }

    // 2. Load mciInfo.json
    if (fs.existsSync(MCI_FILE)) {
        try {
            const mciInfo = JSON.parse(fs.readFileSync(MCI_FILE, 'utf-8'));
            if (Array.isArray(mciInfo)) {
                for (const info of mciInfo) {
                    addEntry(info.nameKr, info.nameEn, info.nameVi);
                }
            } else {
                for (const key of Object.keys(mciInfo)) {
                    const info = mciInfo[key];
                    addEntry(info.nameKr, info.nameEn, info.nameVi);
                }
            }
        } catch (e) {
            console.error('[Seed] Error reading mciInfo.json:', e);
        }
    }

    const uniqueItems = Array.from(new Set(cacheMap.values()));
    fs.writeFileSync(CACHE_FILE, JSON.stringify(uniqueItems, null, 2), 'utf-8');
    console.log(`[Seed] Seeded/updated ${addCount} entries into cache.`);
    console.log(`[Seed] Total unique cache entries: ${uniqueItems.length}`);
}

// Run directly if executed as main module
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))) {
    seedCache();
}

