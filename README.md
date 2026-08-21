# Study Notes (Starlight)

여러 기술 주제의 스터디 노트를 [Astro Starlight](https://starlight.astro.build)로 만들어
하나의 문서 사이트로 배포하는 레포. **축적·검색·참조**에 맞는 docs 형태로 정리한다.

정식 주소: <https://study.upggu.com>

## 구조

```
astro.config.mjs              # 사이트 설정 — 덱 manifest를 Starlight에 연결
src/data/decks.mjs            # 덱·사이드바·랜딩 카드의 단일 원본
src/content/docs/
  index.mdx                   # 랜딩 페이지 (splash + 덱 카드)
  cka/ …                      # 덱 하나 = 디렉터리 하나 = topic 하나
    index.mdx                 #   덱 개요 페이지
    00-intro.mdx …            #   본문 페이지 (컴포넌트를 쓰므로 전부 .mdx)
src/components/               # layout / docs / demos 역할별 컴포넌트
src/styles/custom.css         # 폰트·본문 폭·검색 UI 전역 커스텀
docs/                         # 작성·검증·배포·Starlight 운영 문서
AGENTS.md                     # 에이전트 작업 진입점 — 공유 정본
CLAUDE.md                     # @AGENTS.md 한 줄 어댑터 (Claude Code용)
```

어떤 덱이 있는지는 `src/data/decks.mjs` 또는 사이트 상단의 topic 전환 메뉴를 보면 된다.

- **덱 하나 = topic 하나** — [starlight-sidebar-topics](https://starlight-sidebar-topics.netlify.app)가
  상단에서 덱을 전환하고 덱마다 독립된 사이드바를 준다
- **검색은 Pagefind 내장** — 빌드 시 정적 인덱스가 생성된다. 별도 설정 없음
- **mermaid는 [astro-mermaid](https://www.npmjs.com/package/astro-mermaid)** — ```` ```mermaid ````
  펜스를 클라이언트에서 렌더하고 라이트/다크 테마를 자동 추적한다. `MermaidZoom.astro`가
  공통 카드와 클릭 확대를 덧붙인다
- **D2는 [astro-d2](https://astro-d2.vercel.app)** — ```` ```d2 ```` 펜스를 빌드 때 SVG로 만들며,
  관계를 더 정돈된 레이아웃과 애니메이션으로 강조할 때 선택한다
- **이미지 확대는 [starlight-image-zoom](https://github.com/HiDeoo/starlight-image-zoom)** —
  본문 이미지와 D2 다이어그램을 클릭하면 전체 화면 dialog로 연다
- **테마는 [starlight-theme-rapide](https://starlight-theme-rapide.vercel.app), 본문 폰트는
  Pretendard**(셀프호스팅, dynamic subset)

## 사용법

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # dist/ 생성 + Pagefind 인덱스
pnpm check      # 콘텐츠 규칙 검사 + build
pnpm preview
```

## 새 덱 추가

1. `src/content/docs/<덱이름>/` 에 `index.mdx`(개요)와 본문 페이지를 만든다
2. 덱 폴더에 `_baseline.md`를 만들어 기준 버전·서술 규칙·범위 경계를 적는다 — 거의 모든
   덱이 갖고 있는 표준 관행이다 ([AGENTS.md](AGENTS.md)의 "덱" 절 참고.
   `_`로 시작하는 파일이라 빌드에는 안 잡힌다)
3. `src/data/decks.mjs`에 덱 메타데이터와 사이드바 그룹·slug를 추가한다.
   `category`(4종 중 하나)와 `tags`(최소 하나)는 필수다 — 둘 다 `pnpm check`가 검사한다.
   배열에 넣는 **위치가 랜딩 카드 순서**이므로 제 카테고리 블록 안에 넣는다
   (`topicOrder`는 사이드바 순서라 별개다).
   학습 덱이면 `termIntroDeckSlugs`에도 등록한다 (기준은 AGENTS.md의 "덱" 절)
4. `pnpm check`로 manifest와 실제 파일이 맞는지 확인한다

README나 AGENTS.md는 고칠 필요가 없다 — 덱별 규칙은 전부 그 덱의 `_baseline.md`에 둔다.

## 더 읽을 것

| 문서 | 내용 |
|---|---|
| [AGENTS.md](AGENTS.md) | 작업 진입점, 반드시 읽을 문서와 깨뜨리면 안 되는 설정 — `CLAUDE.md`는 이 파일을 import하는 어댑터 |
| [docs/content-authoring.md](docs/content-authoring.md) | 제목 계층, 프론트매터, 컴포넌트, Mermaid·D2 작성 규칙 |
| [docs/verification.md](docs/verification.md) | 자동 검사와 변경별 브라우저 검증 |
| [docs/starlight-changes.md](docs/starlight-changes.md) | 기본 Starlight에서 바꾼 것 전체 목록 — 업그레이드 전에 볼 것 |
| [docs/deploy.md](docs/deploy.md) | Cloudflare Pages 연동, `PNPM_VERSION`, 도메인 변경 |
| `src/content/docs/<덱>/_baseline.md` | 덱별 기준 버전·서술 규칙·범위 경계 — 거의 모든 덱에 있고, 그 덱을 고치기 전에 반드시 먼저 읽는다 |
