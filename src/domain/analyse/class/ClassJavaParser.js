import fs from 'fs/promises';
import { parse } from 'java-parser';
import { ClassDTO, MethodDTO } from './ClassModels.js';
import { CONFIG } from '../../../common/config/config.js';
import path from 'path';

/**
 * 재귀적으로 AST 트리를 순회하며 특정 이름의 노드나 토큰을 반환합니다.
 */
function findNodes(node, name, results = []) {
    if (!node) return results;

    const nodeName = node.name || (node.tokenType && node.tokenType.name);
    if (nodeName === name) {
        results.push(node);
    }

    if (node.children) {
        for (const key in node.children) {
            const childArray = node.children[key];
            if (Array.isArray(childArray)) {
                childArray.forEach(child => findNodes(child, name, results));
            }
        }
    }
    return results;
}

/**
 * 한 번의 순회로 필요한 모든 노드를 추출하여 분류합니다. (단일 패스 최적화)
 */
function collectNodes(node, targetNames, results) {
    if (!node) return;

    const nodeName = node.name || (node.tokenType && node.tokenType.name);
    if (targetNames.has(nodeName)) {
        results[nodeName].push(node);
    }

    if (node.children) {
        for (const key in node.children) {
            const childArray = node.children[key];
            if (Array.isArray(childArray)) {
                childArray.forEach(child => collectNodes(child, targetNames, results));
            }
        }
    }
}

/**
 * 어노테이션 노드에서 StringLiteral 값 (URL)을 추출합니다.
 */
function extractAnnotationValue(annotationNode) {
    const stringLiterals = findNodes(annotationNode, 'StringLiteral');
    if (stringLiterals.length > 0) {
        return stringLiterals[0].image.replace(/"/g, '');
    }
    return '';
}

/**
 * 파일명과 패키지명을 기반으로 클래스 타입을 추론합니다.
 */
function getClassType(fileName, packageName) {
    let classType = 'JAVA_ETC';
    if (fileName.endsWith('_CTR')) classType = 'JAVA_CTR';
    else if (fileName.endsWith('_SVC')) classType = 'JAVA_SVC';
    else if (fileName.endsWith('DBM')) classType = 'JAVA_DBM';
    else if (fileName.endsWith('_COM')) {
        const lowerPkg = packageName.toLowerCase();
        const mciPrefixes = CONFIG.ANALYSIS_CONFIG?.MCI_PREFIXES || ['IF_', 'IFVN', 'MCI_'];
        const isMciPrefix = mciPrefixes.some(prefix => fileName.startsWith(prefix) || fileName.includes(prefix));
        
        if (isMciPrefix) classType = 'JAVA_MCI';
        else if (lowerPkg.includes('.mci')) classType = 'JAVA_MCI';
        else if (lowerPkg.includes('.card')) classType = 'JAVA_MCI';
        else classType = 'JAVA_COM';
    }
    else if (fileName.endsWith('Util')) classType = 'JAVA_UTL';
    else if (fileName.match(/_(IDT|ODT|DTO|DDTO|DIDT|DODT|TDTO)$/)) classType = 'JAVA_DTO';
    else if (fileName.includes('DAO') || fileName.includes('Mapper')) classType = 'JAVA_DTO';

    return classType;
}

export async function parseJavaFile(filePath, projectId) {
    const content = await fs.readFile(filePath, "utf-8");
    const cst = parse(content);

    // 최상위 주요 노드들을 한 번의 순회로 모두 수집 (성능 최적화)
    const targetNodeNames = new Set([
        'packageDeclaration', 
        'importDeclaration', 
        'classDeclaration', 
        'interfaceDeclaration', 
        'fieldDeclaration', 
        'methodDeclaration', 
        'interfaceMethodDeclaration'
    ]);
    const collected = {
        packageDeclaration: [],
        importDeclaration: [],
        classDeclaration: [],
        interfaceDeclaration: [],
        fieldDeclaration: [],
        methodDeclaration: [],
        interfaceMethodDeclaration: []
    };
    collectNodes(cst, targetNodeNames, collected);

    // 1. 패키지명 추출 (AST 기반, 실패 시 폴더 구조 fallback)
    let packageName = path.dirname(filePath).replace(/\\/g, '/');
    const packageDecls = collected.packageDeclaration;
    if (packageDecls.length > 0) {
        try {
            const identifiers = findNodes(packageDecls[0], 'Identifier');
            if (identifiers.length > 0) {
                packageName = identifiers.map(n => n.image).join('.');
            } else {
                console.log('##', packageDecls)
            }
        } catch (e) { }
    }
    const fileName = path.basename(filePath, '.java');

    // 1.5. import 구문 추출하여 SimpleName -> FQN 매핑
    const importMap = new Map();
    const importDecls = collected.importDeclaration;
    importDecls.forEach(imp => {
        try {
            const packageOrType = findNodes(imp, 'packageOrTypeName');
            if (packageOrType.length > 0) {
                const identifiers = findNodes(packageOrType[0], 'Identifier');
                if (identifiers.length > 0) {
                    const fqn = identifiers.map(n => n.image).join('.');
                    const simpleName = identifiers[identifiers.length - 1].image;
                    importMap.set(simpleName, fqn);
                }
            }
        } catch (e) {}
    });

    // 클래스 타입 추론
    const classType = getClassType(fileName, packageName);

    // JAVA_DTO 타입은 분석에서 제외 (추적하지 않음)
    if (classType === 'JAVA_DTO') {
        return null;
    }

    // 2. 클래스 선언 찾기
    const classDecls = collected.classDeclaration;
    const interfaceDecls = collected.interfaceDeclaration;
    let className = fileName; // 기본값
    let classBaseUrl = ''; // 클래스 레벨의 기본 URL

    let typeDecl = null;
    if (classDecls.length > 0) {
        typeDecl = classDecls[0];
        try {
            className = typeDecl.children.normalClassDeclaration[0].children.typeIdentifier[0].children.Identifier[0].image;
        } catch (e) {
            // fallback
        }
    } else if (interfaceDecls.length > 0) {
        typeDecl = interfaceDecls[0];
        try {
            className = typeDecl.children.normalInterfaceDeclaration[0].children.typeIdentifier[0].children.Identifier[0].image;
        } catch (e) {
            // fallback
        }
    }

    if (typeDecl) {
        try {
            // @RequestMapping URL 추출
            const modifiers = [
                ...findNodes(typeDecl, 'classModifier'),
                ...findNodes(typeDecl, 'interfaceModifier')
            ];
            
            modifiers.forEach(mod => {
                if (mod.children && mod.children.annotation) {
                    const annoNode = mod.children.annotation[0];
                    const annoNameNode = findNodes(annoNode, 'typeName');
                    if (annoNameNode.length > 0 && annoNameNode[0].children.Identifier) {
                        const annoName = annoNameNode[0].children.Identifier[0].image;
                        if (annoName === 'RequestMapping') {
                            classBaseUrl = extractAnnotationValue(annoNode);
                        }
                    }
                }
            });
        } catch (e) {
            // AST 구조가 예상과 다를 경우 fallback
        }
    }

    const classDTO = new ClassDTO(projectId, packageName, className, classType);

    // 3. 필드 선언에서 의존성 주입(Bean) 변수 추출
    const injectedBeans = new Map(); // varName -> typeName
    const fieldDecls = collected.fieldDeclaration;
    fieldDecls.forEach(field => {
        try {
            const unannType = field.children.unannType[0];
            // 타입명 찾기 (간소화: unannClassType_LFno_unannClassOrInterfaceType 등 여러 복잡한 경로가 있을 수 있음)
            const typeNodes = findNodes(unannType, 'Identifier');
            const varNodes = findNodes(field.children.variableDeclaratorList[0], 'Identifier');
            if (typeNodes.length > 0 && varNodes.length > 0) {
                const typeName = typeNodes[typeNodes.length - 1].image;
                const varName = varNodes[0].image;
                
                // 패키지 추론 (import 맵에 있으면 해당 패키지, 없으면 현재 패키지)
                let targetPackage = importMap.has(typeName) ? importMap.get(typeName).split('.').slice(0, -1).join('.') : packageName;
                
                injectedBeans.set(varName, { targetPackage, targetClass: typeName });
            }
        } catch (e) {
            // 필드 파싱 실패 방어 로직
        }
    });

    // 3.5 ApplicationContext.getBean 을 통한 동적 주입 추출 (Regex 활용)
    const getBeanRegex = /(?:this\.)?([a-zA-Z0-9_]+)\s*=\s*(?:[A-Za-z0-9_]*ApplicationContext)\.getBean\s*\((?:[^,]+,\s*)?([a-zA-Z0-9_]+)\.class\s*\)/g;
    let match;
    while ((match = getBeanRegex.exec(content)) !== null) {
        const varName = match[1];
        const typeName = match[2];
        let targetPackage = importMap.has(typeName) ? importMap.get(typeName).split('.').slice(0, -1).join('.') : packageName;
        injectedBeans.set(varName, { targetPackage, targetClass: typeName });
    }

    // 4. 메서드 및 엔드포인트 추출
    const methodDecls = [
        ...collected.methodDeclaration,
        ...collected.interfaceMethodDeclaration
    ];
    methodDecls.forEach(method => {
        try {
            const methodHeader = method.children.methodHeader[0];
            const methodNameNode = methodHeader.children.methodDeclarator[0].children.Identifier[0];
            const methodName = methodNameNode.image;
            const line = methodNameNode.startLine;

            // 파라미터 개수 추출
            let paramCount = 0;
            const paramList = findNodes(methodHeader, 'formalParameterList');
            if (paramList.length > 0 && paramList[0].children) {
                if (paramList[0].children.formalParameter) {
                    paramCount = paramList[0].children.formalParameter.length;
                }
            }

            const methodDTO = new MethodDTO(className, methodName, line, paramCount);

            // 어노테이션 확인 (엔드포인트 매핑)
            const methodMod = method.children.methodModifier;
            if (methodMod) {
                methodMod.forEach(mod => {
                    if (mod.children && mod.children.annotation) {
                        const annoNode = mod.children.annotation[0];
                        const annoName = annoNode.children.typeName[0].children.Identifier[0].image;
                        if (annoName.includes('Mapping')) {
                            const methodUrl = extractAnnotationValue(annoNode) || ('/' + methodName);
                            
                            // 클래스 기본 URL과 메서드 URL 결합
                            const baseUrl = classBaseUrl.startsWith('/') ? classBaseUrl : '/' + classBaseUrl;
                            const pathUrl = methodUrl.startsWith('/') ? methodUrl : '/' + methodUrl;
                            let fullUrl = (baseUrl + pathUrl).replace(/\/\/+/g, '/');
                            
                            // 기본 URL이 없거나 비어있는 경우의 처리
                            if (!classBaseUrl) {
                                fullUrl = pathUrl;
                            }
                            
                            methodDTO.addEndpoint(fullUrl, annoName.replace('Mapping', '').toUpperCase());
                        }
                    }
                });
            }

            // 5. 메서드 내부에서 다른 Bean/Service 호출 탐색 (method_calls)
            const methodBody = method.children.methodBody;
            if (methodBody) {
                const invocations = findNodes(methodBody[0], 'primary');
                invocations.forEach(invoc => {
                    try {
                        // Collect all Identifiers that are NOT inside an argumentList
                        const allIds = [];
                        function traverse(n) {
                            if (!n) return;
                            const nName = n.name || (n.tokenType && n.tokenType.name);
                            if (nName === 'argumentList') return; // STOP at argumentList
                            if (nName === 'Identifier') allIds.push(n.image);
                            if (n.children) {
                                for (const key in n.children) {
                                    const childArray = n.children[key];
                                    if (Array.isArray(childArray)) {
                                        childArray.forEach(traverse);
                                    }
                                }
                            }
                        }
                        traverse(invoc);

                        if (allIds.length >= 2) {
                            const varName = allIds[allIds.length - 2];
                            const callMethodName = allIds[allIds.length - 1];

                            if (injectedBeans.has(varName)) {
                                const beanInfo = injectedBeans.get(varName);
                                
                                // 타겟 메서드의 파라미터(인자) 개수 추출
                                let targetParamCount = 0;
                                const argumentListNodes = findNodes(invoc, 'argumentList');
                                if (argumentListNodes.length > 0) {
                                    const argList = argumentListNodes[0];
                                    if (argList.children && argList.children.expression) {
                                        targetParamCount = argList.children.expression.length;
                                    }
                                }
                                
                                methodDTO.addCall(beanInfo.targetPackage, beanInfo.targetClass, callMethodName, targetParamCount);
                            }
                        }
                    } catch (e) {
                        // 호출 구문 매칭 실패 무시
                    }
                });
            }

            classDTO.addMethod(methodDTO);
        } catch (e) {
            // 구조 매칭 실패 방어 로직
        }
    });

    return classDTO;
}
