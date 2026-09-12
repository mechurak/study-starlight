# AGENTS.md

Astro Starlight 기반 개인 스터디 노트 사이트. 슬라이드가 아니라 **축적·검색·참조**에 맞는 문서다.
덱 하나 = `src/content/docs/<이름>/` = topic 하나.

## 작업에 맞춰 읽을 것

- 구조·명령을 처음 확인하거나 새 덱을 만들 때: [README.md](README.md)
- 콘텐츠를 쓰거나 고칠 때: [docs/content-authoring.md](docs/content-authoring.md)
- D2를 추가하거나 고칠 때: [docs/d2-authoring.md](docs/d2-authoring.md)
- 검증 방법: [docs/verification.md](docs/verification.md)
- 배포를 준비하거나 배포 설정을 고칠 때: [docs/deploy.md](docs/deploy.md)
- Starlight 설정·override를 고칠 때: [docs/starlight-changes.md](docs/starlight-changes.md)와 대상 컴포넌트 머리 주석
- 덱 폴더의 `_baseline.md`를 **그 덱을 고치기 전에 반드시 먼저 읽는다.**

현재 작업에 필요한 문서를 읽고, 같은 세션에서 이미 읽은 지침은 변경되거나 작업 범위가 달라질 때 다시 확인한다.

## 작업 방식

소유자 1인이 혼자 쓰는 레포다. `main`에 직접 커밋하며, 커밋·푸시는 요청받았을 때만 한다.
수정 요청은 관련 파일 편집·검증·이번 변경으로 생긴 오류 수정까지 수행한다. 범위 안의 일상적인
구현 선택은 진행하고, 사용자 결정이 필요한 범위 변경이나 아직 허용받지 않은 외부 쓰기는 먼저 확인한다.
지침 때문에 중단한다면 파일 경로와 해당 문장, 현재 요청에 적용되는 이유를 설명한다.
dev 서버는 백그라운드 모드로 띄운다: `pnpm astro dev --background`
(`pnpm astro dev stop` / `status` / `logs`). `astro`는 로컬 의존성이라 맨 명령으로는 못 부른다.

작업을 마치면 `pnpm check`를 실행한다. 브라우저 확인 범위는 `docs/verification.md`에서 변경 종류에 맞춰 고른다.
필수 검사가 통과한 뒤에는 새 변경·실패·미해결 우려가 있을 때만 검사를 반복하거나 범위를 넓힌다.

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

새 페이지·덱의 필수 필드, category·tag 선택, `<Thesis>`·`<TermIntro>` 규칙은
[콘텐츠 작성 규칙](docs/content-authoring.md)의 프론트매터·덱 메타데이터 절을 따른다.

## 절대 깨뜨리면 안 되는 것

- `astro.config.mjs`에서 `astroD2()`가 `starlight()`보다 먼저 와야 한다.
- 본문 MDX의 `deckGroup`은 같은 폴더 `_deck.mjs`의 group id여야 하고, `sidebar.order`는 덱 안에서
  중복되면 안 된다. 파일명을 바꾸면 `_deck.mjs`의 `map` 링크와 본문 링크도 함께 확인한다.
- 랜딩(`/`)은 어느 topic에도 속하지 않는다. topic 밖 페이지는 plugin `exclude`에 추가한다.
- 사이드바 UI는 `src/components/layout/`의 `Sidebar`·`SiteTitle`·`SidebarToggle` override 세트다.
  실제 접힘 레이아웃은 `src/styles/custom.css`의 전역 규칙이다.
- `pnpm-workspace.yaml`은 워크스페이스 목록이 아니라 esbuild·sharp의 빌드 허용 설정이다. 지우지 않는다.

세부 작성 규칙과 MDX 함정은 `docs/content-authoring.md`, D2 전용 규칙은 `docs/d2-authoring.md`에서 관리한다.
