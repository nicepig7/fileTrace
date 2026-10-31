import { CONFIG } from "../../../common/config/config.js";
import { findFilesByExtension } from "../../../base/util/fileUtils.js";
import { parseDbioFile } from "./DbioXmlParser.js";

export async function runDbioTrace(project) {
  const startTime = Date.now();
  const targetDir = project.dir;

  if (!targetDir) {
    return { durationSec: 0, dbios: [] };
  }

  try {
    const dbioFiles = await findFilesByExtension(targetDir, CONFIG.DBIO_EXT);
    const dbios = await processDbioFiles(dbioFiles, project.id);

    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
    return { durationSec: parseFloat(elapsedSec), dbios };
  } catch (error) {
    console.error(`[Dbio Analysis] Error in ${project.id}:`, error.message);
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
    return { durationSec: parseFloat(elapsedSec), error: error.message, dbios: [] };
  }
}

async function processDbioFiles(dbioFiles, projectId) {
  const dbios = [];
  for (const file of dbioFiles) {
    try {
      const dbioDTO = await parseDbioFile(file, projectId);
      if (dbioDTO) dbios.push(dbioDTO);
    } catch (fileError) {
      console.error(`[Warning] DBIO XML Analysis failed (${file}):`, fileError.message);
    }
  }
  return dbios;
}
