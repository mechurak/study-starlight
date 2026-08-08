# Study Notes (Starlight)

여러 기술 주제의 스터디 노트를 [Astro Starlight](https://starlight.astro.build)로 만들어
하나의 문서 사이트로 배포하는 레포. **축적·검색·참조**에 맞는 docs 형태로 정리한다.

정식 주소: <https://study.upggu.com>

## 구조

```
astro.config.mjs              # 사이트 설정 + topics(덱 목록) 정의 — 덱 목록의 원본
src/content/docs/
  index.mdx                   # 랜딩 페이지 (splash + 덱 카드)
  cka/ …                      # 덱 하나 = 디렉터리 하나 = topic 하나
    index.mdx                 #   덱 개요 페이지
    00-intro.mdx …            #   본문 페이지 (컴포넌트를 쓰므로 전부 .mdx)
src/components/               # 문서에서 import 하는 데모·시각화 컴포넌트
src/styles/custom.css         # 폰트·본문 폭·mermaid 오버플로 커스텀
docs/                         # 레포 운영 문서 (배포, 덱별 기준 시점)
CLAUDE.md                     # 작업 규칙 (Claude Code 용)
```

어떤 덱이 있는지는 `astro.config.mjs`의 topics(또는 사이트 상단의 topic 전환 메뉴)를 보면 된다.

- **덱 하나 = topic 하나** — [starlight-sidebar-topics](https://starlight-sidebar-topics.netlify.app)가
  상단에서 덱을 전환하고 덱마다 독립된 사이드바를 준다
- **검색은 Pagefind 내장** — 빌드 시 정적 인덱스가 생성된다. 별도 설정 없음
- **mermaid는 [astro-mermaid](https://www.npmjs.com/package/astro-mermaid)** — ```` ```mermaid ````
  펜스를 클라이언트에서 렌더하고 라이트/다크 테마를 자동 추적한다
- **테마는 [starlight-theme-rapide](https://starlight-theme-rapide.vercel.app), 본문 폰트는
  Pretendard**(셀프호스팅, dynamic subset)

## 사용법

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # dist/ 생성 + Pagefind 인덱스
pnpm preview
```

## 새 덱 추가

1. `src/content/docs/<덱이름>/` 에 `index.mdx`(개요)와 본문 페이지를 만든다
2. `astro.config.mjs`의 `starlightSidebarTopics([...])` 배열에 topic을 추가한다
   (label / link / icon / items — 사이드바 그룹과 페이지 slug를 여기서 정한다)
3. `src/content/docs/index.mdx` 랜딩의 카드 목록과 hero 액션에 항목을 추가한다

README나 CLAUDE.md는 고칠 필요가 없다 — 단, 덱에 특별한 규칙·기준 문서가 생기면
[CLAUDE.md](CLAUDE.md)의 "덱" 절에만 한 줄 추가한다.

## 더 읽을 것

| 문서 | 내용 |
|---|---|
| [CLAUDE.md](CLAUDE.md) | **문서 작성 규칙**(제목 계층, aside, 컴포넌트, mermaid 팔레트), 깨뜨리면 안 되는 설정, 검증 절차 |
| [docs/deploy.md](docs/deploy.md) | Cloudflare Pages 연동, `PNPM_VERSION`, 도메인 변경 |
| [docs/cka-baseline.md](docs/cka-baseline.md) | cka 덱의 기준 커리큘럼·시험 환경 버전과 출처 |
