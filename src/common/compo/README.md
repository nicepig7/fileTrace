# Common Components Catalog & Architecture Guide

본 문서는 TraceFile 프로젝트의 공통 컴포넌트(`src/common/compo/`) **색인(Catalog)** 및 **설계 원칙**을 정의하는 허브(Hub) 문서입니다.

인간 개발자 및 AI Agent는 새로운 컴포넌트를 설계하거나 기존 컴포넌트를 활용할 때 본 가이드를 준수합니다.

---

## 🎯 공통 컴포넌트 설계 원칙 (Component Philosophy)

1. **상황 및 목적별 분리 지향 (Avoid Props Bloat)**:
   - 하나의 컴포넌트에 수많은 boolean/mode props를 추가하여 모든 케이스를 커버하려 하지 않습니다.
   - 공통 표준 인터페이스(일관된 Props/Event/CSS 토큰 규칙)를 유지하되, **사용 목적과 상황에 따라 명확한 별도 컴포넌트로 분리**하여 만듭니다.  
     *(예: 만능 Button 하나에 옵션을 누적하기보다, `MainButton`, `NormalButton`, `ActionButton` 등 사용처에 특화된 직관적인 컴포넌트로 분리)*
2. **바퀴의 재발명 금지 (Don't Reinvent the Wheel)**:
   - 레이아웃, 상태 박스, 툴팁 등 기본 UI 인프라는 이미 준비된 공통 컴포넌트를 최우선으로 활용합니다.
3. **문서 동기화 (Hub & Spoke Colocation)**:
   - 최상위 `readme.md`는 전체 컴포넌트의 **색인(Hub)** 역할을 유지하여 비대화를 방지합니다.
   - 각 컴포넌트의 구체적인 Props, Slots, 다양한 예제는 **각 컴포넌트 디렉토리의 개별 설명서(Spoke)**에 분리 관리합니다.

---

## 🧭 컴포넌트 카탈로그 (Component Catalog)

| 카테고리 | 컴포넌트명 | 위치 | 주요 역할 및 사용처 | 상세 가이드 |
| :--- | :--- | :--- | :--- | :--- |
| **Layout** | `PageLayout` | `@common/compo/layout/PageLayout.vue` | 화면 최외곽 표준 flex 컨테이너, Glassmorphism 헤더(타이틀/아이콘/액션) 및 스크롤 경계 제공 | [layout/README.md](./layout/README.md) |
| **Icon** | `BaseIcon` | `@common/compo/icon/BaseIcon.vue` | 아이콘 크기/색상/정렬 표준화 및 100% Tree-shaking 보장 단일 prop 래퍼 | [icon/README.md](./icon/README.md) |
| **State Box** | `LoadingBox` | `@common/compo/box/LoadingBox.vue` | 데이터 비동기 로딩, 파싱 진행 중 스피너 애니메이션 표시 | [box/README.md](./box/README.md) |
| **State Box** | `ErrorBox` | `@common/compo/box/ErrorBox.vue` | 오류/예외 발생 시 경고 아이콘, 에러 메시지 및 트러블슈팅 안내 표시 | [box/README.md](./box/README.md) |
| **State Box** | `EmptyBox` | `@common/compo/box/EmptyBox.vue` | 검색 결과 없음, 데이터 빈 상태 안내 표시 | [box/README.md](./box/README.md) |
| **Overlay** | `TooltipPopover` | `@common/compo/overlay/TooltipPopover.vue` | 마우스 호버 시 뷰포트를 뚫고 나오는 플로팅 툴팁/팝오버 (`<Teleport>` 기반) | [overlay/README.md](./overlay/README.md) |
| **Card** | `ApiCard` | `@common/compo/card/ApiCard.vue` | 연관 API 정보(Method, URL, 설명, 연계 뱃지 등)를 출력하는 범용 카드 (MCI/Table 공통) | - |
| **Text** | `HighlightedText` | `@common/compo/text/HighlightedText.vue` | 텍스트 내 검색어 일치 구간을 시각적으로 강조(형광펜)하는 텍스트 래퍼 | - |

---

## 🤖 AI Agent 작업 시 핵심 원칙 (Agent Rules)

1. **프롬프트가 모호하거나 레이아웃 언급이 없더라도**:
   - 새 페이지를 만들 때는 항상 `<PageLayout>`을 기본 외곽 껍데기로 사용합니다.
   - 데이터 로딩/에러/빈 상태 처리는 `div`로 직접 스타일링하지 않고 `LoadingBox`, `ErrorBox`, `EmptyBox`를 조합합니다.
   - 마우스 호버 툴팁이 필요할 때는 브라우저 기본 `title` 대신 `TooltipPopover`를 사용합니다.
   - SVG 아이콘은 인라인 `<svg>` 작성을 엄격히 금지하며, `@assets/icon/Icon*.vue`를 import한 뒤 `<BaseIcon :icon="Icon*" />` 형태로 사용합니다.
2. **단일 진실의 원천 (SSOT)**:
   - 신규 페이지를 사이드바와 라우터에 등록할 때는 `@common/config/menuConfig.js`에 먼저 등록합니다.

---

## 🚀 표준 페이지 작성 템플릿 (AI Agent One-Shot Pattern)

새로운 도메인 분석 화면을 개발할 때는 아래 템플릿 구조를 기본 패턴으로 활용합니다:

```html
<template>
  <PageLayout>
    <!-- 1. 헤더 우측 컨트롤 (검색창, 필터 등) -->
    <template #actions>
      <div class="search-box">
        <BaseIcon :icon="IconSearch" size="sm" color="muted" />
        <input v-model="searchQuery" placeholder="Search..." />
        <button v-if="searchQuery" @click="searchQuery = ''">
          <BaseIcon :icon="IconClose" size="xs" />
        </button>
      </div>
      <button @click="handleAction" class="action-btn">
        <BaseIcon :icon="IconExternalLink" size="sm" /> Action
      </button>
    </template>

    <!-- 2. 본문 영역 (상태 처리 및 데이터 뷰) -->
    <div class="content-wrapper">
      <LoadingBox v-if="loading" />
      <ErrorBox v-else-if="error" :error="error" />
      <EmptyBox v-else-if="items.length === 0" />
      
      <div v-else class="data-view">
        <!-- 정상 데이터 렌더링 -->
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref } from 'vue';
import PageLayout from '@common/compo/layout/PageLayout.vue';
import BaseIcon from '@common/compo/icon/BaseIcon.vue';
import LoadingBox from '@common/compo/box/LoadingBox.vue';
import ErrorBox from '@common/compo/box/ErrorBox.vue';
import EmptyBox from '@common/compo/box/EmptyBox.vue';
import IconSearch from '@assets/icon/IconSearch.vue';
import IconClose from '@assets/icon/IconClose.vue';
import IconExternalLink from '@assets/icon/IconExternalLink.vue';

const searchQuery = ref('');
const loading = ref(false);
const error = ref(null);
const items = ref([]);
</script>

<style scoped lang="scss">
.content-wrapper {
  flex: 1 1 0%;
  display: flex;
  overflow: hidden;
  width: 100%;
}
</style>
```
