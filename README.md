# Study Notes (Starlight)

여러 기술 주제의 스터디 노트를 [Astro Starlight](https://starlight.astro.build)로 만들어
하나의 문서 사이트로 배포하는 레포. **축적·검색·참조**에 맞는 docs 형태로 정리한다.

정식 주소: <https://study.upggu.com>

## 구조

```
astro.config.mjs              # 사이트 설정 — 파생된 덱 데이터를 Starlight에 연결
src/data/catalog.mjs          # 전역 category·tag 어휘
src/data/load-decks.mjs       # 덱별 설정과 MDX 파일을 대조하는 파생 loader
src/data/decks.mjs            # 기존 import를 위한 loader re-export (직접 편집하지 않음)
src/content/docs/
  index.mdx                   # 랜딩 페이지 (splash + 덱 카드)
  cka/ …                      # 덱 하나 = 디렉터리 하나 = topic 하나
    _deck.mjs                 #   이 덱의 메타데이터·사이드바 목록·DeckMap
    _baseline.md              #   기준 버전·서술 규칙·범위 경계
    index.mdx                 #   덱 개요 페이지
    intro.mdx …               #   번호 없는 본문 페이지 — 제목·설명은 frontmatter
src/components/               # layout / docs / demos 역할별 컴포넌트
src/styles/custom.css         # 폰트·본문 폭·검색 UI 전역 커스텀
docs/                         # 작성·검증·배포·Starlight 운영 문서
labs/                         # 본문과 함께 관리하는 실행 실습 — Keycloak은 Compose guided lab
AGENTS.md                     # 에이전트 작업 진입점 — 공유 정본
CLAUDE.md                     # @AGENTS.md 한 줄 어댑터 (Claude Code용)
```

어떤 덱이 있는지는 `src/content/docs/*/_deck.mjs` 또는 사이트 상단의 topic 전환 메뉴를 보면 된다.
덱 목록·랜딩 카드는 이 파일들에서 파생되고, 사이드바는 각 덱의 `sidebar` 목록 순서를 따른다.

- **덱 하나 = topic 하나** — [starlight-sidebar-topics](https://starlight-sidebar-topics.netlify.app)가
  상단에서 덱을 전환하고 덱마다 독립된 사이드바를 준다
- **검색은 Pagefind 내장** — 빌드 시 정적 인덱스가 생성된다. 별도 설정 없음
- **다이어그램은 [astro-d2](https://astro-d2.vercel.app)** — ```` ```d2 ```` 펜스를 빌드 때
  SVG로 만들어 문법 오류를 빌드가 잡는다. 예전에 함께 쓰던 mermaid 통합은 2026-08에
  전부 D2로 변환하고 제거했다
- **이미지 확대는 [starlight-image-zoom](https://github.com/HiDeoo/starlight-image-zoom)** —
  본문 이미지와 D2 다이어그램을 클릭하면 전체 화면 dialog로 연다
- **테마는 [starlight-theme-rapide](https://starlight-theme-rapide.vercel.app), 본문 폰트는
  Pretendard**(셀프호스팅, dynamic subset)

## 사용법

```bash
npm install
npm run dev         # http://localhost:4321
npm run build       # dist/ 생성 + Pagefind 인덱스
npm run check       # 콘텐츠 규칙 + build + 렌더된 내부 링크 검사
npm run report:content # 덱별 검토 이력·Thesis 이관 현황
npm run preview
```

## 새 페이지 추가

1. 대상 덱의 `_baseline.md`를 읽고 `service-account.mdx`처럼 개념·작업 이름으로 `.mdx`를 만든다.
   제목·파일명·URL에는 페이지 번호를 붙이지 않는다.
2. frontmatter에는 `title`·`description`을 적는다. 같은 덱 `_deck.mjs`의 `sidebar[].pages`에
   확장자 없는 상대 경로를 원하는 위치에 추가한다. 그룹과 페이지 모두 배열 순서대로 표시된다.
3. 새 본문에는 `<Thesis>`를 두고, `_deck.mjs`의 `termIntro`가 `required`면 glossary·wrapup을
   제외한 학습 본문에 `<TermIntro>`도 둔다.
4. `npm run check`를 실행한다. 실행 중인 dev 서버에서 페이지를 새로 만들거나 이름을 바꿨다면
   파생 사이드바를 다시 읽도록 서버를 재시작한다.

페이지 URL은 파일 경로가, 그룹·읽는 순서는 덱의 `sidebar`가 정한다. 새 장을 추가할 때는
그 덱의 목록에 한 줄을 추가하며, 전역 파일은 고칠 필요가 없다.
기존 번호 페이지를 일괄 변경하는 것은 별도 개편에서 다룬다. 페이지 추가·분할·순서 변경은
`npm run check`와 메타데이터 확인으로 마치며, 브라우저는 구체적인 화면 동작·레이아웃 확인이
필요할 때만 쓴다. 지침·계획 문서만 바꾼 경우에는 diff와 참조 경로 확인으로 충분하다.
자세한 범위는 [검증 지침](docs/verification.md)을 따른다.

## 새 덱 추가

1. `src/content/docs/<덱이름>/`을 만들고 가까운 성격의 `_deck.mjs`를 복사해 메타데이터,
   `navOrder`, `catalogOrder`, 사이드바 `sidebar`, index의 `map`을 정의한다.
2. `_baseline.md`를 만들어 기준 버전·서술 규칙·범위 경계를 적고, `index.mdx`와 본문 페이지를 만든다.
   index의 구성 절에는 `<DeckMap deck="<덱이름>" />`를 둔다.
3. `category`(4종 중 하나)와 `tags` 목록을 정한다. 정말 새 전역 어휘가 필요할 때만
   `src/data/catalog.mjs`를 고친다. 한 장에서 스치는 주제는 태그로 붙이지 않는다.
   해당하는 태그가 없으면 `tags: []`로 둔다.
4. 개념 학습 덱은 `termIntro: 'required'`, 실습·문제풀이 위주 덱은 `not-required`로 정한다.
   `legacy`는 기존 미이관 덱에만 쓴다.
5. `npm run check`로 설정·파일·링크가 모두 맞는지 확인한다.

`_`로 시작하는 `_deck.mjs`와 `_baseline.md`는 콘텐츠 컬렉션·검색·사이드바에 나오지 않는다.

## 더 읽을 것

| 문서 | 내용 |
|---|---|
| [AGENTS.md](AGENTS.md) | 작업 진입점, 반드시 읽을 문서와 깨뜨리면 안 되는 설정 — `CLAUDE.md`는 이 파일을 import하는 어댑터 |
| [docs/plans/README.md](docs/plans/README.md) | 명시적으로 요청한 계획의 생성·번호·검색·실행 기록·완료 규칙 |
| [docs/content-authoring.md](docs/content-authoring.md) | 제목 계층, 프론트매터, 컴포넌트 작성 규칙 |
| [docs/d2-authoring.md](docs/d2-authoring.md) | D2를 추가·수정할 때만 읽는 배치·문법·의미 팔레트 |
| [docs/verification.md](docs/verification.md) | 자동 검사와 변경별 브라우저 검증 |
| [docs/starlight-changes.md](docs/starlight-changes.md) | 기본 Starlight에서 바꾼 것 전체 목록 — 업그레이드 전에 볼 것 |
| [docs/deploy.md](docs/deploy.md) | Cloudflare Pages 연동, `PNPM_VERSION`, 도메인 변경 |
| `src/content/docs/<덱>/_baseline.md` | 덱별 기준 버전·서술 규칙·범위 경계 — 모든 덱에 있고, 그 덱을 고치기 전에 반드시 먼저 읽는다 |
| [labs/keycloak/README.md](labs/keycloak/README.md) | Keycloak Compose guided 실습의 시작·적용·검증·재개 정본 |
