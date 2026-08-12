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
| 검색 결과에 덱 이름 표시 | `MarkdownContent` 컴포넌트 override | `src/components/layout/MarkdownContent.astro` |
| 덱 index 별칭 검색 | manifest의 `aliases`를 본문 앞에 표시 | `src/data/decks.mjs` · `MarkdownContent.astro` |
| 본문 폰트 Pretendard | `customCss` (dynamic subset) | `astro.config.mjs` |
| 본문 폭 45→55rem | `--sl-content-width` | `src/styles/custom.css` |
| mermaid 가로 스크롤 | `.mermaid` overflow | `src/styles/custom.css` |
| 검색 덱 라벨 위치·모양 | Pagefind UI 태그 칩 재스타일 | `src/styles/custom.css` |
| 한국어 단일 로케일 | `defaultLocale: 'root'` + `ko` | `astro.config.mjs` |

mermaid 통합 순서·topics slug처럼 "깨뜨리면 안 되는" 항목은
[CLAUDE.md](../CLAUDE.md)에 있다. 아래는 그 밖의 항목.

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
