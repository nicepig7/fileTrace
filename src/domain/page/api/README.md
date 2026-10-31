# API Flow Page

API의 엔드포인트부터 서비스, DB(DBM), MCI(외부연계) 등 백엔드의 전체 호출 흐름과 클라이언트(Web, AOS) 연계 정보를 트리 구조로 시각화하여 제공하는 도메인 페이지입니다.

## 주요 구성 요소
- **ApiPage**: SQLite 데이터베이스 기반으로 설계된 API 흐름 최상위 화면입니다.
  - **ApiHeader**: 프로젝트 세그먼트 토글, 패키지 셀렉터, 딥 서치 검색창이 포함된 상단 제어 바입니다.
    - **ProjectSegmentToggle**: 프로젝트(MBW, COR, ADM) 선택 세그먼트 컨트롤입니다. `v-model` 양방향 바인딩, 재클릭 시 전체(ALL) 해제 토글, 전체/단일 선택 하이라이팅을 제공합니다.
  - **ApiBody**: 엔드포인트 목록을 렌더링하고, 무한 스크롤 및 지연 로딩 처리합니다.
  - **EndpointCard**: 각 엔드포인트의 URL, HTTP Method, 연계된 Data(DBM/MCI) 및 Client(WEB/AOS) 뱃지를 표시하고 아코디언 형태로 토글합니다.
  - **ApiTreeNode**: SQLite의 모델 구조(`node.queryName`, `node.mciAsisId` 등)에 맞게 백엔드 호출 흐름을 그리며, 클래스명 클릭 시 GitLab 소스코드로 바로 이동(딥링크)할 수 있는 기능을 제공합니다.
  - **DbmNodeBadge & MciNodeBadge**: 트리의 노드에 삽입되어 데이터베이스 쿼리 속성이나 외부 인터페이스 정보를 시각적으로 제공합니다.

## 변경 사항 및 특징
- 실시간 필터 및 딥 서치를 지원하기 위해 초기에 DB 조회 데이터를 메모리 트리에 Pre-load 합니다.
- **아키텍처**: SQLite(`fd_endpoint_info`, `fd_method_info`, `fd_method_calls` 등)에서 데이터를 읽어와서 Pinia Store(`useApiStore`)를 거쳐 뷰로 전달됩니다.
- **Look & Feel 동기화**: `EndpointCard.vue`의 아코디언을 열었을 때, 첫 진입점이 되는 CTR (Controller) 노드부터 렌더링을 시작하여, 직관적인 폴더/트리형 계층 구조와 배지(Badge) 스타일을 제공합니다.
