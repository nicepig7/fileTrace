-- 1. 클래스 (컴포넌트)
CREATE TABLE IF NOT EXISTS fd_class_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT,
    package_name TEXT,
    class_name TEXT NOT NULL,
    class_type TEXT
);

-- 2. 메서드 (실제 실행 단위 / 단일 노드)
CREATE TABLE IF NOT EXISTS fd_method_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL,
    method_name TEXT NOT NULL,
    param_count INTEGER DEFAULT 0,
    line INTEGER,
    FOREIGN KEY(class_id) REFERENCES fd_class_info(id) ON DELETE CASCADE
);

-- 3. 메서드 간 호출 관계 (Call Graph)
CREATE TABLE IF NOT EXISTS fd_method_calls (
    caller_id INTEGER NOT NULL,
    callee_id INTEGER NOT NULL,
    PRIMARY KEY (caller_id, callee_id),
    FOREIGN KEY(caller_id) REFERENCES fd_method_info(id) ON DELETE CASCADE,
    FOREIGN KEY(callee_id) REFERENCES fd_method_info(id) ON DELETE CASCADE
);

-- 4. [Root] API 엔드포인트 정보
CREATE TABLE IF NOT EXISTS fd_endpoint_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    method_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    normalized_url TEXT,
    http_method TEXT,
    FOREIGN KEY(method_id) REFERENCES fd_method_info(id) ON DELETE CASCADE
);

-- 5. [Leaf] DB 쿼리 메타데이터
CREATE TABLE IF NOT EXISTS fd_query_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    method_id INTEGER NOT NULL,
    query_name TEXT,
    query_type TEXT,
    dbio_file TEXT,
    line INTEGER,
    FOREIGN KEY(method_id) REFERENCES fd_method_info(id) ON DELETE CASCADE
);

-- 6. 쿼리 내부에서 접근하는 실제 테이블 목록 (1:N)
CREATE TABLE IF NOT EXISTS fd_query_tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_id INTEGER NOT NULL,
    table_id TEXT NOT NULL,
    FOREIGN KEY(query_id) REFERENCES fd_query_info(id) ON DELETE CASCADE
);

-- 7. 부가 정보 (테이블 및 MCI 메타데이터 유지)
CREATE TABLE IF NOT EXISTS fd_table_info (
    id TEXT PRIMARY KEY,
    owner TEXT,
    desc_ko TEXT,
    desc_en TEXT,
    desc_vi TEXT
);

CREATE TABLE IF NOT EXISTS fd_column_info (
    owner TEXT,
    table_name TEXT,
    column_id TEXT,
    data_type TEXT,
    length INTEGER,
    pk TEXT,
    nullable TEXT,
    desc_ko TEXT,
    desc_en TEXT,
    desc_vi TEXT,
    PRIMARY KEY (owner, table_name, column_id)
);

CREATE TABLE IF NOT EXISTS fd_mci_info (
    id TEXT PRIMARY KEY,
    asis_id TEXT,
    name_kr TEXT,
    name_en TEXT,
    name_vi TEXT,
    in_out TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_method_info_class_id ON fd_method_info(class_id);
CREATE INDEX IF NOT EXISTS idx_method_calls_caller ON fd_method_calls(caller_id);
CREATE INDEX IF NOT EXISTS idx_method_calls_callee ON fd_method_calls(callee_id);
CREATE INDEX IF NOT EXISTS idx_endpoint_info_url ON fd_endpoint_info(url);
CREATE INDEX IF NOT EXISTS idx_query_tables_table_id ON fd_query_tables(table_id);
CREATE INDEX IF NOT EXISTS idx_class_info_class_type ON fd_class_info(class_type);

-- System Views
CREATE VIEW IF NOT EXISTS seq AS SELECT * FROM sqlite_sequence;

-- 8. 화면(Screen/UI) 정보
CREATE TABLE IF NOT EXISTS fd_ui_screen_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT,
    screen_id TEXT NOT NULL,
    target_type TEXT,
    file_path TEXT,
    file_name TEXT,
    file_ext TEXT
);

-- 9. UI에서 호출하는 API 정보
CREATE TABLE IF NOT EXISTS fd_ui_api_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT,
    api_url TEXT NOT NULL,
    http_method TEXT DEFAULT 'POST',
    file_path TEXT,
    class_name TEXT,
    method_name TEXT,
    target_type TEXT,
    file_ext TEXT
);

-- 10. 화면-API 매핑 (N:M 매핑)
CREATE TABLE IF NOT EXISTS fd_ui_screen_api_map (
    screen_id INTEGER NOT NULL,
    api_id INTEGER NOT NULL,
    PRIMARY KEY (screen_id, api_id),
    FOREIGN KEY(screen_id) REFERENCES fd_ui_screen_info(id) ON DELETE CASCADE,
    FOREIGN KEY(api_id) REFERENCES fd_ui_api_info(id) ON DELETE CASCADE
);
