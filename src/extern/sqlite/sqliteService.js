import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

let dbInstance = null;

export const sqliteService = {
  async init() {
    if (dbInstance) return dbInstance;
    
    // WebAssembly configuration using Vite asset import
    const SQL = await initSqlJs({
      locateFile: () => wasmUrl
    });

    const dbUrl = `${import.meta.env.BASE_URL}data.sqlite?t=${Date.now()}`;
    const response = await fetch(dbUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch SQLite database from "${dbUrl}": ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();

    if (buffer.byteLength < 16) {
      throw new Error(`Invalid database file size (${buffer.byteLength} bytes). Database may be empty or corrupted.`);
    }

    const header = new TextDecoder().decode(buffer.slice(0, 15));
    if (header !== 'SQLite format 3') {
      const preview = new TextDecoder().decode(buffer.slice(0, 200));
      throw new Error(`Fetched file is not a valid SQLite database! Content preview: ${preview}`);
    }
    
    dbInstance = new SQL.Database(new Uint8Array(buffer));
    console.log('[SQLite Service] Database loaded successfully.');
    return dbInstance;
  },

  query(sql, params = {}) {
    if (!dbInstance) throw new Error('Database not initialized');
    
    try {
      const stmt = dbInstance.prepare(sql);
      stmt.bind(params);
      
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      
      stmt.free();
      return results;
    } catch (err) {
      console.error('[SQLite Service] Query Error:', err);
      throw err;
    }
  },

  getTables() {
    return this.query(`
      SELECT name 
      FROM sqlite_master 
      WHERE (type='table' OR type='view') 
        AND name != 'sqlite_sequence'
      ORDER BY 
        CASE WHEN name='seq' THEN 1 ELSE 0 END ASC, 
        name ASC
    `);
  }
};
