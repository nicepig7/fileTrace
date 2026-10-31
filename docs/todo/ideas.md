# 프로젝트 고도화 및 신규 기능 아이디어 (TODO)

본 문서는 TraceFile 프로젝트의 다음 기능 개발(Feature)을 위한 아이디어 스케치와 투두(TODO) 리스트를 정리한 문서입니다. 새로운 기능을 실험할 때는 반드시 `temp/{category}` 폴더 하위에서 PoC(Proof of Concept)를 먼저 진행합니다.
UI 화면 개발 시에는 [공통 컴포넌트 활용 가이드](../../src/common/compo/README.md)의 규격을 준수하여 일관된 디자인과 AI 친화적인 템플릿 패턴을 적용합니다.

## 1. 가짜 Swagger (API 문서 자동화) 및 DTO 분석 고도화 🌟
- **개요**: 컨트롤러의 URL(`report_ctr.json`) 추출 기능을 발전시켜, Swagger(OpenAPI)와 유사한 API 명세서 UI를 뷰어 내에 구현.
- **상세 내용**:
  - **DTO 파싱 고도화**: 컨트롤러 메서드의 파라미터(`@RequestBody`, `@RequestParam`) 및 리턴 타입으로 사용되는 DTO(Data Transfer Object) 클래스 내부를 분석.
  - **Mock 데이터 생성**: 추출된 Request/Response 스키마(필드명, 타입)를 바탕으로 대시보드 화면에 가짜 JSON 데이터를 출력.
- **기대 효과**: 실제 백엔드 서버를 띄우거나 별도의 Swagger 설정 없이도 최신 소스코드 기반의 API 명세서를 프론트엔드 개발자 및 기획자에게 제공 가능.

## 3. 미사용 API (Dead Code) 탐지 기능
- **개요**: 백엔드의 전체 API 목록과 클라이언트(Vue/Android)에서의 호출 내역을 교차 검증(Cross-check)하여 미사용 코드를 식별.
- **상세 내용**:
  - `report_ctr.json`에 정의된 백엔드 API 중, `report_vue.json` 및 `report_android.json` 그 어디에서도 호출하지 않는 "미사용 의심(좀비) API" 목록을 도출하여 대시보드에 리포팅.
- **기대 효과**: 레거시 코드를 안전하게 정리하고 시스템을 다이어트하여 유지보수성 향상.
