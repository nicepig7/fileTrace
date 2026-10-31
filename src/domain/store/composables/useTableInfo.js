import { sqliteService } from '@extern/sqlite/sqliteService.js';

export function useTableInfo() {
  const getTableDetails = (table) => {
    if (!table) return null;
    
    try {
      const results = sqliteService.query(`
        SELECT id, desc_ko, desc_en, desc_vi, owner 
        FROM fd_table_info 
        WHERE id = $table
      `, { $table: table });
      
      if (results && results.length > 0) {
        return results[0];
      }
    } catch (e) {
      console.warn("[useTableInfo] Could not fetch table details from SQLite for:", table, e);
    }
    
    return null;
  };

  return {
    getTableDetails
  };
}
