# Base Utilities (`src/base/util/`)

`src/base/util/`은 특정 비즈니스 도메인이나 화면 로직에 종속되지 않는 **순수/범용 유틸리티(Pure General Utilities)**들을 모아둔 모듈입니다.

---

## 🎯 설계 원칙 (Design Principles)

1. **도메인 무의존성 (Domain Agnostic)**:
   - 비즈니스 도메인(`mci`, `git`, `vue`, `dbm` 등) 및 프로젝트 특화 상태에 대한 의존성을 갖지 않습니다.
   - 다른 프로젝트나 독립 모듈로 추출해도 즉시 사용할 수 있는 범용적인 입출력 함수들로 구성됩니다.
2. **순수 함수 지향 (Pure Functions)**:
   - 부수 효과(Side-effect)를 최소화하고, 명확한 파라미터와 반환값을 제공합니다.
3. **간결성 및 모듈화 (Modularity)**:
   - 기능별(파일 I/O, 날짜 포맷, 문자열 가공 등)로 명확히 분리하여 관리합니다.

---

## 🧭 모듈 구성 및 API (Module Catalog)

| 파일명 | 환경 | 주요 역할 | 주요 함수 |
| :--- | :--- | :--- | :--- |
| [`dateUtils.js`](./dateUtils.js) | Isomorphic (Node/Browser) | 타임스탬프 문자열 포맷팅 | `getTimestamp()`, `getTimestampStr()` |
| [`fileUtils.js`](./fileUtils.js) | Node.js Runtime | 파일 탐색, JSON 로드/저장, Git 루트 탐색 | `findFilesByExtension()`, `findGitRoot()`, `loadJsonSafe()` |
| [`stringUtils.js`](./stringUtils.js) | Isomorphic (Node/Browser) | 패키지명/FQDN 파싱 및 문자열 처리 | `getSimpleName()` |

---

## 📝 상세 API 설명

### 1. `dateUtils.js`
날짜 및 시간 정보를 고정 포맷 문자열로 변환합니다.

- **`getTimestamp()`**: `YYYYMMDDHHmmss` 형식의 14자리 타임스탬프 반환 (예: `20260905143000`).
- **`getTimestampStr()`**: `YYYYMMDD_HHmm` 형식의 타임스탬프 반환 (예: `20260905_1430`). 주로 엑셀 내보내기 파일명 등에 사용.

### 2. `fileUtils.js`
Node.js 파일 시스템(`fs/promises`) 기반의 범용 파일 I/O 헬퍼입니다.

- **`findFilesByExtension(dir, ext, fileList = [])`**: 특정 디렉토리를 재귀적으로 순회하여 주어진 확장자(`ext`)를 가진 파일 경로 배열을 반환합니다.
- **`findGitRoot(startDir)`**: 주어진 디렉토리부터 상위 디렉토리로 거슬러 올라가며 `.git` 디렉토리가 존재하는 최상위 Git 저장소 루트를 찾습니다.
- **`loadJsonSafe(filePath, defaultData)`**: 지정된 경로의 JSON 파일을 안전하게 읽어 파싱하며, 파일이 없거나 파싱 실패 시 에러를 기록하고 기본값을 반환합니다.

### 3. `stringUtils.js`
문자열 변환 및 가공을 위한 헬퍼 함수를 제공합니다.

- **`getSimpleName(fqdn)`**: Dot(`.`)으로 구분된 전체 클래스/패키지 경로(FQDN)에서 마지막 심볼/클래스명만 추출합니다.
  - 예: `"com.example.service.UserService"` → `"UserService"`
