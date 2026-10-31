import { CONFIG } from '@common/config/config.js';

/**
 * Open source repository (GitLab / GitHub) file based on FQDN class path and line number
 * @param {string} classPath - e.g., 'com.example.service.UserService'
 * @param {string|number} line - Line number
 * @param {string} ext - File extension (e.g., 'java', 'dbio')
 * @param {string|null} projectId - Target project identifier (e.g., 'MBW', 'ADM')
 */
export const openGitlabSource = (classPath, line, ext = 'java', projectId = null) => {
  if (!classPath) return;
  const path = classPath.replace(/\./g, '/');
  
  let projId = projectId;
  if (!projId) {
    projId = 'MBW';
    if (classPath.includes('.adm.')) projId = 'ADM';
    else if (classPath.includes('.cor.')) projId = 'COR';
  }

  // Java/DBIO files are typically in the ONLINE project, so prioritize it
  const project = CONFIG.PROJECTS?.find(p => p.id === projId && p.type === 'ONLINE') 
               || CONFIG.PROJECTS?.find(p => p.id === projId);
  const gitlabBase = project?.gitlabBase || `${CONFIG.REPO_CONFIG?.PROJECT_REPO_URL || 'https://github.com/nicepig7/fileTrace'}/blob/main/src/`;
  
  const lineSuffix = line ? `#L${line}` : '';
  const url = `${gitlabBase}${path}.${ext}${lineSuffix}`;
  window.open(url, '_blank');
};
