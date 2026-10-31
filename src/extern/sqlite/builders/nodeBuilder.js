export function getOrCreateClass(db, { project_id = '', package_name = '', class_name, class_type = null }) {
    if (!class_name) return null;
    if (!class_type) class_type = 'JAVA_ETC';

    // FQDN 처리 (패키지와 클래스명 분리)
    if (class_name.includes('.') && !class_name.endsWith('.dbio')) {
        const parts = class_name.split('.');
        class_name = parts.pop();
        if (!package_name) package_name = parts.join('.');
    } else if (class_name.includes('/')) {
        const parts = class_name.split('/');
        class_name = parts.pop();
        if (!package_name) package_name = parts.join('/');
    }

    let row = db.prepare('SELECT id, class_type, project_id, package_name FROM fd_class_info WHERE class_name = ?').get(class_name);
    if (!row) {
        const result = db.prepare(
            'INSERT INTO fd_class_info (project_id, package_name, class_name, class_type) VALUES (?, ?, ?, ?)'
        ).run(project_id, package_name, class_name, class_type);
        return result.lastInsertRowid;
    }
    
    // 누락된 정보 업데이트
    let updates = [];
    let params = [];
    if (class_type && !row.class_type) {
        updates.push('class_type = ?'); params.push(class_type);
    }
    if (package_name && !row.package_name) {
        updates.push('package_name = ?'); params.push(package_name);
    }
    if (project_id && !row.project_id) {
        updates.push('project_id = ?'); params.push(project_id);
    }
    
    if (updates.length > 0) {
        params.push(row.id);
        db.prepare(`UPDATE fd_class_info SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    return row.id;
}

export function getOrCreateMethod(db, { class_id, method_name, line = null }) {
    if (!class_id || !method_name) return null;

    let row = db.prepare('SELECT id, line FROM fd_method_info WHERE class_id = ? AND method_name = ?').get(class_id, method_name);
    if (!row) {
        const result = db.prepare(
            'INSERT INTO fd_method_info (class_id, method_name, line) VALUES (?, ?, ?)'
        ).run(class_id, method_name, line);
        return result.lastInsertRowid;
    }

    // Update line if it was previously null
    if (line !== null && row.line === null) {
        db.prepare('UPDATE fd_method_info SET line = ? WHERE id = ?').run(line, row.id);
    }
    
    return row.id;
}

export function addMethodCall(db, caller_id, callee_id) {
    if (!caller_id || !callee_id) return;
    
    db.prepare('INSERT OR IGNORE INTO fd_method_calls (caller_id, callee_id) VALUES (?, ?)').run(caller_id, callee_id);
}
