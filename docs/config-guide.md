# ⚙️ TraceFile 설정 및 커스터마이징 가이드 (Configuration Guide)

이 문서는 본 정적 분석기 및 웹 뷰어를 **자신의 프로젝트 환경(사내 GitLab, 개인 GitHub, 신규 아키텍처 등)**에 맞추어 손쉽게 설정하고 확장할 수 있는 방법을 안내합니다.

---

## 1. 전역 설정 (`src/common/config/config.js`)

모든 프로젝트 및 분석 규칙은 단일 설정 파일인 `src/common/config/config.js`에서 제어됩니다.

### 1.1 원격 저장소 링크 (`REPO_CONFIG`)
웹 대시보드 뷰어 내에서 클래스명, 인터페이스, 테이블 명세를 클릭했을 때 이동할 원격 형상관리 저장소(GitHub 또는 GitLab) 주소를 설정합니다.

```javascript
export const REPO_CONFIG = {
  // 웹 뷰어 UI에서 참조할 기준 저장소 주소
  PROJECT_REPO_URL: 'https://github.com/nicepig7/fileTrace',
  // 메타데이터(테이블/MCI 정의서) 파일들이 위치한 웹 URL
  RAW_META_URL: 'https://github.com/nicepig7/fileTrace/tree/main/src/extern/raw',
  MCI_META_URL: 'https://github.com/nicepig7/fileTrace/blob/main/src/extern/raw/mci/IFList_sample.txt',
};
```

### 1.2 분석 대상 프로젝트 (`PROJECTS`)
분석할 백엔드, 프론트엔드, 모바일 앱 프로젝트를 등록합니다.

```javascript
let projects = [
  { 
    id: 'MBW',                         // 시스템/프로젝트 식별자 (UI 토글 뱃지에 표시)
    name: 'Mobile Banking',            // 프로젝트 명칭
    type: 'ONLINE',                    // 'ONLINE' (Java Backend), 'WEB' (Vue), 'AOS' (Android)
    dir: './target/sample-backend/src',// 로컬 소스코드 디렉토리 경로
    gitlabBase: 'https://github.com/your-org/sample-backend/blob/main/src/' // 원본 소스 라인 이동 URL
  },
  { 
    id: 'MBW', 
    name: 'Mobile Banking Web', 
    type: 'WEB', 
    dir: './target/sample-web/src', 
    gitlabBase: 'https://github.com/your-org/sample-web/blob/main/src/' 
  },
  { 
    id: 'MBW', 
    name: 'Mobile Banking AOS', 
    type: 'AOS', 
    dir: './target/sample-aos', 
    gitlabBase: 'https://github.com/your-org/sample-aos/blob/main/src/' 
  }
];
```

> **Tip (환경 변수 또는 CLI 인자로 경로 오버라이드):**  
> 소스코드 파일을 수정하지 않고도 아래 환경 변수나 커맨드 인자를 전달하여 로컬 대상 폴더를 동적으로 지정할 수 있습니다:
> - `TARGET_DIR` (또는 `--target=...`) : 백엔드 Java 소스 루트
> - `VUE_TARGET_DIR` (또는 `--vue-target=...`) : 웹 Vue 소스 루트
> - `AOS_TARGET_DIR` (또는 `--aos-target=...`) : 모바일 Android 소스 루트

### 1.3 커스텀 파서 규칙 (`ANALYSIS_CONFIG`)
프로젝트 고유의 프레임워크 규칙(ApplicationContext 명칭, 대외계 전문 접두사, 모바일 화면 패키지 경로)을 수정할 수 있습니다.

```javascript
export const ANALYSIS_CONFIG = {
  // 1) Bean 동적 주입 추출 대상 Context 클래스명 (Spring ApplicationContext 등)
  BEAN_CONTEXT_CLASSES: ['ApplicationContext', 'WFApplicationContext'],
  
  // 2) 대외계 연계 전문(MCI) 클래스 식별 접두사 목록
  MCI_PREFIXES: ['IF_', 'IFVN', 'MCI_'],
  
  // 3) Android Native 소스 내 ScreenID 열거형(Enum) 정의 위치 상대경로
  KOTLIN_SCREEN_SUBPATH: 'common/src/main/java/com/example/app/screeninfo',
};
```

---

## 2. 원본 메타데이터(MCI / DB 정의서) 연동 규격

분석기(`npm run build:data`) 실행 시 `src/extern/raw/` 폴더에 위치한 텍스트 파일들을 자동으로 읽어 다국어(한국어, 영어, 베트남어)가 결합된 내장 SQLite DB로 빌드합니다.

### 2.1 대외계 인터페이스 명세 (`src/extern/raw/mci/IFList_*.txt`)
- 파일명 규칙: `IFList_YYYY-MM-DD.txt` 또는 `IFList_sample.txt` (탭 `\t` 구분자 TSV 형식)
- 컬럼 포맷:
  ```text
  TOBE ID	Action Iteam No.	ASIS ID	I/F Name(KR)	I/F Name(EN)	IN/OUT
  IF_MCI_USER_001	ACT-001	LEGACY_USER_INQ	회원 기본정보 조회	Inquire User Profile	OUT
  IF_MCI_ORD_001	ACT-002	LEGACY_ORD_REQ	주문 결제 승인 요청	Request Order Payment	OUT
  ```

### 2.2 DB 테이블 정의서 (`src/extern/raw/table/table_*.txt`)
- 파일명 규칙: `table_YYYY-MM-DD.txt` 또는 `table_sample.txt` (탭 `\t` 구분자)
- 컬럼 포맷:
  ```text
  OWNER	TABLE_NAME	COMMENTS
  SAMPLE_DB	TB_USER_M	회원 기본 마스터 테이블
  SAMPLE_DB	TB_ORDER_M	주문 마스터 테이블
  ```

### 2.3 DB 컬럼 정의서 (`src/extern/raw/table/column_*.txt`)
- 파일명 규칙: `column_YYYY-MM-DD.txt` 또는 `column_sample.txt` (탭 `\t` 구분자)
- 컬럼 포맷:
  ```text
  OWNER	TABLE_NAME	COLUMN_ID	COLUMN_NAME	TYPE	LENGTH	SCALE	PK	NULLABLE
  SAMPLE_DB	TB_USER_M	USER_ID	회원 고유 식별자	VARCHAR2	32		Y	N
  SAMPLE_DB	TB_USER_M	USER_NAME	회원 성명	VARCHAR2	100		N	N
  ```

### 2.4 다국어 번역 캐시 (`src/extern/raw/translation/translation_cache.json`)
새로운 한글/영문/베트남어 단어가 감지되면 `todo_translate.json`에 적재되며, `translation_cache.json`에 아래와 같이 등록하여 즉시 영구 캐싱할 수 있습니다:
```json
{
  "회원 기본 마스터 테이블": {
    "original": "회원 기본 마스터 테이블",
    "ko": "회원 기본 마스터 테이블",
    "en": "User Master Table",
    "vi": "Bảng chính người dùng"
  }
}
```

---

## 3. Jenkins CI/CD 무인 자동화 배포 설정

사내 Jenkins 서버에서 주기적으로 빌드 리포트를 자동 배포하고자 할 경우 `script/jenkins.groovy` 파이프라인 템플릿을 사용합니다:

1. **Jenkins 파이프라인 매개변수 설정**:
   - `GIT_BASE_URL`: 프로젝트 소스코드들이 위치한 Git 서버 베이스 주소
   - `GIT_CREDENTIALS_ID`: Jenkins에 등록된 Git 자격증명 ID
   - `DEPLOY_DIR`: 최종 결과물(`report/`)을 서비스할 Nginx 웹 루트 경로
2. **배포 방식**:
   - 빌드 노드(`build-node`)에서 대상 소스 체크아웃 후 `npm run build` 실행
   - 웹 서버 노드(`web-node`)로 정적 웹 산출물을 `unstash`하여 즉각 무중단 서비스
