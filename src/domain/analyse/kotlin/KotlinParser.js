import { Parser, Language } from 'web-tree-sitter';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wasmPath = path.resolve(__dirname, 'tree-sitter-kotlin.wasm');

let parser = null;

export async function initParser() {
    if (parser) return parser;
    await Parser.init();
    parser = new Parser();
    const Kotlin = await Language.load(wasmPath);
    parser.setLanguage(Kotlin);
    return parser;
}

export function parseKotlinCode(code) {
    if (!parser) throw new Error("Parser not initialized. Call initParser() first.");
    return parser.parse(code);
}

export function extractPackageName(tree) {
    const packageHeader = tree.rootNode.children.find(c => c.type === 'package_header');
    if (packageHeader) {
        const identifier = packageHeader.children.find(c => c.type === 'identifier');
        if (identifier) return identifier.text;
    }
    return '';
}

// 1. Screen ID 추출 (WScreenInfo, WScreenInfoBottomSheet, WScreenInfoPopup 사용 부분 식별)
// 기존 정규식: screenId = WScreenInfo.SOME_ID 또는 getScreenId() = WScreenInfo.SOME_ID
export function extractScreenInfo(tree) {
    const screenIds = [];
    
    // 단순 순회를 위한 유틸
    function traverse(node) {
        // Kotlin AST에서 멤버 참조: WScreenInfo.SOMETHING
        // WScreenInfo, WScreenInfoBottomSheet, WScreenInfoPopup, MOTPScreenType, VerifyScreenType 등
        if (node.type === 'navigation_expression') { // Kotlin tree-sitter에서 object.property는 보통 navigation_expression
            const text = node.text;
            if (text.startsWith('WScreenInfo.') || 
                text.startsWith('WScreenInfoBottomSheet.') || 
                text.startsWith('WScreenInfoPopup.') ||
                text.startsWith('MOTPScreenType.') ||
                text.startsWith('VerifyScreenType.')) {
                
                const enumMatch = text.match(/(?:WScreenInfo|WScreenInfoBottomSheet|WScreenInfoPopup|MOTPScreenType|VerifyScreenType)\.([A-Z0-9_]+)/);
                if (enumMatch) {
                    screenIds.push(enumMatch[1]);
                }
            }
        }
        for (let i = 0; i < node.childCount; i++) {
            traverse(node.child(i));
        }
    }
    
    traverse(tree.rootNode);
    return Array.from(new Set(screenIds));
}

// 2. 클래스 의존성 주입 추출 (생성자, 필드, by viewModels)
export function extractClassDependencies(tree) {
    const dependencies = {}; // instanceName -> className
    
    function traverse(node) {
        if (node.type === 'property_declaration' || node.type === 'class_parameter') {
            let varName = null;
            let typeName = null;

            // AST 기반 추출 시도 (tree-sitter-kotlin 버전에 따라 구조가 다를 수 있으므로 정규식 폴백 유지)
            const text = node.text;
            if (node.type === 'property_declaration') {
                const vmRegex = /(?:val|var)\s+([a-zA-Z0-9_]+)\s*:\s*([A-Za-z0-9_]+(?:ViewModel|Repository|UseCase|Api|Service))\b/;
                const vmMatch = text.match(vmRegex);
                if (vmMatch) {
                    varName = vmMatch[1];
                    typeName = vmMatch[2];
                } else {
                    const injectMatch = text.match(/@Inject\s+lateinit\s+var\s+([a-zA-Z0-9_]+)\s*:\s*([A-Za-z0-9_]+)/);
                    if (injectMatch) {
                        varName = injectMatch[1];
                        typeName = injectMatch[2];
                    }
                }
            } else if (node.type === 'class_parameter') {
                const paramRegex = /(?:val|var)\s+([a-zA-Z0-9_]+)\s*:\s*([A-Za-z0-9_]+)/;
                const paramMatch = text.match(paramRegex);
                if (paramMatch) {
                    varName = paramMatch[1];
                    typeName = paramMatch[2];
                }
            }

            if (varName && typeName) {
                dependencies[varName] = typeName;
            }
        }
        
        for (let i = 0; i < node.childCount; i++) {
            traverse(node.child(i));
        }
    }
    traverse(tree.rootNode);
    return dependencies;
}

// 3. 컴포넌트 호출 추출 (특정 인스턴스의 메소드를 호출하는 부분)
export function extractMethodCalls(tree, dependencies, callerClass) {
    const calls = [];
    const depEntries = Object.entries(dependencies);
    if (depEntries.length === 0) return calls; // 의존성이 없으면 탐색 불필요

    function traverse(node, currentFunction) {
        let nextFunction = currentFunction;
        
        if (node.type === 'function_declaration') {
            const nameNode = node.childForFieldName('name') || node.children.find(c => c.type === 'simple_identifier');
            if (nameNode) {
                nextFunction = nameNode.text;
            }
        }
        
        // navigation_expression (e.g., instance.method() or instance?.method())
        if (node.type === 'navigation_expression') {
            const text = node.text;
            for (const [instanceName, className] of depEntries) {
                if (text.startsWith(instanceName + '.') || text.startsWith(instanceName + '?.')) {
                    const suffixMatch = text.match(new RegExp(`^${instanceName}\\??\\.([A-Za-z0-9_]+)`));
                    if (suffixMatch) {
                        calls.push({
                            callerClass: callerClass,
                            callerMethod: currentFunction || 'unknown',
                            calledClass: className,
                            calledMethod: suffixMatch[1]
                        });
                        break; // 매칭되었으면 루프 종료
                    }
                }
            }
        }
        
        for (let i = 0; i < node.childCount; i++) {
            traverse(node.child(i), nextFunction);
        }
    }
    
    traverse(tree.rootNode, null);
    
    // 중복 제거
    const unique = new Set(calls.map(c => JSON.stringify(c)));
    return Array.from(unique).map(s => JSON.parse(s));
}

// 4. API Endpoints 추출 (@GET, @POST)
export function extractRestApiDefinitions(tree, serviceClassName) {
    const apis = [];
    
    function traverse(node) {
        if (node.type === 'function_declaration') {
            const funcText = node.text;
            const apiRegex = /@(POST|GET|PUT|DELETE)\("([^"]+)"\)\s*(?:suspend\s+)?fun\s+([a-zA-Z0-9_]+)/;
            const match = funcText.match(apiRegex);
            if (match) {
                let url = match[2];
                if (url.startsWith('api/')) {
                    url = url.substring(4);
                } else if (url.startsWith('/api/')) {
                    url = url.substring(5);
                }
                
                apis.push({
                    serviceClass: serviceClassName,
                    serviceMethod: match[3],
                    httpMethod: match[1],
                    url: url
                });
            }
        }
        
        for (let i = 0; i < node.childCount; i++) {
            traverse(node.child(i));
        }
    }
    
    traverse(tree.rootNode);
    return apis;
}
