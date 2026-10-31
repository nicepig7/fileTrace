import fs from 'fs/promises';
import { XMLParser } from 'fast-xml-parser';
import { DbioDTO, QueryDTO } from './DbioModels.js';
import path from 'path';

export async function parseDbioFile(filePath, projectId) {
    const content = await fs.readFile(filePath, "utf-8");
    
    // fast-xml-parser 설정 (속성 유지, 배열로 파싱하여 순서 보존 가능하나 단순화를 위해 객체 활용)
    const options = {
        ignoreAttributes: false,
        attributeNamePrefix: "@_"
    };
    const parser = new XMLParser(options);
    let jObj;
    try {
        jObj = parser.parse(content);
    } catch (e) {
        console.error("XML Parsing error:", e);
        return null;
    }

    // Root element(보통 mapper나 sqlMap) 내부 탐색
    const root = jObj.mapper || jObj.sqlMap || jObj;

    let packageName = '';
    const namespace = (root && root['@_namespace']) || '';
    if (namespace) {
        const parts = namespace.split('.');
        if (parts.length > 1) {
            packageName = parts.slice(0, -1).join('.');
        }
    }
    if (!packageName && filePath) {
        const normalized = filePath.replace(/\\/g, '/');
        const match = normalized.match(/(?:src\/main\/java\/|src\/)(.*)\/[^\/]+$/);
        if (match && match[1]) {
            packageName = match[1].replace(/\//g, '.');
        }
    }

    const fileName = path.basename(filePath, '.dbio'); // or .xml
    const dbioDTO = new DbioDTO(projectId, fileName, packageName);

    const queryTypes = ['select', 'insert', 'update', 'delete'];
    
    queryTypes.forEach(type => {
        if (root[type]) {
            const queries = Array.isArray(root[type]) ? root[type] : [root[type]];
            queries.forEach(q => {
                const queryId = q['@_id'];
                if (!queryId) return;
                
                let lineNum = 0;
                try {
                    const escapedId = queryId.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
                    const regex = new RegExp(`id\\s*=\\s*["']${escapedId}["']`);
                    const match = regex.exec(content);
                    if (match) {
                        const substring = content.substring(0, match.index);
                        lineNum = (substring.match(/\n/g) || []).length + 1;
                    }
                } catch (e) {
                    // Ignore and keep lineNum = 0
                }
                
                const queryDTO = new QueryDTO(queryId, type, lineNum);
                
                // 텍스트 내용에서 테이블 추출 로직 (SQL 파싱은 여전히 어렵기 때문에 정규식 활용)
                const innerSql = q['#text'] || '';
                if (innerSql) {
                    extractTablesFromSql(innerSql).forEach(tbl => queryDTO.addTable(tbl));
                }
                
                dbioDTO.addQuery(queryDTO);
            });
        }
    });

    return dbioDTO;
}

function extractTablesFromSql(sql) {
    const tables = new Set();
    const sqlUpper = sql.toUpperCase();
    
    // INTO, UPDATE, DELETE FROM 뒷부분 추출
    const singleTableRegex = /(?:INTO|UPDATE|MERGE\s+INTO|DELETE(?:\s+FROM)?)\s+([A-Z0-9_\.]+)/g;
    let match;
    while ((match = singleTableRegex.exec(sqlUpper)) !== null) {
        let tableName = match[1];
        if (tableName.includes('.')) tableName = tableName.split('.').pop();
        if (tableName !== "DUAL" && !["SET", "VALUES"].includes(tableName)) {
            tables.add(tableName);
        }
    }
    
    // FROM, JOIN 블록 처리
    const fromJoinRegex = /(?:FROM|JOIN)\s+([\s\S]*?)(?=(?:WHERE|ON|GROUP BY|ORDER BY|HAVING|LEFT\s+JOIN|RIGHT\s+JOIN|INNER\s+JOIN|OUTER\s+JOIN|JOIN|UNION|INTERSECT|MINUS|SELECT|$))/g;
    while ((match = fromJoinRegex.exec(sqlUpper)) !== null) {
        const block = match[1];
        const parts = block.split(',');
        for (const part of parts) {
            const trimmed = part.trim();
            const wordMatch = /^[A-Z0-9_\.]+/.exec(trimmed);
            if (wordMatch) {
                let tableName = wordMatch[0];
                if (tableName.includes('.')) tableName = tableName.split('.').pop();
                if (tableName !== "DUAL" && !["SELECT", "WHERE", "ON"].includes(tableName)) {
                    tables.add(tableName);
                }
            }
        }
    }
    
    return Array.from(tables);
}
