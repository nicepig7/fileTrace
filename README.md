# TraceFile 정적 분석 및 대화형 웹 뷰어 (TraceFile Analysis Project)

TraceFile은 Java 백엔드 소스 코드와 MyBatis DBIO 파일을 정적 분석하여 **대외 인터페이스(MCI) 호출 이력**, **Controller-Service 매핑**, **DB Mapper 쿼리 내역**, **클라이언트(Vue/Android) 화면 연계**를 추출하고 이를 고성능 웹 대시보드로 시각화하는 통합 프로젝트입니다.

---

## 🚀 빠른 시작 (Quick Start)

단일 `package.json` 환경에서 백엔드 정적 분석과 프론트엔드 웹 뷰어 개발을 모두 제어할 수 있습니다.

### 1. 패키지 설치
```bash
npm install
```

### 2. 로컬 웹 뷰어 실시간 개발 서버
```bash
npm run dev
```

### 3. 백엔드 정적 분석 단독 실행
전 계층(Backend, Frontend, Mobile) 소스코드 분석을 수행하여 `public/data.sqlite` 로컬 데이터베이스를 갱신합니다.
```bash
npm run build:data
```

### 4. 전체 통합 빌드 (분석 + Vite 프로덕션 빌드)
```bash
npm run build
```
- `npm run build:data`가 먼저 실행된 후, `npm run build:report`가 순차적으로 실행되어 `report/` 폴더에 최종 정적 웹사이트를 생성합니다.

---

## ⚙️ 설정 및 커스터마이징 (Configuration)

자신의 조직이나 프로젝트 환경(타깃 소스 디렉토리, 형상관리 GitLab/GitHub 주소, 파서 규칙)에 맞게 손쉽게 변경할 수 있습니다:

- 상세 가이드: **[docs/config-guide.md](./docs/config-guide.md)**
- 핵심 설정 파일: **[src/common/config/config.js](./src/common/config/config.js)**

### 환경 변수를 통한 분석 대상 소스 지정
```bash
# 환경 변수 또는 CLI 인자로 타깃 프로젝트의 소스 경로 주입
export TARGET_DIR="/path/to/backend/src"
export VUE_TARGET_DIR="/path/to/frontend/src"
export AOS_TARGET_DIR="/path/to/android"

npm run build:data
```

---

## 📚 문서 가이드 (Documentation)

시스템의 세부 설계, 컴포넌트 규격, 스타일 시스템 및 AI 협업 가이드는 아래 문서를 참조하세요:

| 문서 구분 | 링크 | 주요 내용 |
| :--- | :--- | :--- |
| **설정 및 커스터마이징 가이드** | [docs/config-guide.md](./docs/config-guide.md) | 프로젝트 등록, 원격 URL 설정, 파서 규칙 및 메타데이터 형식 안내 |
| **시스템 아키텍처** | [docs/architecture.md](./docs/architecture.md) | 1레벨 폴더 아키텍처, 빌드 파이프라인 및 Jenkins CI/CD 배포 |
| **분석 결과 & 뷰어 기능** | [docs/features.md](./docs/features.md) | 생성 아티팩트 SQLite 명세 및 대화형 뷰어 UI 주요 기능 |
| **공통 컴포넌트 카탈로그** | [src/common/compo/README.md](./src/common/compo/README.md) | `PageLayout`, `BaseIcon`, `TooltipPopover`, `Box` 카탈로그 및 템플릿 |
| **스타일 시스템 가이드** | [src/common/style/README.md](./src/common/style/README.md) | Vanilla SCSS `@layer` (Cascade Layers) 계층 구조 및 토큰 규칙 |
| **Human-AI 협업 가이드** | [docs/design/page-layout-ai-collaboration.md](./docs/design/page-layout-ai-collaboration.md) | 레이아웃 추상화 배경 및 AI 에이전트 인지 부하/토큰 최적화 원칙 |
| **프로젝트 개발 사례 연구** | [docs/summary/README.md](./docs/summary/README.md) | AI 페어 프로그래밍 실전 사례, 생산성 분석 및 협업 노하우 |
| **TODO & 로드맵** | [docs/todo/ideas.md](./docs/todo/ideas.md) | 가짜 Swagger, 미사용 API 탐지 등 차기 고도화 아이디어 |

---

## 📝 릴리스 및 변경 이력 (Changelog)

버전별 상세 릴리스 노트와 변경 이력은 단일 진실의 원천인 **[CHANGELOG.md](./CHANGELOG.md)**에서 전체 히스토리를 확인하실 수 있습니다.

- **최신 릴리스**: `v0.6.3`
- 전체 버전 로그는 [CHANGELOG.md](./CHANGELOG.md)를 참고하세요.