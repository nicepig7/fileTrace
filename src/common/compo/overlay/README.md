# TooltipPopover Component Guide

`TooltipPopover`는 요소에 마우스 호버 시 뷰포트(브라우저 화면) 경계를 벗어나도 잘림 없이 상/하/좌/우에 플로팅 툴팁이나 상세 정보를 띄워주는 컴포넌트입니다.

Vue 3의 `<Teleport to="body">`를 사용하여 부모 컨테이너의 `overflow: hidden` 제약을 우회하며, 동적으로 위치를 계산합니다.

- **Component Path**: `@common/compo/overlay/TooltipPopover.vue`
- **Typical Use Cases**: 테이블 목록 아이템 호버 상세 정보, MCI 목록 호버 상세 정보, 도움말 툴팁

---

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `position` | `String` | `'top'` | 툴팁 위치 (`'top'`, `'bottom'`, `'right'`, `'left'`) |
| `widthClass` | `String` | `'w-64'` | 팝오버 너비 CSS 클래스 (예: `'w-64'`, `'w-80'`) |
| `wrapperClass` | `String` | `'inline-block'` | 트리거 래퍼(`<div>`)에 적용할 CSS 클래스 |

---

## Slots

| Slot Name | Description |
| :--- | :--- |
| `#trigger` | 마우스 호버 대상이 되는 UI 엘리먼트 (버튼, 아이콘, 텍스트 라벨 등) |
| `#default` | 팝오버 내부에 표시될 마크업/내용 (자동으로 툴팁 화살표와 함께 렌더링됨) |

---

## Usage Examples

### 1. 우측 사이드 팝오버 (Master List Item용)

```html
<template>
  <TooltipPopover position="right" width-class="w-80">
    <!-- 트리거 슬롯 -->
    <template #trigger>
      <div class="list-item">
        <span class="item-title">{{ table.name }}</span>
      </div>
    </template>

    <!-- 팝오버 본문 -->
    <div class="table-tooltip-body">
      <div class="tooltip-header">
        <strong>{{ table.koreanName }}</strong>
        <span class="badge">{{ table.owner }}</span>
      </div>
      <p class="tooltip-desc">{{ table.description }}</p>
    </div>
  </TooltipPopover>
</template>

<script setup>
import TooltipPopover from '@common/compo/overlay/TooltipPopover.vue';

defineProps({
  table: Object
});
</script>
```

### 2. 기본 상단/하단 안내 툴팁

```html
<TooltipPopover position="top" width-class="w-48">
  <template #trigger>
    <button class="icon-btn">
      <IconHelp />
    </button>
  </template>
  <div class="p-2 text-xs">
    클릭 시 최신 분석 데이터를 다시 불러옵니다.
  </div>
</TooltipPopover>
```
