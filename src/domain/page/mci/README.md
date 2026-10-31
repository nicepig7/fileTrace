# MCI Interface Page (`src/domain/page/mci`)

이 모듈은 MCI(대내외 연계 인터페이스) 리스트 및 각 인터페이스 클래스가 프로젝트 내에서 어떻게 호출되고 최종 API(Endpoint)와 연결되는지를 시각화하는 페이지입니다.

## 주요 구성 요소
- **MciPage**: SQLite DB를 활용하여 재귀 CTE 쿼리를 통해 런타임에 동적으로 대외 연계 API 흐름을 역추적하고 맵핑하는 마스터 페이지
- **MciMasterSection**: 좌측 패널 (MCI 리스트 및 Mapped Only 필터 지원)
- **MciDetailSection**: 우측 패널 (선택된 MCI의 상세 분석 데이터 및 연관 In/Out API 등을 아코디언 컴포넌트로 표시)
- **MciHeader**: 상단 검색 및 툴바 영역
- **ApiCard**: API 정보 출력용 공통 UI (MCI 및 Table 페이지 공동 사용)
