# PageLayout Component Guide

`PageLayout`은 화면의 최외곽 flex 컨테이너, 스크롤 영역, 상단 Glassmorphism 헤더(타이틀, 아이콘, 액션 버튼)를 일괄 제공하는 표준 레이아웃 껍데기 컴포넌트입니다.

- **Component Path**: `@common/compo/layout/PageLayout.vue`
- **Primary Use**: 모든 도메인 페이지의 최상위 루트 컨테이너
- **Related Design Guide**: [PageLayout & Human-AI Collaboration Guide](../../../../docs/design/page-layout-ai-collaboration.md)

---

## Features

1. **Auto Route Title & Icon Resolution**:
   - `props.title`이나 `props.icon`을 전달하지 않아도, 현재 `route.meta.title`과 `route.meta.icon`을 자동으로 감지하여 헤더에 렌더링합니다.
2. **Standard Glassmorphism Header**:
   - 다크 테마 일관성을 유지하는 상단 헤더 바를 자동 제공합니다.
3. **Flexible Slot Layout**:
   - 헤더 타이틀 오버라이드(`#title`), 우측 액션 컨트롤(`#actions`), 본문 본체(`#default`) 슬롯을 지원합니다.
4. **Zero-Scroll Outer Boundary**:
   - `flex: 1 1 0%` 및 `overflow: hidden` 기반으로 브라우저 전체 스크롤바 발생을 억제하고 내부 컴포넌트가 독립 스크롤을 갖도록 제어합니다.

---

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `String` | `''` | 라우터 meta 대신 직접 커스텀 타이틀을 지정할 때 사용 |
| `icon` | `Component` | `null` | 라우터 meta 대신 직접 커스텀 아이콘을 지정할 때 사용 |
| `hideHeader` | `Boolean` | `false` | 상단 헤더 전체를 숨길지 여부 |
| `contentClass` | `String` | `''` | 본문 `<main class="page-main-content">`에 추가할 CSS 클래스 |

---

## Slots

| Slot Name | Description |
| :--- | :--- |
| `#title` | 헤더 좌측 타이틀/아이콘 영역을 완전히 커스텀하고자 할 때 사용 |
| `#actions` | 헤더 우측 컨트롤 영역 (검색창, 필터 셀렉트, 액션 버튼, 통계 등) |
| `#default` | 화면 본문 콘텐츠 (자동으로 `flex: 1`, `overflow: hidden` 처리) |

---

## Usage Examples

### 1. 기본 마스터-디테일 페이지 패턴

```html
<template>
  <PageLayout>
    <!-- 상단 헤더 우측 액션 영역 -->
    <template #actions>
      <div class="search-box">
        <BaseIcon :icon="IconSearch" size="sm" color="muted" />
        <input v-model="searchQuery" placeholder="Search..." />
        <button v-if="searchQuery" @click="searchQuery = ''">
          <BaseIcon :icon="IconClose" size="xs" />
        </button>
      </div>
      <button @click="openSource" class="action-btn">
        <BaseIcon :icon="IconExternalLink" size="sm" /> View Source
      </button>
    </template>

    <!-- 본문 영역: 마스터 리스트 + 디테일 뷰 -->
    <div class="page-body">
      <MasterSection class="master-pane" />
      <DetailSection class="detail-pane" />
    </div>
  </PageLayout>
</template>

<script setup>
import PageLayout from '@common/compo/layout/PageLayout.vue';
import BaseIcon from '@common/compo/icon/BaseIcon.vue';
import MasterSection from './section/MasterSection.vue';
import DetailSection from './section/DetailSection.vue';
import IconSearch from '@assets/icon/IconSearch.vue';
import IconClose from '@assets/icon/IconClose.vue';
import IconExternalLink from '@assets/icon/IconExternalLink.vue';
</script>

<style scoped lang="scss">
.page-body {
  flex: 1 1 0%;
  display: flex;
  overflow: hidden;
  width: 100%;
}

.master-pane {
  width: 320px;
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
}

.detail-pane {
  flex: 1 1 0%;
  overflow-y: auto;
}
</style>
```

### 2. 헤더 커스텀 타이틀 및 아이콘 지정

```html
<template>
  <PageLayout :title="'Custom Title'" :icon="IconDatabase">
    <div class="simple-content">
      <p>Custom Title Content</p>
    </div>
  </PageLayout>
</template>

<script setup>
import PageLayout from '@common/compo/layout/PageLayout.vue';
import IconDatabase from '@assets/icon/IconDatabase.vue';
</script>
```
