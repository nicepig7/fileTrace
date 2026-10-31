# Table Page Domain

데이터베이스 테이블 목록과 관련 사용처(API, DBIO 쿼리)를 조회하고 시각적으로 탐색할 수 있는 도메인 페이지입니다.

## 기능 설명

- **테이블 마스터/디테일 뷰**: 좌측 마스터 리스트에서 테이블을 선택하고, 우측 상세 패널에서 연관 정보를 확인하는 구조입니다.
- **마스터 패널 접기/펼치기**: 넓은 화면에서 컬럼 및 연관 정보를 확인할 수 있도록 마스터 패널 토글(Collapse) 버튼을 제공합니다.
- **탭 기반 상세 정보 분리**:
  - **Columns 탭**: `fd_column_info`와 연동하여 컬럼 속성(PK, 데이터 타입, Null 여부, 한/영/베트남어 설명 등)을 테이블 형태로 제공하며, 검색어 일치 시 하이라이팅을 적용합니다.
  - **Relations 탭**: 해당 테이블이 사용되는 DBIO 쿼리 목록과 직/간접 연관 API 목록을 아코디언 형태로 제공합니다.
- **연관 API 및 DBIO 쿼리 조회**: 테이블을 참조하는 API 및 DBIO 쿼리 목록(Total/Read/CUD 통계)을 확인하고, 클릭 시 API 상세 페이지 이동 또는 GitLab 소스코드(.dbio) 라인으로 바로 이동(Deep Link)할 수 있습니다.
- **검색 및 필터링**: 테이블명, 한글/영문/베트남어 테이블 설명, 컬럼명, 연관 API URL 및 DBIO 파일명까지 포괄하는 딥 서치(Deep Search)를 지원합니다.
- **Excel 내보내기**: 상단 Options 드롭다운을 통해 현재 조회 중인 전체 테이블 목록 또는 선택된 특정 테이블의 상세 컬럼 정의서를 Excel(`.xlsx`) 파일로 다운로드할 수 있습니다.

## 컴포넌트 구조

- `TablePage.vue`: SQLite 기반 통합 스키마(`data.sqlite`)와 `useTableStore`를 사용하여 실시간으로 DB 데이터를 쿼리하는 최상위 컨테이너 페이지 컴포넌트입니다. 상태 관리 및 마스터-디테일 레이아웃을 구성합니다.
- `section/TableHeader.vue`: 테이블/컬럼/API 딥 서치 검색창 및 Excel 다운로드(목록/정의서) 옵션 드롭다운이 포함된 헤더 영역입니다.
- `section/TableMasterSection.vue`: 테이블 목록을 렌더링하고, 키보드 네비게이션 및 선택 상태를 관리하는 좌측 패널입니다.
- `section/TableDetailSection.vue`: 선택된 테이블의 기본 정보, Columns/Relations 탭 전환, 컬럼 목록 표(하이라이팅 연동), DBIO 쿼리 및 연관 API 목록을 표시하는 우측 상세 패널입니다. (다중 프로젝트 환경에서 정확한 GitLab 소스 오픈을 위해 DBIO 쿼리의 `projectId`를 함께 전달)
- `compo/TableListItem.vue`: 마스터 리스트 내 개별 테이블 항목 렌더링 컴포넌트입니다.
- `compo/TableDbmCard.vue`: 연관된 단일 DBIO 쿼리 정보를 표현하는 카드 컴포넌트입니다. 쿼리 타입(select/insert/update/delete), 쿼리명, DBIO 파일명을 직관적으로 제공합니다.
- `@common/compo/card/ApiCard.vue`: 연관된 단일 API 정보를 표현하는 공통 카드 컴포넌트입니다.
