# 기본 Starlight에서 바꾼 것

바닐라 Starlight와 다른 지점을 전부 모은 문서. **업그레이드하거나 "이거 왜 이렇게 나오지?" 싶을 때**
여기부터 본다. 각 항목의 "왜"까지 적어 두었다 — 내부 동작에 기댄 항목은
**Starlight 0.41.x 기준으로 확인한 것**이라 메이저 업그레이드 때 재확인이 필요하다.

## 한눈에 보기

| 변경 | 방법 | 파일 |
|---|---|---|
| 덱 = topic 사이드바 | 덱별 설정·MDX를 파생 loader로 합성 + `starlight-sidebar-topics` | `src/content/docs/*/_deck.mjs` · `src/data/load-decks.mjs` · `astro.config.mjs` |
| 테마 (Vitesse 계열) | `starlight-theme-rapide` 플러그인 | `astro.config.mjs` |
| D2 펜스 렌더 (다이어그램) | `astro-d2` 통합 + native D2 v0.8.2 (**starlight보다 먼저**) | `scripts/prepare-d2.mjs` · `astro.config.mjs` |
| 이미지 클릭 확대 | `starlight-image-zoom` 플러그인 + 기존 override 합성 | `astro.config.mjs` · `MarkdownContent.astro` · `SourceFigure.astro` |
| Markdown 프로세서 | 이미지 확대 호환을 위해 `unified()` 명시 | `astro.config.mjs` |
| 검색 결과에 덱 이름 표시 | `MarkdownContent` 컴포넌트 override | `src/components/layout/MarkdownContent.astro` |
| 덱 index 별칭 검색 | `_deck.mjs`의 `aliases`를 본문 앞에 표시 | `src/content/docs/*/_deck.mjs` · `MarkdownContent.astro` |
| 검토 이력 표시 | `reviewedAt` 없는 문서를 안정 상태로 간주하지 않음 | `content.config.ts` · `MarkdownContent.astro` |
| 랜딩 덱 카탈로그 | 태그 필터 + 카테고리 카드/테이블 전환 + 카테고리·최근 수정일 정렬 + Git 이력으로 수정일 계산 | `scripts/prepare-git-history.mjs` · `src/components/docs/DeckCatalog.astro` |
| 본문 폰트 Pretendard | `customCss` (dynamic subset) | `astro.config.mjs` |
| 본문 폭 45→55rem | `--sl-content-width` | `src/styles/custom.css` |
| 검색 덱 라벨 위치·모양 | Pagefind UI 태그 칩 재스타일 | `src/styles/custom.css` |
| 한국어 단일 로케일 | `defaultLocale: 'root'` + `ko` | `astro.config.mjs` |

다이어그램 통합 순서·topics slug처럼 "깨뜨리면 안 되는" 항목은
[AGENTS.md](../AGENTS.md)에 있다. 아래는 그 밖의 항목.

## 덱 데이터와 자동 사이드바

덱과 장이 늘면서 모든 slug·그룹·index 구성도를 중앙 배열 하나에 적는 방식은 변경 충돌과 누락을
만들기 쉬워졌다. 지금은 정보의 소유 위치를 다음처럼 나누고 `load-decks.mjs`가 최종 데이터를 만든다.

- `src/data/catalog.mjs`: 모든 덱이 공유하는 category·tag 통제 어휘
- `src/content/docs/<덱>/_deck.mjs`: 덱 메타데이터, topic·랜딩 순서, 그룹 정의, index `DeckMap`
- 각 본문 MDX: `deckGroup`과 `sidebar.order`

loader는 `_deck.mjs`가 있는 폴더를 덱으로 발견하고 MDX를 순회한다. 그룹·순서·slug·map 링크·전역
어휘를 검증한 뒤 topic 사이드바와 랜딩 카탈로그, 장 수를 파생한다. 따라서 **새 장은 그 MDX 하나만
추가하면 되고**, index의 구성도도 `<DeckMap deck="…" />`가 같은 폴더 설정을 읽으므로 복제되지 않는다.
`src/data/decks.mjs`는 기존 컴포넌트 import를 유지하기 위한 re-export다.

새 파일 추가·이름 변경을 실행 중 dev 서버가 즉시 config 변경으로 인식하지 못할 수 있으므로 이때는
서버를 재시작한다. 빌드와 `pnpm check`는 매번 전체 source tree를 새로 읽는다.

## 다이어그램과 이미지 확대

- **다이어그램은 전부 D2다** (규칙은 [d2-authoring.md](d2-authoring.md)).
  `astro-d2`가 빌드 시 SVG 파일을 만들고 `<img>`로 넣으므로 문법 오류를 빌드가 잡는다.
  `inline: false` 기본값을 유지해야 다크 모드와 자동 확대가 함께 안정적으로 동작한다.
  인라인 SVG가 필요한 링크·툴팁은 별도 검토 대상이다.
- 초기에는 Mermaid(`astro-mermaid` + 자체 `MermaidZoom.astro` 확대 층)를 함께 썼지만,
  2026-08 덱 단위 일괄 마이그레이션(이슈 #2)으로 전부 D2로 변환하고 통합을 제거했다.
  클라이언트 렌더라 문법 오류가 빌드를 통과하는 점, 테마 전환 때 SVG를 다시 그리는 점이
  검증 비용의 주범이었다.
- D2 생성은 native D2 `v0.8.2`를 사용한다. `scripts/prepare-d2.mjs`가 macOS arm64/x64와
  Linux x86_64/arm64의 공식 standalone archive 및 SHA-256을 코드에 고정하고,
  `node_modules/.astro/d2/v0.8.2/` 아래 캐시를 준비한다. 검증된 `bin`을 `PATH` 앞에 붙인 뒤
  `astroD2()`를 등록하므로 로컬·Cloudflare Pages 모두 시스템 전역 설치가 필요 없다.
- archive는 임시 디렉터리에서 다운로드·checksum 검증·압축 해제하고, 실행 권한과
  `d2 --version == v0.8.2`까지 확인한 디렉터리만 원자적으로 캐시에 반영한다. 캐시 hit에서도
  실행 권한과 버전을 다시 확인한다. 기본 레이아웃은 `elk`다.
- 생성된 `public/d2/`는 빌드 산출물이므로 `.gitignore`에서 제외한다.
- `starlight-image-zoom`은 일반 Markdown/MDX 이미지와 D2 `<img>`를 자동으로 감싼다.
  `<SourceFigure>`는 원문 출처 링크와 이미지 확대 동작이 충돌하지 않도록 `<Zoom>`을 직접 쓴다.
- 이 저장소는 Pagefind 덱 라벨용 `MarkdownContent` override가 이미 있으므로 플러그인이 자체
  override를 설치하지 않는다. 기존 `MarkdownContent.astro`가 `<ImageZoom />` 런타임을 직접
  렌더해야 검색 메타와 이미지 확대가 함께 동작한다.
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
	 → **파생된 topic label과 자동으로 일치**하고, 새 덱을 만들어도 손댈 곳이 없다
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

랜딩의 보기 전환으로 카테고리 카드와 전체 덱 테이블을 오갈 수 있다. 기본 보기는
테이블이고 서버 렌더 시점에 최근 수정일 내림차순으로 정렬해 둔다. 선택한 보기는
`localStorage` 키 `deck-catalog-view`에 저장한다. 테이블은 카테고리와 최근 수정일을 제목행
버튼으로 정렬하며, 한 번 더 누르면 오름차순·내림차순을 바꾼다. 수정일이 없는 덱은
정렬 방향과 관계없이 마지막에 둔다. 48rem 이하 화면에서는 카테고리·분량 열을 접어
가로 스크롤 없이 덱·최근 수정일 열만 남긴다.

## 랜딩 태그 필터

카테고리는 굵은 묶음이고, 카테고리를 가로지르는 축은 태그가 맡는다. 결정한 것들:

- **교집합(AND)이다.** 덱 23개에서 합집합은 대부분을 남겨 필터가 아무 일도 안 하는
  것처럼 보인다. 대신 AND는 막다른 길이 생기므로, 선택이 바뀔 때마다 남은 덱 기준으로
  칩 개수를 다시 세고 0이 되는 칩은 `aria-disabled`로 흐리게 해 눌리지 않게 한다.
  `disabled` 속성은 쓰지 않는다 — 탭 순서에서 빠지면 어느 칩이 죽었는지 알 수 없다.
  선택된 칩은 흐려지지 않으므로 막다른 길에서도 되돌아 나올 수 있다.
- **`localStorage`에 저장하지 않는다.** 보기 전환은 "나는 표가 편하다"는 지속되는
  취향이지만 태그 선택은 그때의 질의다. 저장하면 다음에 왔을 때 덱 대부분이 말없이
  사라진다. 대신 `?tags=k8s,onprem`으로 URL에 남긴다.
- **`replaceState`다.** `pushState`면 칩을 누른 횟수만큼 뒤로가기가 필요하고,
  `popstate` 리스너를 같이 달지 않으면 Back이 URL만 바꾸고 UI는 그대로인 버그가 난다.
  URL은 `searchParams.set` 대신 직접 조립한다 — 그쪽은 쉼표를 `%2C`로 인코딩해
  ASCII id를 쓴 이유(읽히는 링크)를 무너뜨린다. tag id는 `check-content`가
  `[a-z0-9-]`로 강제하므로 이스케이프가 필요 없다.
- **필터 바·툴바·태그 칩·테이블 보기·빈 상태에 `data-pagefind-ignore`가 붙어 있다.** 랜딩도
  `data-pagefind-body` 대상이라, 두지 않으면 온프렘·실습·쿠버네티스 같은 칩 라벨이
  `/`에 실려 진짜 덱 페이지와 검색 순위를 다툰다. 카드마다 반복되는 태그가 오히려
  필터 바보다 무게가 크다. 테이블 보기는 카드 보기와 같은 제목·설명을 한 번 더 실을
  뿐이라 통째로 뺀다 — `hidden`이어도 Pagefind는 빌드된 HTML을 그대로 읽는다.
  이걸로 랜딩의 색인 분량이 절반쯤이 된다.
- **태그를 검색에 연결하지는 않았다.** `aliases`는 "다른 이름"으로 렌더되는데 `온프렘`은
  LiteLLM의 다른 이름이 아니다. `data-pagefind-meta`는 결과 카드에 칩을 하나 더 그리는데
  `custom.css`의 `.pagefind-ui__result-tags { order: -1 }`이 칩 하나를 전제로 짜여 있다.
  의미상 맞는 `data-pagefind-filter`는 Starlight 번들 UI에 필터 컨트롤이 없어 죽은 코드가 된다.
- 필터는 DOM에서 요소를 빼지 않고 `hidden`으로 감춘다. 정렬이 `rowsContainer.rows`를
  재배치하므로 제거하면 이후 정렬에서 영영 빠진다. 다만 `[hidden]`은 UA 규칙이라
  `.deck { display: flex }` 같은 작성자 규칙에 지므로 `display: none`을 명시해야 한다.
- 필터 안내용 `aria-live`는 두 보기 패널 **바깥**에 있다. 정렬용 `data-sort-status`는
  테이블 래퍼 안이고 그 래퍼는 카드 보기에서 `hidden`인데, `hidden` 하위의 live region은
  접근성 트리에 없어 아무것도 읽지 않는다.

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

## 별칭과 검토 상태

`MarkdownContent.astro`는 덱 index에서는 `_deck.mjs`의 별칭을, 개별 장에서는 frontmatter의
`aliases`를 Pagefind가 읽을 수 있는 본문 앞 meta로 표시한다. 둘을 같은 배열에 중복해서 적지 않는다.

`reviewedAt`은 수정일이 아니라 내용을 실제로 재확인한 날짜다. 날짜가 없는데 schema 기본값으로
`stable`을 넣으면 미검토 문서가 안정된 문서처럼 보이므로 기본값을 없앴다. 표시 규칙은 다음과 같다.

- 날짜와 status 모두 없음: `검토 이력 없음`
- 날짜만 있음: `stable`로 해석하고 별도 경고는 표시하지 않음
- 날짜 + `review` 또는 `stale`: `검토 필요` 또는 `오래된 내용`

덱별 기본 검토 주기는 `_deck.mjs`의 `reviewIntervalDays`(생략 시 180일)이며,
`pnpm report:content`가 미검토·주기 초과 현황을 보여 준다. 주기 초과는 보고서 대상이지 build 실패는
아니다. 오래된 사실을 발견했을 때 작업을 막기보다 우선순위를 드러내기 위한 선택이다.

## 로케일

한국어 전용 사이트라 `defaultLocale: 'root'` + `root: { label: '한국어', lang: 'ko' }`.
URL에 언어 프리픽스가 없고, Starlight UI 문구(검색 버튼, 목차 제목 등)가 한국어로 나온다.
단 **Pagefind UI 문구는 한국어 빌트인 번역이 없어 영어로 나온다**
("13 results for …") — Starlight 한국어 번역에 `pagefind.*` 키가 없기 때문. 감수하기로 했다.

## 바꾸지 않은 것

- **검색은 Pagefind 기본 UI 그대로** — 위의 meta 주입만 얹었다.
  `Search` 컴포넌트를 교체하지 않았으므로 업그레이드 영향이 없다
- 기본 프론트매터에 덱 파생용 `deckGroup`, 점진적 이관용 `legacyThesis`, 검색·현재성용
  `aliases` · `reviewedAt` · `status`를 확장했다
  (쓰는 방식의 규칙은 [content-authoring.md](content-authoring.md))
- `pnpm-workspace.yaml`은 Starlight 커스텀이 아니라 pnpm 빌드 스크립트 허용 설정
  — [deploy.md](deploy.md) 참고
