# State Box Components Guide (상태 처리 컴포넌트)

화면 로딩(`LoadingBox`), 통신 및 데이터 오류(`ErrorBox`), 검색 및 결과 없음(`EmptyBox`) 등 프론트엔드의 3대 상태를 일관된 디자인과 사용자 경험으로 처리하기 위한 전용 컴포넌트 모음입니다.

- **Directory Path**: `@common/compo/box/`

---

## 1. `LoadingBox`

데이터 비동기 로딩, 파싱, 인덱싱 진행 중 스피너 애니메이션과 안내 문구를 표시합니다.

- **Component Path**: `@common/compo/box/LoadingBox.vue`

### Props & Slots
| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `text` (prop) | `String` | `'Loading data...'` | 표시할 로딩 문구 |
| `#default` (slot) | Slot | - | 텍스트 대신 커스텀 마크업 전달 시 사용 |

### Usage
```html
<LoadingBox v-if="loading" text="데이터 분석 및 목록 생성 중..." />
```

---

## 2. `ErrorBox`

API 호출 실패, 데이터 파싱 오류, 예외 상황 발생 시 경고 아이콘과 에러 메시지, 트러블슈팅 가이드를 함께 표시합니다.

- **Component Path**: `@common/compo/box/ErrorBox.vue`

### Props & Slots
| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` (prop) | `String` | `'Error Loading Data'` | 에러 헤더 제목 |
| `error` (prop) | `String` | `''` | 구체적인 에러 메시지 또는 스택 |
| `showTroubleshooting` (prop) | `Boolean` | `true` | 트러블슈팅 가이드 영역 표시 여부 |
| `#troubleshooting` (slot) | Slot | - | 커스텀 트러블슈팅 안내 마크업 |

### Usage
```html
<ErrorBox 
  v-else-if="error" 
  title="테이블 정의서 로드 실패"
  :error="errorMessage"
/>
```

---

## 3. `EmptyBox`

검색 결과가 없거나 데이터가 비어 있는 경우 시각적인 안내를 제공합니다.

- **Component Path**: `@common/compo/box/EmptyBox.vue`

### Props & Slots
| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `message` (prop) | `String` | `'No data found.'` | 안내 메시지 |
| `#default` (slot) | Slot | - | 커스텀 마크업 슬롯 |

### Usage
```html
<EmptyBox v-else-if="filteredItems.length === 0" message="검색 결과가 없습니다." />
```

---

## Standard State Transition Pattern (표준 3단 상태 처리)

모든 데이터 뷰 영역에서는 아래와 같이 `v-if`, `v-else-if`, `v-else` 조합을 준수합니다.

```html
<template>
  <div class="viewer-body">
    <!-- 1. 로딩 상태 -->
    <LoadingBox v-if="isLoading" text="로딩 중입니다..." />

    <!-- 2. 에러 상태 -->
    <ErrorBox v-else-if="errorMessage" :error="errorMessage" />

    <!-- 3. 결과 없음 상태 -->
    <EmptyBox v-else-if="dataList.length === 0" message="표시할 데이터가 없습니다." />

    <!-- 4. 정상 데이터 뷰 -->
    <div v-else class="content-list">
      <div v-for="item in dataList" :key="item.id">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>
```
