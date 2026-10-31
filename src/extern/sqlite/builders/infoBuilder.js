export function buildInfoData(db, mciInfoMap, tableInfoMap, columnInfoMap) {
    console.log(`[SQLite] Building Info Data (MCI & Table)...`);
    
    // 1. MCI Info
    const insertMciInfo = db.prepare(`
        INSERT OR REPLACE INTO fd_mci_info (id, asis_id, name_kr, name_en, name_vi, in_out)
        VALUES (@id, @asis_id, @name_kr, @name_en, @name_vi, @in_out)
    `);

    db.transaction(() => {
        if (mciInfoMap) {
            const isArray = Array.isArray(mciInfoMap);
            const entries = isArray ? mciInfoMap : Object.entries(mciInfoMap);

            for (const item of entries) {
                if (isArray) {
                    insertMciInfo.run({
                        id: item.id || item.tobeId,
                        asis_id: item.asisId || '',
                        name_kr: item.nameKr || '',
                        name_en: item.nameEn || '',
                        name_vi: item.nameVi || '',
                        in_out: item.inOut || ''
                    });
                } else {
                    const [mciId, info] = item;
                    insertMciInfo.run({
                        id: mciId,
                        asis_id: info.asisId || '',
                        name_kr: info.nameKr || '',
                        name_en: info.nameEn || '',
                        name_vi: info.nameVi || '',
                        in_out: info.inOut || ''
                    });
                }
            }
        }
    })();

    // 2. Table Info
    const insertTableInfo = db.prepare(`
        INSERT OR REPLACE INTO fd_table_info (id, owner, desc_ko, desc_en, desc_vi)
        VALUES (@id, @owner, @desc_ko, @desc_en, @desc_vi)
    `);

    db.transaction(() => {
        if (tableInfoMap) {
            // Support both old Object Map and new Array format
            const isArray = Array.isArray(tableInfoMap);
            const entries = isArray ? tableInfoMap : Object.entries(tableInfoMap);

            for (const item of entries) {
                if (isArray) {
                    insertTableInfo.run({
                        id: item.tableName,
                        owner: item.owner || '',
                        desc_ko: item.commentKo || '',
                        desc_en: item.commentEn || '',
                        desc_vi: item.commentVi || ''
                    });
                } else {
                    const [tableId, info] = item;
                    insertTableInfo.run({
                        id: tableId,
                        owner: info.owner || '',
                        desc_ko: info.desc_ko || '',
                        desc_en: info.desc_en || '',
                        desc_vi: info.desc_vi || ''
                    });
                }
            }
        }
    })();

    // 3. Column Info
    const insertColumnInfo = db.prepare(`
        INSERT OR REPLACE INTO fd_column_info (owner, table_name, column_id, data_type, length, pk, nullable, desc_ko, desc_en, desc_vi)
        VALUES (@owner, @table_name, @column_id, @data_type, @length, @pk, @nullable, @desc_ko, @desc_en, @desc_vi)
    `);

    db.transaction(() => {
        if (Array.isArray(columnInfoMap)) {
            for (const col of columnInfoMap) {
                insertColumnInfo.run({
                    owner: col.owner || '',
                    table_name: col.tableName || '',
                    column_id: col.columnId || '',
                    data_type: col.dataType || '',
                    length: col.length || 0,
                    pk: col.pk || 'N',
                    nullable: col.nullable || 'Y',
                    desc_ko: col.commentKo || '',
                    desc_en: col.commentEn || '',
                    desc_vi: col.commentVi || ''
                });
            }
        }
    })();
}
