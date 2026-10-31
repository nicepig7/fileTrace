import fs from 'fs';
import path from 'path';
import { CONFIG } from '../../../common/config/config.js';
import { initParser, parseKotlinCode, extractPackageName, extractScreenInfo, extractClassDependencies, extractMethodCalls, extractRestApiDefinitions } from './KotlinParser.js';

export function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

export async function analyzeKotlinFiles(projectPath, fileMapOutPath) {
    await initParser();
    
    const results = {
        screenToEnums: [],
        enumToUis: [],
        backgroundClasses: [],
        methodCalls: [],
        endpoints: []
    };

    // 1. Screen Enum 파싱 (ScreenID가 선언된 파일 탐색)
    const screenSubpath = CONFIG.ANALYSIS_CONFIG?.KOTLIN_SCREEN_SUBPATH || 'common/src/main/java';
    const screenDir = path.join(projectPath, screenSubpath);
    walkDir(screenDir, (filePath) => {
        if (!filePath.endsWith('.kt')) return;
        const content = fs.readFileSync(filePath, 'utf8');
        const regex = /([A-Z0-9_]+)\s*\([^)]*screenId\s*=\s*"([^"]+)"[^)]*\)/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            const enumName = match[1];
            const ids = match[2].split(',').map(id => id.trim()).filter(id => id !== "");
            ids.forEach(id => {
                results.screenToEnums.push({ screenId: id, enumName: enumName });
            });
        }
    });

    // 2. 전체 Kotlin 소스 AST 파싱 및 구조 추출
    walkDir(projectPath, (filePath) => {
        if (!filePath.endsWith('.kt')) return;
        
        const fileName = path.basename(filePath, '.kt');
        if (fileName.toLowerCase().includes('webview') || fileName.toLowerCase().includes('browser')) return;
        
        const content = fs.readFileSync(filePath, 'utf8');
        const ast = parseKotlinCode(content);
        
        const pkgName = extractPackageName(ast);
        const fullClassName = pkgName ? `${pkgName}.${fileName}` : fileName;
        
        // 1) UI 화면 확인 (screenId 참조 여부)
        const usedEnums = extractScreenInfo(ast);
        if (usedEnums.length > 0) {
            usedEnums.forEach(enumName => {
                results.enumToUis.push({ enumName: enumName, uiClass: fullClassName, filePath: filePath });
            });
        }

        // 2) 백그라운드 소비처 식별 (엔트리 포인트)
        // API 호출의 시작점이 될 수 있는 Worker, Receiver, Application 클래스 등 수집
        if (fileName.endsWith('Worker') || fileName.endsWith('Receiver') || fileName.endsWith('App') || fileName.endsWith('Application')) {
            results.backgroundClasses.push({ className: fullClassName, filePath: filePath });
        }

        // 3) 의존성 주입 추출 및 메서드 호출(Call Graph) 추출
        const dependencies = extractClassDependencies(ast);
        const classCalls = extractMethodCalls(ast, dependencies, fullClassName);
        if (classCalls.length > 0) {
            results.methodCalls.push(...classCalls);
        }

        // 4) API 선언부 (Service, Api)
        if (fileName.endsWith('Service') || fileName.endsWith('Api')) {
            const apis = extractRestApiDefinitions(ast, fullClassName);
            if (apis.length > 0) {
                apis.forEach(api => api.filePath = filePath);
                results.endpoints.push(...apis);
            }
        }
    });

    // 중복 제거 및 정리
    for (const key of Object.keys(results)) {
        if (key === 'backgroundClasses') {
            results[key] = Array.from(new Set(results[key]));
        } else {
            const uniqueSet = new Set(results[key].map(item => JSON.stringify(item)));
            results[key] = Array.from(uniqueSet).map(str => JSON.parse(str));
        }
    }

    if (fileMapOutPath) {
        fs.writeFileSync(fileMapOutPath, JSON.stringify(results, null, 2), 'utf-8');
    }
    
    return results;
}
