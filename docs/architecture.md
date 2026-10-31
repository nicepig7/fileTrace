# 🏛️ TraceFile 시스템 아키텍처 및 상세 기능

이 문서는 TraceFile 분석 스크립트 프로젝트의 구조적 설계, CI/CD 파이프라인, 그리고 상세 기능에 대해 설명합니다.

---

## 📂 프로젝트 구조 및 주요 파일 역할

유지보수와 확장을 위해 프론트엔드(Vue 3)와 백엔드(Node.js) 코드가 하나의 프로젝트 안에서 기능별 1레벨 구조로 통합 배치되어 있습니다.

### 📁 1레벨 폴더 구조 설계 원칙
향후 리팩토링 및 소스코드 생성 시 아래의 폴더별 역할을 엄격히 준수하여 코드를 배치합니다.

- **`assets/`** : 정적 요소들 (이미지, 글로벌 SCSS 파일, 표준 SVG 아이콘 컴포넌트)
- **`base/`** : 기반 기술 요소들 (파일 입출력, 날짜/문자열 조작 등 비즈니스 로직과 무관한 코어 유틸리티)
- **`common/`** : 프로젝트의 공통 기능 (설정 파일, 전역 컴포넌트, 공통 상수 등 프로젝트 전반에서 공유되는 자원)
- **`domain/`** : 각 기능 피처 (핵심 비즈니스 로직을 기능 단위로 분리하여 관리. 예: `analyse`, `report` 등)
- **`extern/`** : 프로젝트 형상 외부의 정보를 조회할 때 사용 (외부 연계, 외부 시스템 파일 접근, 외부 API 호출 등)

```text
traceFile/
├── package.json           # 전체 의존성 관리 및 NPM 스크립트 (Vite 등)
├── vite.config.js         # 뷰어 UI 통합 빌드 설정 (alias 설정 포함)
├── jsconfig.json          # IDE 인텔리센스용 alias 설정
├── index.html             # 뷰어 최상위 진입점 (Vite Entry)
├── public/                # 정적 에셋 및 생성된 SQLite DB (data.sqlite) 위치
├── report/                # 최종 결과물 배포 폴더 (index.html, 빌드된 에셋 및 DB)
└── src/
    ├── buildData.js       # [백엔드] 분석기 실행 스크립트 (Entry Point)
    ├── main.js            # [프론트엔드] Vue 3 앱 진입점 및 마운트 설정
    ├── App.vue            # [프론트엔드] 뷰어 최상위 래퍼 컴포넌트
    ├── assets/            # [프론트엔드] 정적 자원
    │   └── icon/          # 전역 표준 SVG 아이콘 컴포넌트 (Tree-shaking 지원)
    ├── base/              # [백엔드] 기반 기술 요소들 (파일 입출력 등 공통 유틸리티)
    ├── common/            # [프론트엔드/공통] 공통 설정, 컴포넌트, 스타일
    │   ├── config/        # 프로젝트 전역 환경 설정 및 단일 라우터/메뉴 SSOT (menuConfig.js)
    │   ├── compo/         # 재사용 가능한 공통 UI 컴포넌트 (Hub & Spoke 카탈로그)
    │   │   ├── box/       # 범용 상태 표시 박스 (LoadingBox, ErrorBox, EmptyBox)
    │   │   ├── icon/      # 전역 아이콘 표준 래퍼 (BaseIcon.vue)
    │   │   ├── layout/    # 공통 화면 표준 레이아웃 컨테이너 (PageLayout.vue)
    │   │   └── overlay/   # 뷰포트 플로팅 오버레이 (TooltipPopover.vue)
    │   ├── router/        # Vue Router 설정
    │   ├── style/         # Vanilla SCSS @layer 아키텍처 (reset, base, theme, compo, module)
    │   └── screen/        # 메인 스크린 템플릿
    │       └── frame/     # 레이아웃을 구성하는 프레임 (HeadFrame, LeftFrame, BodyFrame)
    ├── domain/            # 각 기능 도메인 영역
    │   ├── analyse/       # [백엔드] 핵심 정적 분석 처리 모듈 (Java, Vue, Android, DBIO 분석기)
    │   ├── module/        # 도메인 스코프 독립 모듈 (tableTooltip, mciTooltip 등)
    │   ├── page/          # [프론트엔드] 도메인별 화면(페이지) 컴포넌트
    │   │   ├── api/       # API 종단간 플로우 (ApiPage, section/, compo/)
    │   │   ├── mci/       # 대외계 전문 매핑 (MciPage, section/, compo/)
    │   │   └── table/     # DB 테이블 맵핑 (TablePage, section/, compo/)
    │   └── store/         # [프론트엔드] Pinia 상태 관리 (useApiStore, metadataStore 등)
    └── extern/            # 외부 시스템 연계 및 데이터베이스 생성(SQLite) 관련 모듈
```

---

## ⚙️ CI/CD (Jenkins) 자동 배포

본 프로젝트는 Jenkins 파이프라인과 결합하여 분석 리포트 생성을 완전 자동화할 수 있습니다.

- **빌드 노드(`dev-build`)**: 타겟 프로젝트(MBW, ADM, COR)와 본 분석기를 Checkout 한 뒤, 환경 변수(`TARGET_DIR`, `VUE_TARGET_DIR`, `COR_TARGET_DIR` 등)를 주입하여 `npm run build`를 수행합니다. (`Jenkins Pipeline from SCM` 방식 활용)
- **배포 노드(`dev-web`)**: 분석이 완료된 `report/` 결과물을 Nginx Document Root (예: `/app/shared/codereport/mbw/`)로 전송(Unstash)하여, 누구나 웹 URL을 통해 최신 아키텍처 상태를 확인할 수 있습니다.
