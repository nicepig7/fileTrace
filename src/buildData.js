import { CONFIG } from "./common/config/config.js";
import path from "path";
import { AnalysisRunner } from "./domain/analyse/AnalysisRunner.js";
import { parseRawMetaAndGenerateJson } from "./domain/translate/parseRawMeta.js";

async function main() {
    console.log('[Main] 0. Parsing and Translating Raw Meta Data...');
    await parseRawMetaAndGenerateJson();

    let projects = CONFIG.PROJECTS;

    // 0. Filter projects if argument is provided (e.g., npm run build:data -- mbw)
    const targetProject = process.argv[2];
    if (targetProject) {
        projects = projects.filter(p => (p.id.toLowerCase() === targetProject.toLowerCase()
            || `${p.id}-${p.type}`.toLowerCase() === targetProject.toLowerCase()
        ));
        if (projects.length === 0) {
            console.error(`[Main] No projects found matching ID: '${targetProject}'`);
            process.exit(1);
        }
        console.log(`[Main] Running analysis ONLY for project: ${targetProject.toUpperCase()}`);
    }

    const totalStartTime = Date.now();
    const runner = new AnalysisRunner(projects);
    // 1. Analysis all project
    await runner.runAll();
    const totalDurationSec = parseFloat(((Date.now() - totalStartTime) / 1000).toFixed(2));
    console.log(`\n=== All Analysis Completed in ${totalDurationSec}s ===\n`);

    // 2. Generate SQLite Database
    console.log('\n[Main] Building SQLite database...');
    const { buildSqliteDatabase } = await import('./extern/sqlite/buildData_sqlite.js');
    const outputDbPath = path.join(process.cwd(), 'public', 'data.sqlite');
    await buildSqliteDatabase(outputDbPath, runner.getResults());
}

main().catch(err => console.error("Error during buildData:", err));
