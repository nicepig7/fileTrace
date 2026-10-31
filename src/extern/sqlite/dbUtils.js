import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function initializeDatabase(dbPath) {
    // 1. Remove old DB if exists
    if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
    }

    // 2. Ensure directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    // 3. Connect to SQLite (creates new file)
    const db = new Database(dbPath);

    // 4. Load schema and execute
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);

    console.log(`[SQLite] Database initialized at ${dbPath} with normalized schema.`);
    return db;
}
