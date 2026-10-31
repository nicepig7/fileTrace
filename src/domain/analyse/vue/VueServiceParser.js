import fs from 'fs';
import path from 'path';
import { parse as parseBabel } from '@babel/parser';

// URL 정규화 함수 (예: /path/${channelCode}/... -> /path/{}/..., /api/ 제거)
function normalizeUrl(url) {
  if (!url) return url;
  // 1. 템플릿 리터럴 변수 치환
  let res = url.replace(/\$\{[^}]+\}/g, '{}');

  // 2. 하드코딩된 채널코드(2자리 영문자) 치환 (예: /mbw/mbw/bnk/mb/ -> /mbw/mbw/bnk/{}/)
  res = res.replace(/^(\/?mbw\/mbw\/[^/]+\/)([a-z]{2})(\/|$)/, (match, p1, p2, p3) => {
    return p1 + '{}' + p3;
  });

  if (res.startsWith('api/')) {
    res = res.substring(4);
  } else if (res.startsWith('/api/')) {
    res = res.substring(5);
  }
  return res;
}

function _extractUrlRaw(argNode, scopeVars) {
  if (!argNode) return '';
  if (argNode.type === 'StringLiteral') {
    return argNode.value;
  }
  if (argNode.type === 'TemplateLiteral') {
    let raw = '';
    for (let i = 0; i < argNode.quasis.length; i++) {
      raw += argNode.quasis[i].value.raw;
      if (i < argNode.expressions.length) {
        const exprVal = _extractUrlRaw(argNode.expressions[i], scopeVars);
        raw += exprVal ? exprVal : '{}';
      }
    }
    return raw;
  }
  if (argNode.type === 'Identifier') {
    const varVal = scopeVars[argNode.name];
    if (varVal) return varVal;
    return '{}';
  }
  if (argNode.type === 'BinaryExpression' && argNode.operator === '+') {
    const left = _extractUrlRaw(argNode.left, scopeVars);
    const right = _extractUrlRaw(argNode.right, scopeVars);
    return left + right;
  }
  return '{}';
}

function extractUrlFromAstNode(argNode, scopeVars) {
  if (!argNode) return null;
  const rawUrl = _extractUrlRaw(argNode, scopeVars);
  if (!rawUrl || rawUrl === '{}') return null; // 유효하지 않은 호출 무시
  let cleaned = rawUrl.replace(/(\{\})+/g, '{}');
  return normalizeUrl(cleaned);
}

export function parseServiceFileWithAst(filePath, servicesDir, results = []) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(servicesDir, filePath).replace(/\\/g, '/');

  let ast;
  try {
    ast = parseBabel(content, {
      sourceType: 'module',
      plugins: ['typescript', 'decorators-legacy', 'jsx']
    });
  } catch (e) {
    return results;
  }

  const scopeVars = {};

  function walk(node, currentFunction = 'unknown') {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'VariableDeclarator' && node.id?.name && node.init) {
      if (node.init.type === 'StringLiteral') {
        scopeVars[node.id.name] = node.init.value;
      } else if (node.init.type === 'TemplateLiteral') {
        let raw = '';
        for (let i = 0; i < node.init.quasis.length; i++) {
          raw += node.init.quasis[i].value.raw;
          if (i < node.init.expressions.length) raw += '{}';
        }
        scopeVars[node.id.name] = raw;
      }
    }

    let nextFunc = currentFunction;

    if (node.type === 'FunctionDeclaration' && node.id) {
      nextFunc = node.id.name;
    } else if (node.type === 'ObjectProperty' && node.key) {
      const keyName = node.key.name || node.key.value;
      if (keyName) nextFunc = keyName;
    } else if (node.type === 'ObjectMethod' && node.key) {
      const keyName = node.key.name || node.key.value;
      if (keyName) nextFunc = keyName;
    } else if (node.type === 'ClassMethod' && node.key) {
      const keyName = node.key.name || node.key.value;
      if (keyName) nextFunc = keyName;
    } else if (node.type === 'VariableDeclarator' && node.id && (node.init?.type === 'ArrowFunctionExpression' || node.init?.type === 'FunctionExpression')) {
      nextFunc = node.id.name;
    }

    if (node.type === 'CallExpression') {
      const callee = node.callee;
      let isApiCall = false;
      let isFetch = false;

      if (callee.type === 'Identifier') {
        if (callee.name === 'apiFetcher') isApiCall = true;
        else if (callee.name === 'fetch') isFetch = true;
      } else if (callee.type === 'MemberExpression') {
        const propName = callee.property?.name;
        if (propName === 'apiFetcher') isApiCall = true;
        else if (propName === 'fetch') isFetch = true;
      }

      if (isApiCall || isFetch) {
        const firstArg = node.arguments[0];
        const url = extractUrlFromAstNode(firstArg, scopeVars);
        if (url) {
          const entry = {
            fileName: relPath,
            functionName: nextFunc,
            url: url
          };
          if (isFetch) {
            entry.warning = 'Used native fetch instead of apiFetcher';
          }
          results.push(entry);
        }
      }
    }

    for (const key of Object.keys(node)) {
      if (key === 'comments' || key === 'loc') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        for (const c of child) walk(c, nextFunc);
      } else if (child && typeof child === 'object') {
        walk(child, nextFunc);
      }
    }
  }

  walk(ast);
  return results;
}

export function extractApisFromServices(servicesDir) {
  const apiResults = [];

  function walkServices(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (['node_modules', 'dist', '.git', 'public'].includes(file)) continue;
        walkServices(fullPath);
      } else if ((file.endsWith('.ts') || file.endsWith('.api') || file.endsWith('.js')) && !file.endsWith('.d.ts')) {
        parseServiceFileWithAst(fullPath, servicesDir, apiResults);
      }
    }
  }
  walkServices(servicesDir);
  return apiResults;
}
