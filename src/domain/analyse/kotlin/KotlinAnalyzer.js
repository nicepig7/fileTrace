import { analyzeKotlinFiles } from './KotlinParsers.js';
import { traverseAndMap } from './KotlinMappers.js';

export async function runKotlinTrace(project) {
    const startTime = Date.now();
    const targetDir = project.dir;

    if (!targetDir) {
        return { durationSec: 0, kotlinMappings: { screens: [], apis: [], mappings: [] } };
    }

    try {
        const mapData = await analyzeKotlinFiles(targetDir);
        const kotlinMappings = traverseAndMap(mapData, targetDir, project.id, project.type);

        const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
        return { durationSec: parseFloat(elapsedSec), kotlinMappings };
    } catch (error) {
        console.error(`[Kotlin Analysis] Error in ${project.id}:`, error.message);
        const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
        return { durationSec: parseFloat(elapsedSec), error: error.message, kotlinMappings: { screens: [], apis: [], mappings: [] } };
    }
}
