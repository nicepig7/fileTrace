import { CONFIG } from "../../../common/config/config.js";
import { findFilesByExtension } from "../../../base/util/fileUtils.js";
import { parseJavaFile } from "./ClassJavaParser.js";

export async function runClassTrace(project) {
  const startTime = Date.now();
  const targetDir = project.dir;

  if (!targetDir || project.type !== 'ONLINE') {
    return { durationSec: 0, classes: [] };
  }

  try {
    const javaFiles = await findFilesByExtension(targetDir, CONFIG.FILE_EXT);
    const classes = await processJavaFiles(javaFiles, project.id);

    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
    return { durationSec: parseFloat(elapsedSec), classes };
  } catch (error) {
    console.error(`[Class Analysis] Error in ${project.id}:`, error.message);
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
    return { durationSec: parseFloat(elapsedSec), error: error.message, classes: [] };
  }
}

async function processJavaFiles(javaFiles, projectId) {
  // TODO: 성능 개선을 위한 Multi Thread (worker_threads, p-limit 등) 도입 고려
  // AST 파싱(parseJavaFile)은 CPU 바운드 작업이므로, 처리해야 할 Java 파일이 많을 경우 병렬 처리 도입 시 성능 향상을 기대할 수 있습니다.
  const classes = [];
  for (const file of javaFiles) {
    try {
      const classDTO = await parseJavaFile(file, projectId);
      if (classDTO) classes.push(classDTO);
    } catch (fileError) {
      console.error(`[Warning] Java AST Analysis failed (${file}):`, fileError.message);
    }
  }
  return classes;
}
