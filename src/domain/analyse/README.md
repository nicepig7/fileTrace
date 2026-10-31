# Analyse Domain

이 디렉토리는 어플리케이션의 정적 분석(Static Analysis)을 수행하고 호출 그래프(Call Graph)를 생성하기 위한 핵심 파서 및 로직들을 포함하고 있습니다.

## Directory Structure

최신 V2 아키텍처(통합 그래프 모델)에 따라, 파서들은 다음과 같이 분석 대상 노드(Node) 단위로 명확하게 분리되어 있습니다.

- **`class/`**: 통합 그래프 상의 "클래스(Class)" 노드를 식별하기 위한 전담 폴더입니다.
  - Java(Spring Boot), Vue, Kotlin 등 모든 언어의 소스코드를 파싱하여 클래스 정보(`ClassDTO`)와 내부 메서드 호출망을 추출합니다.
  - **Java 분석 상세**: 동명이인 클래스 충돌 방지 및 메서드 오버로딩 구분을 위해 AST 구문을 분석하여 **FQN(전체 패키지명)**과 **메서드 파라미터 개수(시그니처)**를 추출하고 이를 고유 식별 키로 사용합니다.
  - **의존성 주입(DI) 추적**: 클래스 필드 선언(AST) 및 `WFApplicationContext.getBean` 동적 할당(Regex)을 복합적으로 분석하여 `Service`, `DAO` 등의 호출 관계를 누락 없이 추적합니다.
- **`dbio/`**: 통합 그래프 상의 "데이터베이스(DB)" 쿼리 노드를 식별하기 위한 전담 폴더입니다.
  - 마이바티스(MyBatis) 등 XML 기반의 매퍼 파일을 파싱하여 쿼리 유형 및 테이블 정보를 추출합니다.
- **`kotlin/`**: 구 `android` 폴더를 개편한 곳으로, Android/Kotlin 네이티브 전용 모듈과 종속성 스캔 등 특수 파싱 역할을 수행합니다.
- **`vue/`**: 프론트엔드 전용 모듈과 Vue SFC 컴포넌트 특수 파싱을 담당합니다.

## Entry Point

- **`AnalysisRunner.js`**: `buildData.js`에서 직접 호출되는 진입점으로, 등록된 모든 프로젝트에 대해 각 영역별 파서(`runClassTrace`, `runDbioTrace`, `runKotlinTrace`, `runVueTrace`)를 비동기 병렬로 실행하고 데이터를 취합합니다.
- **`AnalyseLogger.js`**: 분석에 소요된 통계 정보를 가공하여 콘솔에 깔끔하게 출력하는 로직을 담고 있습니다.
