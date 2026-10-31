import fs from "fs/promises";
import path from "path";

async function findFilesByExtension(dir, ext, fileList = []) {
  const extArray = Array.isArray(ext) ? ext : [ext];
  const files = await fs.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      if (filePath.replace(/\\/g, '/').includes('/src/test')) continue;
      await findFilesByExtension(filePath, extArray, fileList);
    } else if (extArray.some(e => file.name.endsWith(e))) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function findGitRoot(startDir) {
  let current = path.resolve(startDir);
  while (true) {
    try {
      const gitDir = path.join(current, '.git');
      const stat = await fs.stat(gitDir);
      if (stat.isDirectory() || stat.isFile()) {
        return current;
      }
    } catch {
      // ignore
    }
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return null;
}

async function loadJsonSafe(filePath, defaultData) {
  try {
    const rawData = await fs.readFile(filePath, "utf-8");
    return JSON.parse(rawData);
  } catch (e) {
    console.error(`[Warning] Unable to read ${filePath}:`, e.message);
    return defaultData;
  }
}

export {
  findFilesByExtension,
  findGitRoot,
  loadJsonSafe,
};
