/**
 * 프로젝트 전역 환경 설정 및 분석 대상 프로젝트 구성 (Configuration)
 * 
 * [수정 가이드]
 * 1. 분석 대상 프로젝트(PROJECTS):
 *    - 본인의 분석 대상 소스 디렉토리(dir)와 형상관리 원격 링크(repoBaseUrl)를 수정하세요.
 *    - 환경 변수(TARGET_DIR 등) 또는 CLI 인자(--target=...)를 통해서도 동적 주입이 가능합니다.
 * 2. 원격 저장소 및 메타 링크(REPO_CONFIG):
 *    - 웹 뷰어 UI 내에서 원본 소스 및 메타데이터를 열람할 기본 레포지토리 URL을 설정합니다.
 * 3. 분석 파서 규칙(ANALYSIS_CONFIG):
 *    - 대외 인터페이스 접두사(MCI), Bean 주입 Context 클래스명, 모바일 화면 패키지 경로를 지정합니다.
 */

// 1. 기본 원격 저장소 링크 설정 (GitHub / GitLab)
const DEFAULT_REPO_URL = typeof process !== 'undefined' && process.env?.APP_REPO_URL 
  ? process.env.APP_REPO_URL 
  : 'https://github.com/nicepig7/fileTrace';

export const REPO_CONFIG = {
  PROJECT_REPO_URL: DEFAULT_REPO_URL,
  RAW_META_URL: `${DEFAULT_REPO_URL}/tree/main/src/extern/raw`,
  MCI_META_URL: `${DEFAULT_REPO_URL}/blob/main/src/extern/raw/mci/IFList_sample.txt`,
};

// 2. 분석 엔진 맞춤 규칙 (Custom Parser Rules)
export const ANALYSIS_CONFIG = {
  // ApplicationContext 주입 정규식 대상 클래스 (Spring ApplicationContext, 프레임워크 전용 Context 등)
  BEAN_CONTEXT_CLASSES: ['ApplicationContext', 'WFApplicationContext'],
  // 대외 연계 전문/인터페이스 식별 접두사 목록
  MCI_PREFIXES: ['IF_', 'IFVN', 'MCI_'],
  // Android 소스 내 화면 식별자(Enum) 정의 파일의 상대 경로
  KOTLIN_SCREEN_SUBPATH: 'common/src/main/java/com/example/app/screeninfo',
};

// 3. 분석 대상 프로젝트 정의
let projects = [
  { 
    id: 'MBW', 
    name: 'Mobile Banking', 
    type: 'ONLINE', 
    dir: './target/sample-backend/src', 
    gitlabBase: `${DEFAULT_REPO_URL}/blob/main/src/` 
  },
  { 
    id: 'MBW', 
    name: 'Mobile Banking Web', 
    type: 'WEB', 
    dir: './target/sample-web/src', 
    gitlabBase: `${DEFAULT_REPO_URL}/blob/main/src/` 
  },
  { 
    id: 'MBW', 
    name: 'Mobile Banking AOS', 
    type: 'AOS', 
    dir: './target/sample-aos', 
    gitlabBase: `${DEFAULT_REPO_URL}/blob/main/src/` 
  },
  
  { 
    id: 'ADM', 
    name: 'Admin Portal', 
    type: 'ONLINE', 
    dir: './target/sample-adm-backend/src', 
    gitlabBase: `${DEFAULT_REPO_URL}/blob/main/src/` 
  },
  { 
    id: 'ADM', 
    name: 'Admin Portal Web', 
    type: 'WEB', 
    dir: './target/sample-adm-web/src', 
    gitlabBase: `${DEFAULT_REPO_URL}/blob/main/src/` 
  },
  
  { 
    id: 'COR', 
    name: 'Core System', 
    type: 'ONLINE', 
    dir: './target/sample-core-backend/src', 
    gitlabBase: `${DEFAULT_REPO_URL}/blob/main/src/` 
  },
  { 
    id: 'COR', 
    name: 'Core System AOS', 
    type: 'AOS', 
    dir: './target/sample-core-aos', 
    gitlabBase: `${DEFAULT_REPO_URL}/blob/main/src/` 
  }
];

// 환경 변수나 커맨드 인자를 통해 동적으로 대상 폴더 및 원격 URL을 변경할 수 있도록 처리
if (typeof process !== 'undefined') {
  const getArg = (prefix) => {
    const arg = process.argv.find(a => a.startsWith(prefix));
    return arg ? arg.split('=')[1] : null;
  };

  const updateDir = (id, type, envKey, argKey) => {
    const p = projects.find(proj => proj.id === id && proj.type === type);
    if (p) {
      const val = getArg(argKey) || (process.env && process.env[envKey]);
      if (val) p.dir = val;
    }
  };

  updateDir('MBW', 'ONLINE', 'TARGET_DIR', '--target=');
  updateDir('MBW', 'WEB', 'VUE_TARGET_DIR', '--vue-target=');
  updateDir('MBW', 'AOS', 'AOS_TARGET_DIR', '--aos-target=');

  updateDir('ADM', 'ONLINE', 'ADM_TARGET_DIR', '--adm-target=');
  updateDir('ADM', 'WEB', 'ADM_VUE_TARGET_DIR', '--adm-vue-target=');

  updateDir('COR', 'ONLINE', 'COR_TARGET_DIR', '--cor-target=');
  updateDir('COR', 'AOS', 'COR_AOS_TARGET_DIR', '--cor-aos-target=');
}

const CONFIG = {
  PROJECTS: projects,
  REPORT_DIR: "./report",
  FILE_EXT: ".java",
  DBIO_EXT: "_DBM.dbio",
  REPO_CONFIG,
  ANALYSIS_CONFIG,
};

const REGEX = {
  METHOD_DEF:
    /(?:public|private|protected)\s+(?:static\s+)?(?:final\s+)?[A-Za-z0-9_<>,?\[\]\s]+\s+([A-Za-z0-9_]+)\s*\(/,
  GET_BEAN:
    /(?:this\.)?([a-zA-Z0-9_]+)\s*=\s*(?:[A-Za-z0-9_]*ApplicationContext)\.getBean\s*\((?:[^,]+,\s*)?([a-zA-Z0-9_]+)\.class\s*\)/,
  CALL_TRX: /(?:this\.)?([a-zA-Z0-9_]+)\.callTrx\s*\(/,
  MAPPING_ANNOTATION:
    /@(RequestMapping|PostMapping|GetMapping|PutMapping|DeleteMapping|PatchMapping)(?:\s*\(\s*(?:value\s*=\s*)?(?:\{)?\s*["']([^"']*)["']\s*\))?/,
  CLASS_DEF:
    /(?:public|private|protected)?\s*(?:final\s+)?class\s+[A-Za-z0-9_]+/,
};

export {
  CONFIG,
  REGEX,
};
