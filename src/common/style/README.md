# Common Style 관리 가이드

이 폴더는 프로젝트 전역에서 사용되는 공통 CSS(SCSS) 스타일과 모던 CSS `@layer`(Cascade Layers) 아키텍처를 관리합니다. 현재 프로젝트는 가독성 저하 방지 및 스타일 충돌 해결을 위해 **Tailwind CSS 체계에서 전통적인 Vanilla SCSS 방식(모듈화 및 계층화 적용)으로 마이그레이션을 완료**하였으며, Tailwind 패키지는 완전히 제거되었습니다.

## 📂 CSS Layer 아키텍처

최신 CSS 스펙인 `@layer`를 도입하여 스타일의 **우선순위(Specificity) 충돌을 원천적으로 방지**하고 예측 가능한 CSS 렌더링을 보장합니다.

`common.scss` 진입점 파일에서 다음과 같은 순서로 레이어를 정의합니다:
```scss
@layer reset, base, theme, compo, module;
```
*(오른쪽에 선언된 레이어일수록 우선순위가 높습니다.)*

### 레이어별 역할 및 파일 구성 (`layer/` 폴더 하위)

1. **`reset` (`_reset.scss`)**
   - 브라우저 기본 스타일 무효화. (자체 Reset SCSS 사용)
   - 우선순위가 가장 낮아 어떤 스타일로도 쉽게 덮어쓸 수 있습니다.

2. **`base` (`_base.scss`)**
   - 프로젝트 기본 타이포그래피, 폰트 임포트, `<body>` 전역 세팅.
   - HTML 기본 태그들에 대한 스타일 재정의.

3. **`theme` (`_theme.scss`)**
   - 화면 테마(예: Light / Dark 모드) 변경에 따른 CSS 변수(Token) 재지정.

4. **`compo` (`_compo.scss`)**
   - 버튼, 배지(`.badge-*`), 패널(`.glass-panel`) 등 전역에서 재사용되는 UI 컴포넌트의 형태와 레이아웃 정의.
   
5. **`module` (`_module.scss`)**
   - 특정 도메인(예: API 페이지, 테이블 페이지)에서 공통으로 묶여 쓰이는 복합 모듈 스타일.

6. **`{biz}` (Unlayered / Default)**
   - 별도의 레이어(파일)를 정의하지 않습니다.
   - 각 화면(Page) 혹은 도메인 컴포넌트 파일 내의 **`<style scoped>` 태그에 직접 구현하는 스타일**을 의미합니다.

## 💡 의도된 우선순위 전략 (Unlayered Styles)

CSS `@layer` 명세에 따라, **어떤 레이어에도 속하지 않은 기본 스타일(Unlayered)은 모든 레이어 스타일보다 항상 높은 우선순위**를 가집니다. 

따라서 개발자가 각 Vue 파일의 `<style scoped>` 영역에 작성한 커스텀 스타일(`{biz}`)은 별도의 복잡한 CSS 선택자 계산이나 `!important` 사용 없이도 자동으로 `base`나 `compo` 계층의 스타일을 이기고 우선 적용됩니다. 이는 컴포넌트 커스터마이징을 매우 직관적으로 만들어 줍니다.

## 🛠️ 컴포넌트 마이그레이션 (리팩토링) 가이드라인

프로젝트 초기의 Tailwind CSS에서 Vanilla SCSS로 컴포넌트를 마이그레이션할 때 적용되었던 주요 원칙은 다음과 같습니다 (현재 모든 컴포넌트 마이그레이션 완료):

1. **의미론적(Semantic) 클래스명 부여**
   - 태그의 역할과 의미를 명확히 나타내는 클래스명을 사용합니다. (예: `.left-frame`, `.nav-item`, `.logo-area`)
   - BEM(Block Element Modifier) 형식이나 직관적인 네이밍 컨벤션을 지향합니다.
2. **조건부 상태 클래스 바인딩**
   - 상태(Active, Collapsed 등)에 따른 스타일 변경은 Vue의 `:class="{ 'is-active': isActive }"` 바인딩을 적극 활용하여 처리합니다.
3. **디자인 일관성 (1:1 매핑)**
   - 기존 Tailwind에서 사용하던 색상(예: `slate-900`, `blue-500`)과 간격(예: `p-4` -> `1rem`)을 SCSS 수치로 완벽하게 1:1 매핑하여 시각적인 변화가 없도록 유지합니다.
4. **스타일 위치 결정**
   - 현재 컴포넌트에서만 사용되는 스타일은 해당 Vue 파일 하단의 `<style scoped lang="scss">`(`{biz}` 계층)에 작성합니다.
   - 여러 컴포넌트에서 재사용되는 버튼, 배지, 패널 등의 형태는 `layer/_compo.scss` 파일로 추출합니다.
