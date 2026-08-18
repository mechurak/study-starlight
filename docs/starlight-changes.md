# 기본 Starlight에서 바꾼 것

바닐라 Starlight와 다른 지점을 전부 모은 문서. **업그레이드하거나 "이거 왜 이렇게 나오지?" 싶을 때**
여기부터 본다. 각 항목의 "왜"까지 적어 두었다 — 내부 동작에 기댄 항목은
**Starlight 0.41.x 기준으로 확인한 것**이라 메이저 업그레이드 때 재확인이 필요하다.

## 한눈에 보기

| 변경 | 방법 | 파일 |
|---|---|---|
| 덱 = topic 사이드바 | 단일 덱 manifest + `starlight-sidebar-topics` | `src/data/decks.mjs` · `astro.config.mjs` |
| 테마 (Vitesse 계열) | `starlight-theme-rapide` 플러그인 | `astro.config.mjs` |
| mermaid 펜스 렌더 | `astro-mermaid` 통합 (**starlight보다 먼저**) | `astro.config.mjs` |
| mermaid 카드·확대 | 렌더 후 SVG를 보강하는 `MermaidZoom` | `MarkdownContent.astro` · `MermaidZoom.astro` |
| D2 펜스 렌더 | `astro-d2` 통합 + D2.js (**starlight보다 먼저**) | `astro.config.mjs` |
| 이미지 클릭 확대 | `starlight-image-zoom` 플러그인 + 기존 override 합성 | `astro.config.mjs` · `MarkdownContent.astro` · `SourceFigure.astro` |
| Markdown 프로세서 | 이미지 확대 호환을 위해 `unified()` 명시 | `astro.config.mjs` |
| 검색 결과에 덱 이름 표시 | `MarkdownContent` 컴포넌트 override | `src/components/layout/MarkdownContent.astro` |
| 덱 index 별칭 검색 | manifest의 `aliases`를 본문 앞에 표시 | `src/data/decks.mjs` · `MarkdownContent.astro` |
| 랜딩 덱 카탈로그 | 카테고리 카드/테이블 전환 + 카테고리·최근 수정일 정렬 + Git 이력으로 수정일 계산 | `scripts/prepare-git-history.mjs` · `src/components/docs/DeckCatalog.astro` |
| 본문 폰트 Pretendard | `customCss` (dynamic subset) | `astro.config.mjs` |
| 본문 폭 45→55rem | `--sl-content-width` | `src/styles/custom.css` |
| 검색 덱 라벨 위치·모양 | Pagefind UI 태그 칩 재스타일 | `src/styles/custom.css` |
| 한국어 단일 로케일 | `defaultLocale: 'root'` + `ko` | `astro.config.mjs` |

다이어그램 통합 순서·topics slug처럼 "깨뜨리면 안 되는" 항목은
[CLAUDE.md](../CLAUDE.md)에 있다. 아래는 그 밖의 항목.

## 다이어그램과 이미지 확대

- **Mermaid**는 기존 관계·상태·시퀀스의 기본 수단이다. 클라이언트에서 렌더하므로 문법과
  라이트/다크 모드는 브라우저에서 판정한다. 전역 폰트는 `astro.config.mjs`에서 Pretendard로
  맞추고, 렌더러 로그는 끈다.
- **`MermaidZoom.astro`**는 렌더러와 분리된 표시·확대 층이다. 모든 Mermaid를 공통 카드로 감싸고
  가로 스크롤과 확대 버튼을 제공한다. SVG나 버튼을 누르면 화면에 맞춰 커진 native dialog가 열리며
  ESC·닫기 버튼·바깥 영역 클릭으로 닫는다.
- astro-mermaid는 테마 전환 때 SVG의 `innerHTML`을 교체한다. `MermaidZoom`은 컨테이너에 클릭 이벤트를
  위임하고 `MutationObserver`로 확대 버튼 상태를 다시 맞춘다. Mermaid 내부 DOM 구조를 분석하는
  hover 강조나 점선 애니메이션은 두지 않는다.
- **D2**는 레이아웃과 시각적 흐름을 더 강조할 때 선택한다. `astro-d2`가 빌드 시 SVG 파일을
  만들고 `<img>`로 넣는다. `inline: false` 기본값을 유지해야 다크 모드와 자동 확대가 함께
  안정적으로 동작한다. 인라인 SVG가 필요한 링크·툴팁은 별도 검토 대상이다.
- D2 생성은 `experimental.useD2js: true`로 D2.js/WASM을 사용한다. Cloudflare Pages에 D2
  바이너리를 설치할 필요가 없는 대신 `tala` 레이아웃은 쓸 수 없어서 기본을 `elk`로 고정했다.
- 생성된 `public/d2/`는 빌드 산출물이므로 `.gitignore`에서 제외한다.
- `starlight-image-zoom`은 일반 Markdown/MDX 이미지와 D2 `<img>`를 자동으로 감싼다.
  `<SourceFigure>`는 원문 출처 링크와 이미지 확대 동작이 충돌하지 않도록 `<Zoom>`을 직접 쓴다.
- 이 저장소는 Pagefind 덱 라벨용 `MarkdownContent` override가 이미 있으므로 플러그인이 자체
  override를 설치하지 않는다. 기존 `MarkdownContent.astro`가 `<ImageZoom />` 런타임을 직접
  렌더하고 `<MermaidZoom />`도 합성해야 검색 메타·이미지 확대·Mermaid 클릭 확대가 함께 동작한다.
- `starlight-image-zoom` 0.15는 Astro 7의 기본 Sätteri 프로세서를 아직 지원하지 않아서
  `@astrojs/markdown-remark`의 `unified()`를 명시했다. 플러그인 업그레이드 때 Sätteri 지원 여부를
  다시 확인하고, 지원되면 이 임시 호환 설정과 직접 의존성을 함께 제거할 수 있다.

## 외관 — 세 겹

- **테마**: `starlight-theme-rapide` (코드 블록 테마도 Vitesse 계열로 함께 바뀐다)
- **폰트**: Pretendard Variable 셀프호스팅. `customCss`의 **dynamic subset** CSS가 핵심이다
  — 한글 폰트는 웨이트당 수 MB라, 쓰인 글자의 조각만 내려받는 이 방식이 아니면 못 쓴다
- **본문 폭**: `--sl-content-width: 55rem` (기본 45rem은 다이어그램·표 위주 문서에 좁다)

## 검색 결과의 덱 이름 표시

여러 덱에 같은 용어가 나와서 (스케줄링, 인증, 테마 …) 검색 결과만으로는
어느 덱 문서인지 구분이 안 됐다. 결과마다 제목 위에 **"덱: CKA"** 라벨을 붙였다.

세 파일이 한 세트다 —

1. **`src/components/layout/MarkdownContent.astro`** — Starlight 기본 `MarkdownContent`를
   감싸는 override. `data-pagefind-meta="덱:<라벨>"` 빈 span 하나를 본문 앞에 심는다.
   - Pagefind는 `<main data-pagefind-body>` **안의** meta만 수집하는데, Starlight이
     그 속성을 `<main>`에 붙이므로 본문 첫 공통 진입점인 이 컴포넌트에서 심는다
   - 덱 라벨은 `starlight-sidebar-topics`의 라우트 데이터
     (`Astro.locals.starlightSidebarTopics`)에서 `isCurrent`인 topic의 label을 읽는다
	 → **덱 manifest의 topic label과 자동으로 일치**하고, 새 덱을 만들어도 손댈 곳이 없다
   - 랜딩(`/`)처럼 topic 밖 페이지는 meta 없이 렌더된다 (라벨 없음)
2. **`astro.config.mjs`** — `components.MarkdownContent` 등록 한 줄
3. **`src/styles/custom.css`** — Pagefind 기본 UI는 커스텀 meta를 결과 카드 **맨 아래**
   태그 칩(`.pagefind-ui__result-tags`)으로 그린다. 카드 컨테이너가 flex column이라
   `order: -1`로 제목 위에 올리고, 칩 배경을 빼서 작은 회색 라벨로 바꿨다

기댄 내부 동작 (0.41.x + Pagefind UI 1.5.x에서 확인):

- Pagefind 기본 UI는 `title`/`image`/`image_alt`/`url` 외의 meta를
  자동으로 "키: 값" 텍스트로 렌더한다 → 별도 UI 코드가 필요 없다
- meta 값이 인덱스에 들어가므로 **빌드해야 반영**된다 (dev 서버에선 검색 자체가 비활성)

### 시도했다가 되돌린 것 — 덱별 그룹핑

결과를 덱별로 묶어 보여주는 버전(덱 이름 + 건수 헤더로 구분)도 만들었었다.
그룹핑은 Pagefind 기본 UI에 없어서 **Starlight `Search` 컴포넌트를 통째로 교체**하고
Pagefind JS API(`debouncedSearch` → `result.data()` → meta로 그룹핑)로 직접 렌더해야 했는데,
동작은 했지만 **Starlight 업그레이드 시 검색 모달의 개선을 못 따라가는 비용**이
과하다고 판단해 라벨 표시까지만 남겼다. 다시 필요하면 git 히스토리가 아니라
이 접근법 요약을 출발점으로 삼으면 된다 — 모달 셸(버튼·Ctrl+K·dialog)은 기본
`Search.astro`에서 복사하고, 결과 영역만 자체 렌더러로 바꾸는 구조였다.

## 랜딩 덱 카탈로그와 최종 수정일

`DeckCatalog.astro`는 Starlight가 페이지의 마지막 업데이트를 구할 때 쓰는
`virtual:starlight/git-info`의 `getNewestCommitDate()`를 재사용한다. 각 덱의 index와 장 문서 중
가장 최근 커밋일을 카드의 **마지막 수정**으로 표시한다. 파일 시스템 mtime은 배포 체크아웃 때
바뀌므로 사용하지 않는다.

랜딩의 보기 전환으로 카테고리 카드와 전체 덱 테이블을 오갈 수 있다. 선택한 보기는
`localStorage` 키 `deck-catalog-view`에 저장한다. 테이블은 카테고리와 최근 수정일을 제목행
버튼으로 정렬하며, 한 번 더 누르면 오름차순·내림차순을 바꾼다. 수정일이 없는 덱은
정렬 방향과 관계없이 마지막에 둔다.

기댄 내부 동작 (0.41.x 기준으로 확인):

- dev에서는 파일별 `git log`, build에서는 Starlight가 빌드 시작 시 한 번 수집해 인라인한 Git
  이력을 사용한다
- Cloudflare Pages의 얇은 checkout은 모든 문서를 HEAD에서 추가된 것처럼 보이게 한다.
  `pnpm build`의 `prebuild`가 `CF_PAGES=1`이고 저장소가 얇은 경우에만 `git fetch --unshallow`로
  전체 이력을 확보한 뒤 Starlight 빌드를 시작한다
- 아직 커밋되지 않아 이력이 없는 새 문서는 계산에서 제외하고, 덱 전체에 이력이 없으면 날짜를
  표시하지 않는다
- Starlight 업그레이드 시 `virtual:starlight/git-info`와 `getNewestCommitDate(filePath)`가 유지되는지
  확인한다

## 로케일

한국어 전용 사이트라 `defaultLocale: 'root'` + `root: { label: '한국어', lang: 'ko' }`.
URL에 언어 프리픽스가 없고, Starlight UI 문구(검색 버튼, 목차 제목 등)가 한국어로 나온다.
단 **Pagefind UI 문구는 한국어 빌트인 번역이 없어 영어로 나온다**
("13 results for …") — Starlight 한국어 번역에 `pagefind.*` 키가 없기 때문. 감수하기로 했다.

## 바꾸지 않은 것

- **검색은 Pagefind 기본 UI 그대로** — 위의 meta 주입만 얹었다.
  `Search` 컴포넌트를 교체하지 않았으므로 업그레이드 영향이 없다
- 기본 프론트매터에 검색·현재성용 `aliases` · `reviewedAt` · `status`만 확장했다
  (쓰는 방식의 규칙은 [content-authoring.md](content-authoring.md))
- `pnpm-workspace.yaml`은 Starlight 커스텀이 아니라 pnpm 빌드 스크립트 허용 설정
  — [deploy.md](deploy.md) 참고
