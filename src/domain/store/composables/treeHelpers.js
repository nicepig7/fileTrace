import { getSimpleName } from '../../../base/util/stringUtils.js';
export { getSimpleName };

export const initFqdnMap = (ctrData, callData, mciData, dbmData) => {
  const fqdnMap = new Map();
  const addToMap = (dataArray) => {
    if (!dataArray || !Array.isArray(dataArray)) return;
    dataArray.forEach(item => {
      if (item.file) {
        const simpleName = getSimpleName(item.file);
        if (!fqdnMap.has(simpleName)) {
          fqdnMap.set(simpleName, new Set());
        }
        fqdnMap.get(simpleName).add(item.file);
      }
    });
  };
  addToMap(ctrData);
  addToMap(callData);
  addToMap(mciData);
  addToMap(dbmData);
  return fqdnMap;
};

export const initDataMap = (dataArray) => {
  const map = new Map();
  if (!dataArray || !Array.isArray(dataArray)) return map;
  dataArray.forEach(item => {
    if (item.file) {
      map.set(item.file, item);
      map.set(getSimpleName(item.file), item);
    }
  });
  return map;
};

export const initOwnerMap = (ownerData) => {
  const map = new Map();
  if (!ownerData || !Array.isArray(ownerData)) return map;
  ownerData.forEach(item => {
    const simpleName = item.fileName ? item.fileName.replace(/\.java$/, '') : getSimpleName(item.file);
    const methods = item.methods || item.methodOwners;
    if (methods) {
      Object.entries(methods).forEach(([methodName, ownerInfo]) => {
        const key = `${simpleName}.${methodName}`;
        map.set(key, ownerInfo);
      });
    }
  });
  return map;
};

export const getMethodOwner = (ownerMap, className, methodName) => {
  const key = `${className}.${methodName}`;
  const ownerInfo = ownerMap.get(key);
  if (!ownerInfo) return null;

  const contributors = ownerInfo.contributors || [];
  const date = ownerInfo.date || ownerInfo.lastModified?.date || '';

  let tooltip = '';
  if (contributors.length > 0) {
    const mainText = contributors
      .slice(0, 3)
      .map(c => `${c.name} (${c.score}%)`)
      .join(' / ');
    tooltip = date ? `${mainText} [${date}]` : mainText;
  } else if (ownerInfo.activeOwner?.name) {
    const activeName = ownerInfo.activeOwner.name;
    const coreName = ownerInfo.coreAuthor?.name || '';
    if (coreName && activeName !== coreName) {
      tooltip = `${activeName} / 원작: ${coreName}`;
    } else {
      tooltip = activeName;
    }
  }

  return {
    date,
    contributors,
    primaryOwner: contributors[0] || (ownerInfo.activeOwner ? { name: ownerInfo.activeOwner.name, score: ownerInfo.activeOwner.scorePercent || 100 } : null),
    tooltip
  };
};

export const getCalls = (callMap, className, methodName) => {
  const fileData = callMap.get(className);
  if (!fileData || !fileData.calls) return [];
  return Array.isArray(fileData.calls[methodName]) ? fileData.calls[methodName] : [];
};

export const getMCI = (mciMap, className, methodName, defaultFqdn = null) => {
  const fileData = mciMap.get(className);
  if (!fileData || !fileData.usages) return [];
  const fqdn = fileData.file || defaultFqdn;
  
  const uniqueMap = new Map();
  fileData.usages
    .filter(u => u.callerMethod === methodName)
    .forEach(u => {
      const key = `${u.targetClass}:${u.line}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, {
          name: u.targetClass,
          line: u.line || null,
          fqdn: fqdn,
          code: u.code || null
        });
      }
    });
  return Array.from(uniqueMap.values());
};

export const getDbmQuery = (dbmMap, className, methodName) => {
  if (!dbmMap) return null;
  const fileData = dbmMap.get(className);
  if (!fileData || !fileData.queries) return null;
  return fileData.queries.find(q => q.id === methodName) || null;
};

export const checkNodeHasMci = (node) => {
  let hasMci = node.mci && node.mci.length > 0;
  if (node.children) {
    for (const child of node.children) {
      if (checkNodeHasMci(child)) {
        hasMci = true;
        break;
      }
    }
  }
  return hasMci;
};

export const checkNodeHasDbm = (node) => {
  let hasDbm = node.type === 'DBM';
  if (!hasDbm && node.children) {
    for (const child of node.children) {
      if (checkNodeHasDbm(child)) {
        hasDbm = true;
        break;
      }
    }
  }
  return hasDbm;
};
