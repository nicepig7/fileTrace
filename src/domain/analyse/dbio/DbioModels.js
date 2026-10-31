/**
 * 통합 그래프 스키마(SQLite)에 맞춘 DTO 모델 정의 (DB Node)
 */

export class DbioDTO {
  constructor(projectId, dbioFile, packageName = '') {
    this.projectId = projectId;
    this.dbioFile = dbioFile; // 파일명이 곧 className에 해당(Framework 규칙)
    this.packageName = packageName;
    this.queries = []; // Array of QueryDTO
  }

  addQuery(query) {
    this.queries.push(query);
  }
}

export class QueryDTO {
  constructor(queryId, queryType, line) {
    this.queryId = queryId; // 메서드명(method_name)에 해당
    this.queryType = queryType; // e.g., 'select', 'insert', 'update', 'delete'
    this.line = line;
    this.tables = []; // Array of String (table names)
  }

  addTable(tableName) {
    this.tables.push(tableName);
  }
}
