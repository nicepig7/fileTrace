import fs from 'fs';
import path from 'path';

export function traverseAndMap(mapData, targetDir, projectId, targetType, fileOutPath) {
    const reportData = {
        screens: [],
        apis: [],
        mappings: []
    };

    function getRelativePath(fullPath) {
        if (!fullPath || !targetDir) return fullPath;
        const normTarget = targetDir.replace(/\\/g, '/');
        const normPath = fullPath.replace(/\\/g, '/');
        let relPath = normPath;
        if (normPath.startsWith(normTarget)) {
            relPath = normPath.substring(normTarget.length);
            if (relPath.startsWith('/')) relPath = relPath.substring(1);
        }
        const dirPath = path.dirname(relPath).replace(/\\/g, '/');
        return dirPath === '.' ? '' : dirPath;
    }

    // 1. Build Adjacency List (caller -> list of callees)
    // Key: "ClassName.methodName"
    const adjList = {};
    mapData.methodCalls.forEach(call => {
        const caller = `${call.callerClass}.${call.callerMethod}`;
        const callee = `${call.calledClass}.${call.calledMethod}`;

        if (!adjList[caller]) adjList[caller] = [];
        adjList[caller].push(callee);

        // Bridge Interface -> Impl gap (e.g., LoginRepository -> LoginRepositoryImpl)
        // If an Impl class makes a call, we also attribute that call to its Interface
        if (call.callerClass.endsWith('Impl')) {
            const interfaceClass = call.callerClass.replace(/Impl$/, '');
            const interfaceCaller = `${interfaceClass}.${call.callerMethod}`;
            if (!adjList[interfaceCaller]) adjList[interfaceCaller] = [];
            adjList[interfaceCaller].push(callee);
        }
    });

    // 2. Build Endpoint Map for quick lookup
    // Key: "ServiceClass.methodName", Value: api object
    const endpointMap = {};
    mapData.endpoints.forEach(ep => {
        const key = `${ep.serviceClass}.${ep.serviceMethod}`;
        endpointMap[key] = ep;

        if (!reportData.apis.some(a => a.url === ep.url)) {
            reportData.apis.push({
                projectId: projectId,
                targetType: targetType,
                url: ep.url,
                httpMethod: ep.httpMethod,
                className: ep.serviceClass,
                methodName: ep.serviceMethod,
                filePath: getRelativePath(ep.filePath),
                fileExt: 'kt'
            });
        }
    });

    // 3. Identify Entry Points
    // UI Classes -> Screen IDs
    const uiToScreens = {}; // Key: uiClass, Value: { screens: Set of Screen IDs, filePath }
    mapData.enumToUis.forEach(e => {
        const screenEnums = mapData.screenToEnums.filter(se => se.enumName === e.enumName);
        if (!uiToScreens[e.uiClass]) uiToScreens[e.uiClass] = { screens: new Set(), filePath: e.filePath };
        screenEnums.forEach(se => uiToScreens[e.uiClass].screens.add(se.screenId));
    });

    // Helper: DFS from a starting class
    // Start DFS from ALL methods of the given class
    function findReachableApis(startClass) {
        const reachableApis = new Set();
        const visited = new Set();

        // Find all methods of this class that act as callers in our graph
        const startNodes = Object.keys(adjList).filter(node => node.startsWith(`${startClass}.`));

        function dfs(node) {
            if (visited.has(node)) return;
            visited.add(node);

            // Is this node an API endpoint?
            if (endpointMap[node]) {
                reachableApis.add(endpointMap[node]);
            }

            const neighbors = adjList[node] || [];
            for (const neighbor of neighbors) {
                dfs(neighbor);
            }
        }

        for (const node of startNodes) {
            dfs(node);
        }

        return Array.from(reachableApis);
    }

    // 4. Traverse from UI Classes (Screens)
    for (const [uiClass, data] of Object.entries(uiToScreens)) {
        const apis = findReachableApis(uiClass);
        if (apis.length > 0) {
            for (const screenId of data.screens) {
                if (!reportData.screens.some(s => s.screenId === screenId)) {
                    reportData.screens.push({
                        projectId: projectId,
                        targetType: targetType,
                        screenId: screenId,
                        filePath: getRelativePath(data.filePath),
                        fileName: path.basename(data.filePath || '', '.kt'),
                        fileExt: 'kt'
                    });
                }
                apis.forEach(api => reportData.mappings.push({ screenId, apiUrl: api.url }));
            }
        }
    }

    // 5. Traverse from Background Classes
    for (const bg of mapData.backgroundClasses) {
        const bgClass = bg.className;
        const apis = findReachableApis(bgClass);
        if (apis.length > 0) {
            if (!reportData.screens.some(s => s.screenId === bgClass)) {
                reportData.screens.push({
                    projectId: projectId,
                    targetType: targetType,
                    screenId: bgClass,
                    filePath: getRelativePath(bg.filePath),
                    fileName: path.basename(bg.filePath || '', '.kt'),
                    fileExt: 'kt'
                });
            }
            apis.forEach(api => reportData.mappings.push({ screenId: bgClass, apiUrl: api.url }));
        }
    }

    // Deduplicate mappings
    reportData.mappings = Array.from(new Set(reportData.mappings.map(m => JSON.stringify(m)))).map(s => JSON.parse(s));

    if (fileOutPath) {
        fs.writeFileSync(fileOutPath, JSON.stringify(reportData, null, 2), 'utf-8');
    }

    return reportData;
}
