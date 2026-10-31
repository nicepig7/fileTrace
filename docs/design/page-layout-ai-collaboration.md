# PageLayout 구조화 및 Human-AI 협업 아키텍처 가이드

본 문서는 TraceFile 프로젝트의 화면(Page) 공통 레이아웃 구조 개편 배경과 Human-AI 협업 효율성을 극대화하기 위한 설계 원칙을 정리한 문서입니다.

---

## 1. 배경 및 문제 의식

### 1.1 기존 구조의 한계
- 기존 시스템 구조: `MainScreen` -> `LeftFrame` (사이드바 메뉴) + `BodyFrame` (`router-view`)
- `BodyFrame` 내부에서 각 도메인 페이지(`ApiPage`, `TablePage`, `MciPage`)가 렌더링됨.
- **중복 및 관심사 혼재**:
  1. 각 페이지마다 외곽 flex 래퍼(`height: 100%`, `overflow: hidden`, `min-width: 0` 등)를 매번 별도로 구현.
  2. 상단 헤더(`ApiHeader`, `TableHeader`, `MciHeader`)에서 좌측 타이틀 영역(아이콘 + 페이지명)이 각각 하드코딩되어 중복 관리됨.
  3. `LeftFrame.vue`의 사이드바 메뉴 또한 라우터 설정과 분리되어 하드코딩됨 (동기화 누락 위험).

### 1.2 목표
- **도메인 개발자의 관심사 분리**: 화면 개발 시 외곽 CSS 배치나 공통 헤더 규격에 신경 쓰지 않고, **"이 페이지의 데이터 및 특화된 컨트롤/컨텐츠"**에만 집중.
- **Single Source of Truth (SSOT)**: 라우터/메뉴 설정을 단일 원천으로 관리하여 사이드바 메뉴, 상단 타이틀/아이콘, 브라우저 탭 타이틀이 자동 동기화되도록 구성.

---

## 2. AI-Native 관점에서의 공통화 분석 (토큰 및 인지 부하)

이 프로젝트는 AI Agent와 인간 개발자가 긴밀하게 협업하는 프로젝트입니다. 이 환경에서 컴포넌트 추상화가 갖는 득과 실을 분석하여 최적의 균형점을 도출했습니다.

### 2.1 토큰 효율성 (Token Efficiency)
- **공통화 미적용 시**: AI가 페이지를 생성하거나 수정할 때마다 50~100줄의 외곽 CSS와 헤더 마크업을 매번 입출력 토큰으로 소모함. 레이아웃 미세 버그(CSS flex 스크롤 버그 등) 발생 시 디버깅 대화로 수만 토큰이 추가 낭비됨.
- **공통화 적용 시**: 공통 레이아웃을 껍데기(`PageLayout`)로 캡슐화하면, 페이지 컴포넌트의 크기가 대폭 축소되어 컨텍스트 읽기 및 파일 diff 수정 토큰이 크게 절감됨.

### 2.2 AI 인지 부하 및 환각 방지 (Cognitive Load & Predictability)
- **과도한 만능(Black-box) 추상화의 위험**: 검색창, 필터, 버튼 핸들러까지 모두 props/config로 받아서 내부에서 처리하는 복잡한 컴포넌트는 AI가 데이터 흐름을 파악하기 어렵게 만들어 탐색 비용과 환각을 유발함.
- **선언적 얕은 껍데기(Thin Layout Shell)의 우수성**:
  - `PageLayout`은 오직 **"헤더 좌측(타이틀/아이콘) + 우측 슬롯(#actions) + 본문 슬롯(#default)"**의 시각적 뼈대만 제공.
  - 비즈니스 상태(`searchQuery`)와 이벤트 핸들러는 각 페이지 컴포넌트 안에 명시적으로 유지하여 데이터 흐름(Data Flow)을 한눈에 파악 가능하게 함.

---

## 3. 핵심 설계 원칙 (3대 원칙)

1. **Thin Shell & Explicit Slots (얕은 껍데기와 명시적 슬롯)**
   - 레이아웃 컴포넌트는 비즈니스 로직을 삼키지 않고 배치와 스타일만 책임집니다.
   - 슬롯 인터페이스:
     - `#title` (선택 사항: 미지정 시 현재 route.meta의 title/icon 자동 렌더링)
     - `#actions` (페이지 고유의 검색창, 필터, 버튼 영역)
     - `#default` (페이지 본문 영역, Master-Detail 등)
2. **단일 진실의 원천 (SSOT via Route Meta)**
   - 라우터 정의(`route.meta`) 또는 중앙 메뉴 설정(`menuConfig.js`)에서 메뉴명, 아이콘, 경로를 선언.
   - `LeftFrame`(사이드바)과 `PageLayout`(상단 헤더)이 이 메타데이터를 공통 참조.
3. **One-Shot 참조 레퍼런스 확립**
   - 표준화된 페이지 구조를 하나 마련해두면, 인간 개발자가 AI에게 *"PageLayout을 사용해서 XxxPage 만들어줘"*라는 단 한 줄의 프롬프트로 고품질의 코드를 즉시 얻을 수 있음.

---

## 4. 컴포넌트 사용 예시 (Template Pattern)

```html
<template>
  <PageLayout>
    <!-- 1. 페이지별 특화 헤더 액션 -->
    <template #actions>
      <div class="search-box">
        <input v-model="searchQuery" placeholder="Search..." />
      </div>
      <button @click="handleAction">Action</button>
    </template>

    <!-- 2. 페이지 본문 콘텐츠 -->
    <div class="page-content">
      <MasterSection />
      <DetailSection />
    </div>
  </PageLayout>
</template>

<script setup>
import PageLayout from '@common/compo/layout/PageLayout.vue';
// ... 페이지 로직
</script>
```

---

## 5. 공통 컴포넌트 카탈로그 & 상세 가이드
- 프로젝트 전반에서 재사용 가능한 모든 공통 컴포넌트(`PageLayout`, `LoadingBox`, `ErrorBox`, `EmptyBox`, `TooltipPopover`)와 아이콘 시스템에 대한 상세 명세 및 코드 예시는 [src/common/compo/README.md](../../src/common/compo/README.md)를 참고하세요.
