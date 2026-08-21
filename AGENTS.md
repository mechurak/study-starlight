# AGENTS.md

Astro Starlight 기반 개인 스터디 노트 사이트. 슬라이드가 아니라 **축적·검색·참조**에 맞는 문서다.
덱 하나 = `src/content/docs/<이름>/` = topic 하나.

## 작업 전에 읽을 것

- 구조와 사용법: [README.md](README.md)
- 콘텐츠를 쓰거나 고칠 때: [docs/content-authoring.md](docs/content-authoring.md)
- 검증 방법: [docs/verification.md](docs/verification.md)
- 배포: [docs/deploy.md](docs/deploy.md)
- Starlight 설정·override를 고칠 때: [docs/starlight-changes.md](docs/starlight-changes.md)와 대상 컴포넌트 머리 주석
- 덱 폴더에 `_baseline.md`가 있으면 **그 덱을 고치기 전에 반드시 먼저 읽는다.**

## 작업 방식

소유자 1인이 혼자 쓰는 레포다. `main`에 직접 커밋하며, 커밋·푸시는 요청받았을 때만 한다.
dev 서버는 백그라운드 모드로 띄운다: `astro dev --background`
(`astro dev stop` / `astro dev status` / `astro dev logs`).

작업을 마치면 `pnpm check`를 실행한다. 브라우저 확인 범위는 `docs/verification.md`에서 변경 종류에 맞춰 고른다.

## 덱

덱 목록·사이드바·랜딩 카드의 **단일 원본은 `src/data/decks.mjs`**다.
새 덱은 문서 폴더를 만든 뒤 이 manifest에 한 번만 추가한다. 장 수는 등록된 slug에서 자동 계산된다.

`_baseline.md`에는 기준 버전, 덱 전용 서술 규칙, 범위 경계를 둔다. `_`로 시작하는 파일은
콘텐츠 컬렉션에서 제외되어 빌드·검색·사이드바에 나오지 않는다.

`src/data/decks.mjs`의 `termIntroDeckSlugs`에 등록된 덱의 **학습 본문 장**은 첫머리에
`<TermIntro>`를 둔다. `index`, `*-glossary`, `*-wrapup`은 제외한다.
**새 학습 덱은 만들 때 여기에 등록한다.** 실습·문제풀이 위주 덱(cka-udemy, kagent-lab 같은)은
등록하지 않고, 이 규칙 도입 전의 덱 일부도 빠져 있다.
형식은 `src/components/docs/TermIntro.astro` 머리 주석에 있다.

## 절대 깨뜨리면 안 되는 것

- `astro.config.mjs`에서 `astroD2()`와 `mermaid()`가 모두 `starlight()`보다 먼저 와야 한다.
- `src/data/decks.mjs`의 topic `items`는 확장자 없는 slug 문자열이다. 파일명을 바꾸면 같이 바꾼다.
- 랜딩(`/`)은 어느 topic에도 속하지 않는다. topic 밖 페이지는 plugin `exclude`에 추가한다.
- 사이드바 UI는 `src/components/layout/`의 `Sidebar`·`SiteTitle`·`SidebarToggle` override 세트다.
  실제 접힘 레이아웃은 `src/styles/custom.css`의 전역 규칙이다.
- `pnpm-workspace.yaml`은 워크스페이스 목록이 아니라 esbuild·sharp의 빌드 허용 설정이다. 지우지 않는다.

세부 작성 규칙과 MDX·Mermaid 함정은 이 파일에 복제하지 않고 `docs/content-authoring.md` 한 곳에서 관리한다.
