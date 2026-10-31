import fs from 'fs';
import path from 'path';
import { parse as parseBabel } from '@babel/parser';
import { parse as parseSfc } from '@vue/compiler-sfc';

export function mapVueFilesToApis(apiResults, viewsDir, projectId, targetType) {
  const serviceMap = {};
  apiResults.forEach(item => {
    const keyWithExt = item.fileName.replace(/\.ts$/, '');
    const keyWithoutApi = keyWithExt.replace(/\.api$/, '');

    if (!serviceMap[keyWithExt]) serviceMap[keyWithExt] = [];
    serviceMap[keyWithExt].push(item);

    if (!serviceMap[keyWithoutApi]) serviceMap[keyWithoutApi] = [];
    serviceMap[keyWithoutApi].push(item);
  });

  const reportData = {
    screens: [],
    apis: [],
    mappings: []
  };

  const uniqueUrls = new Set();
  apiResults.forEach(item => {
    if (!uniqueUrls.has(item.url)) {
      uniqueUrls.add(item.url);

      const dirPath = path.dirname(item.fileName).replace(/\\/g, '/');
      const finalDirPath = dirPath === '.' ? '/src/services' : '/src/services/' + dirPath;

      const extMatch = item.fileName.match(/\.([^.]+)$/);
      const ext = extMatch ? extMatch[1] : 'ts';
      const className = path.basename(item.fileName, '.' + ext);

      reportData.apis.push({
        projectId: projectId,
        targetType: targetType,
        url: item.url,
        httpMethod: 'POST',
        className: className,
        methodName: item.functionName || null,
        filePath: finalDirPath,
        fileExt: ext
      });
    }
  });

  function normalizeImportPath(importPath) {
    let normalized = importPath.replace(/\\/g, '/');
    const servicesIndex = normalized.indexOf('services/');
    if (servicesIndex !== -1) {
      normalized = normalized.substring(servicesIndex + 9);
    }
    const domainsIndex = normalized.indexOf('domains/');
    if (domainsIndex !== -1) {
      normalized = normalized.substring(domainsIndex + 8);
    }
    const apiIndex = normalized.indexOf('api/');
    if (apiIndex !== -1) {
      normalized = normalized.substring(apiIndex + 4);
    }
    normalized = normalized.replace(/\.ts$/, '').replace(/\.api$/, '').replace(/\.js$/, '');
    return normalized;
  }

  function getRelativeSrcPath(fullPath) {
    const norm = fullPath.replace(/\\/g, '/');
    const srcIdx = norm.lastIndexOf('/src/views/');
    if (srcIdx !== -1) {
      return norm.substring(srcIdx);
    }
    const viewsIdx = norm.lastIndexOf('views/');
    if (viewsIdx !== -1) {
      return '/src/' + norm.substring(viewsIdx);
    }
    return norm;
  }

  function walkViews(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walkViews(fullPath);
      } else if (file.startsWith('VN') && file.endsWith('.vue')) {
        processVueFile(fullPath);
      }
    }
  }

  function processVueFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let screenId = path.basename(filePath, '.vue');
    if (screenId === 'index' || screenId === 'index.api') {
      const dirName = path.basename(path.dirname(filePath));
      screenId = `${dirName}_${screenId}`;
    }

    let scriptCode = '';
    try {
      const sfc = parseSfc(content);
      if (sfc.descriptor.scriptSetup) scriptCode += sfc.descriptor.scriptSetup.content + '\n';
      if (sfc.descriptor.script) scriptCode += sfc.descriptor.script.content + '\n';
    } catch (e) {
      const match = /<script[^>]*>([\s\S]*?)<\/script>/i.exec(content);
      if (match) scriptCode = match[1];
    }

    if (!scriptCode) return;

    let ast;
    try {
      ast = parseBabel(scriptCode, {
        sourceType: 'module',
        plugins: ['typescript', 'decorators-legacy', 'jsx']
      });
    } catch (e) {
      return;
    }

    const importedServices = {};

    for (const node of ast.program.body) {
      if (node.type === 'ImportDeclaration' && node.source?.value && !node.source.value.startsWith('vue')) {
        const importPath = node.source.value;
        const serviceKey = normalizeImportPath(importPath);

        let matchingApis = serviceMap[serviceKey];
        if (!matchingApis) {
          const foundKey = Object.keys(serviceMap).find(k => k.endsWith(serviceKey) || serviceKey.endsWith(k));
          if (foundKey) matchingApis = serviceMap[foundKey];
        }

        if (matchingApis) {
          for (const specifier of node.specifiers) {
            if (specifier.type === 'ImportSpecifier' || specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier') {
              importedServices[specifier.local.name] = matchingApis;
            }
          }
        }
      }
    }

    if (Object.keys(importedServices).length === 0) return;

    const usedApis = new Set();

    function walkAst(node) {
      if (!node || typeof node !== 'object') return;

      if (node.type === 'CallExpression' && node.callee) {
        let matchedService = null;
        let matchedMethod = null;
        const callee = node.callee;

        if (callee.type === 'Identifier') {
          if (importedServices[callee.name]) {
            matchedService = callee.name;
            matchedMethod = callee.name;
          }
        } else if (callee.type === 'MemberExpression') {
          const methodName = callee.property?.name || callee.property?.value;
          if (methodName) {
            let current = callee.object;
            while (current) {
              if (current.type === 'Identifier') {
                if (importedServices[current.name]) {
                  matchedService = current.name;
                  matchedMethod = methodName;
                }
                break;
              } else if (current.type === 'MemberExpression') {
                if (current.property?.type === 'Identifier' && importedServices[current.property.name]) {
                  matchedService = current.property.name;
                  matchedMethod = methodName;
                }
                current = current.object;
              } else {
                break;
              }
            }
          }
        }

        if (matchedService && matchedMethod) {
          const apis = importedServices[matchedService];
          if (apis) {
            const matched = apis.filter(a => a.functionName === matchedMethod);
            if (matched.length > 0) {
              matched.forEach(m => usedApis.add(m.url));
            } else {
              apis.forEach(m => usedApis.add(m.url));
            }
          }
        }
      }

      for (const k of Object.keys(node)) {
        if (k === 'comments' || k === 'loc') continue;
        const child = node[k];
        if (Array.isArray(child)) {
          for (const c of child) walkAst(c);
        } else if (child && typeof child === 'object') {
          walkAst(child);
        }
      }
    }

    walkAst(ast);

    if (usedApis.size === 0) {
      for (const apis of Object.values(importedServices)) {
        apis.forEach(a => usedApis.add(a.url));
      }
    }

    if (!reportData.screens.some(s => s.screenId === screenId)) {
      const fullRelativePath = getRelativeSrcPath(filePath);
      const dirPath = path.dirname(fullRelativePath).replace(/\\/g, '/');

      reportData.screens.push({
        projectId: projectId,
        targetType: targetType,
        screenId: screenId,
        filePath: dirPath,
        fileName: path.basename(filePath, '.vue'),
        fileExt: 'vue'
      });
    }

    if (usedApis.size > 0) {
      usedApis.forEach(url => {
        reportData.mappings.push({ screenId, apiUrl: url });
      });
    }
  }

  walkViews(viewsDir);
  return reportData;
}
