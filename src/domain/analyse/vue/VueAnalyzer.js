import path from 'path';
import { extractApisFromServices } from './VueServiceParser.js';
import { mapVueFilesToApis } from './VueViewParser.js';

export async function runVueTrace(project) {
    const startTime = Date.now();
    const targetDir = project.dir;

    if (!targetDir) {
        return { durationSec: 0, vueMappings: { screens: [], apis: [], mappings: [] } };
    }

    try {
        const servicesDir = targetDir;
        const viewsDir = targetDir;

        const apiResults = extractApisFromServices(servicesDir);
        const vueMappings = mapVueFilesToApis(apiResults, viewsDir, project.id, project.type);

        const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
        return { durationSec: parseFloat(elapsedSec), vueMappings };
    } catch (error) {
        console.error(`[Vue Analysis] Error in ${project.id}:`, error.message);
        const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
        return { durationSec: parseFloat(elapsedSec), error: error.message, vueMappings: { screens: [], apis: [], mappings: [] } };
    }
}
