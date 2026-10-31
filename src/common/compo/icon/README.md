# BaseIcon Component Guide

`BaseIcon`은 애플리케이션 전반에서 사용되는 모든 SVG 아이콘의 **크기 규격, 색상 테마, 정렬 기준, 접근성(A11y)**을 표준화하는 공통 래퍼 컴포넌트입니다.

개별 아이콘 컴포넌트를 `:icon` prop으로 전달받아 렌더링함으로써, **사용하지 않는 아이콘이 번들에 포함되지 않고 100% Tree-shaking**되도록 보장합니다.

- **Component Path**: `@common/compo/icon/BaseIcon.vue`
- **Icon Assets Path**: `@assets/icon/Icon*.vue`
- **Typical Use Cases**: 버튼 아이콘, 검색/입력창 접두/접미 아이콘, 뱃지/태그 아이콘, 로딩 스피너

---

## 🎯 설계 원칙 및 Tree-shaking 보장

1. **단일화된 Prop 인터페이스 (`:icon`)**:
   - `BaseIcon`은 복잡성을 줄이고 인터페이스를 단일화하기 위해 Slot 방식 대신 `:icon="IconComponent"` prop 전달 방식을 표준으로 채택합니다.
2. **번들 최적화 (Zero Bundle Bloat)**:
   - 각 화면 및 컴포넌트에서 필요한 아이콘만 정적으로 import하여 `:icon`으로 전달하므로, 빌더(Vite/Rollup)가 미사용 아이콘을 최종 번들에서 완전히 제거합니다.
3. **정렬 및 레이아웃 일관성**:
   - `inline-flex` 및 `vertical-align: middle`이 기본 적용되어 텍스트 및 버튼과 자연스럽게 중앙 정렬됩니다.

---

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `icon` | `Object \| Function` | **Required** | `@assets/icon/Icon*.vue`에서 import한 아이콘 컴포넌트 객체 |
| `size` | `String \| Number` | `'md'` | 크기 프리셋 (`'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`) 또는 직접 지정할 픽셀(px) 숫자 |
| `color` | `String` | `''` | 색상 프리셋 (`'primary'`, `'muted'`, `'danger'`, `'error'`, `'warning'`, `'success'`, `'white'`, `'inherit'`) 또는 유효한 CSS 색상 문자열 |
| `spin` | `Boolean` | `false` | `true` 설정 시 360도 무한 회전 애니메이션 적용 (로딩 스피너 등에 활용) |

### 📏 Size Presets

* `'xs'`: `14px` (`0.875rem`) - 뱃지 내부 미세 아이콘
* `'sm'`: `16px` (`1rem`) - 텍스트 인라인, 작은 버튼용
* `'md'`: `20px` (`1.25rem`) - 기본 크기, 일반 버튼/입력창
* `'lg'`: `24px` (`1.5rem`) - 헤더 액션 버튼, 네비게이션
* `'xl'`: `28px` (`1.75rem`) - 강조 아이콘, 카드 대표 아이콘
* `Number` (예: `:size="32"`): 임의 픽셀(`32px`) 크기 적용

---

## Usage Examples

### 1. 기본 사용 (Standard Usage)

```html
<template>
  <div class="search-bar">
    <BaseIcon :icon="IconSearch" size="sm" color="muted" />
    <input type="text" placeholder="Search..." />
  </div>
</template>

<script setup>
import BaseIcon from '@common/compo/icon/BaseIcon.vue';
import IconSearch from '@assets/icon/IconSearch.vue';
</script>
```

---

### 2. 버튼 및 상태 뱃지와 조합 (Buttons & Badges)

```html
<template>
  <!-- 액션 버튼 -->
  <button class="btn-primary">
    <BaseIcon :icon="IconDownload" size="sm" />
    <span>Export Report</span>
  </button>

  <!-- 위험/경고 알림 뱃지 -->
  <span class="badge-danger">
    <BaseIcon :icon="IconWarning" size="xs" color="danger" />
    <span>Error Detected</span>
  </span>
</template>

<script setup>
import BaseIcon from '@common/compo/icon/BaseIcon.vue';
import IconDownload from '@assets/icon/IconDownload.vue';
import IconWarning from '@assets/icon/IconWarning.vue';
</script>
```

---

### 3. 로딩 스피너 애니메이션 (`spin` prop)

```html
<template>
  <div class="loading-state">
    <BaseIcon :icon="IconSpinner" size="xl" color="primary" spin />
    <p>Loading data...</p>
  </div>
</template>

<script setup>
import BaseIcon from '@common/compo/icon/BaseIcon.vue';
import IconSpinner from '@assets/icon/IconSpinner.vue';
</script>
```
