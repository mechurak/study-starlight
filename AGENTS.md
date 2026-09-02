# AGENTS.md

Astro Starlight 기반 개인 스터디 노트 사이트. 슬라이드가 아니라 **축적·검색·참조**에 맞는 문서다.
덱 하나 = `src/content/docs/<이름>/` = topic 하나.

## 작업 전에 읽을 것

- 구조와 사용법: [README.md](README.md)
- 콘텐츠를 쓰거나 고칠 때: [docs/content-authoring.md](docs/content-authoring.md)
- D2를 추가하거나 고칠 때: [docs/d2-authoring.md](docs/d2-authoring.md)
- 검증 방법: [docs/verification.md](docs/verification.md)
- 배포: [docs/deploy.md](docs/deploy.md)
- Starlight 설정·override를 고칠 때: [docs/starlight-changes.md](docs/starlight-changes.md)와 대상 컴포넌트 머리 주석
- 덱 폴더의 `_baseline.md`를 **그 덱을 고치기 전에 반드시 먼저 읽는다.**

## 작업 방식

소유자 1인이 혼자 쓰는 레포다. `main`에 직접 커밋하며, 커밋·푸시는 요청받았을 때만 한다.
dev 서버는 백그라운드 모드로 띄운다: `pnpm astro dev --background`
(`pnpm astro dev stop` / `status` / `logs`). `astro`는 로컬 의존성이라 맨 명령으로는 못 부른다.

작업을 마치면 `pnpm check`를 실행한다. 브라우저 확인 범위는 `docs/verification.md`에서 변경 종류에 맞춰 고른다.

## 덱

덱 정보는 사용하는 곳과 가까운 세 원본으로 나뉜다.

- 전역 `category`·`tag` 어휘: `src/data/catalog.mjs`
- 덱 메타데이터·사이드바 그룹·index 구성도: `src/content/docs/<덱>/_deck.mjs`
- 페이지 소속 그룹·순서: 각 본문 MDX의 `deckGroup`·`sidebar.order`

`src/data/load-decks.mjs`가 이 원본들을 읽어 덱 목록·topic 사이드바·랜딩 카드·장 수를 파생한다.
`src/data/decks.mjs`는 기존 import를 유지하는 re-export일 뿐 직접 편집하지 않는다. 새 페이지는 MDX
하나만 만들면 자동 등록되고, 새 덱은 폴더 안에 `_deck.mjs`를 두면 자동 발견된다.

`_baseline.md`에는 기준 버전, 덱 전용 서술 규칙, 범위 경계를 둔다. `_`로 시작하는 파일은
콘텐츠 컬렉션에서 제외되어 빌드·검색·사이드바에 나오지 않는다. 모든 덱에 baseline이 있어야 하며
`pnpm check`가 이를 강제한다.

덱마다 `category`(4종) 하나와 `tags`(최소 하나)를 붙인다. 카테고리는 "어디부터 볼지" 고르는
굵은 묶음이고, 카테고리를 가로지르는 축(온프렘·실습·인증 같은)은 태그가 맡는다.
어휘는 `src/data/catalog.mjs`가 전부다 — id는 ASCII 슬러그, label은 한국어다.
**붙이는 기준은 그 덱이 실제로 여러 장을 쓰는 주제만이다.** 한 장 스쳐 가는 주제는 붙이지 않는다
(어긋나기 쉬운 쪽은 늘 과다 태깅이다). 어휘를 새로 추가하면 최소 한 덱이 그걸 써야 한다.
`_deck.mjs`의 `catalogOrder`가 랜딩 카드 순서, `navOrder`가 topic 전환 순서다.

`_deck.mjs`의 `termIntro: 'required'`인 덱의 **학습 본문 장**은 첫머리에 `<TermIntro>`를 둔다.
`index`, `*-glossary`, `*-wrapup`은 제외한다. 새 개념 학습 덱은 `required`, 실습·문제풀이 위주 덱은
`not-required`로 둔다. `legacy`는 규칙 도입 전 기존 덱에만 쓰며 새 덱에서 선택하지 않는다.
형식은 `src/components/docs/TermIntro.astro` 머리 주석에 있다.

새 본문에는 `<Thesis>`가 필수다. `legacyThesis: true`는 규칙 도입 전 페이지의 점진적 이관 표시다.
기존 페이지에 `<Thesis>`를 넣으면 이 필드를 제거하고, 새 페이지에 이 우회 표시를 붙이지 않는다.

## 절대 깨뜨리면 안 되는 것

- `astro.config.mjs`에서 `astroD2()`가 `starlight()`보다 먼저 와야 한다.
- 본문 MDX의 `deckGroup`은 같은 폴더 `_deck.mjs`의 group id여야 하고, `sidebar.order`는 덱 안에서
  중복되면 안 된다. 파일명을 바꾸면 `_deck.mjs`의 `map` 링크와 본문 링크도 함께 확인한다.
- 랜딩(`/`)은 어느 topic에도 속하지 않는다. topic 밖 페이지는 plugin `exclude`에 추가한다.
- 사이드바 UI는 `src/components/layout/`의 `Sidebar`·`SiteTitle`·`SidebarToggle` override 세트다.
  실제 접힘 레이아웃은 `src/styles/custom.css`의 전역 규칙이다.
- `pnpm-workspace.yaml`은 워크스페이스 목록이 아니라 esbuild·sharp의 빌드 허용 설정이다. 지우지 않는다.

세부 작성 규칙과 MDX 함정은 `docs/content-authoring.md`, D2 전용 규칙은 `docs/d2-authoring.md`에서 관리한다.
