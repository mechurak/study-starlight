# Study Notes (Starlight)

여러 기술 주제의 스터디 노트를 [Astro Starlight](https://starlight.astro.build)로 만들어
하나의 문서 사이트로 배포하는 레포. [study-decks](../study-decks)(Slidev 슬라이드)의
후속으로, **축적·검색·참조**에 맞는 docs 형태로 정리한다.

## 구조

```
astro.config.mjs              # 사이트 설정 + topics(덱 목록) 정의
src/content/docs/
  index.mdx                   # 랜딩 페이지 (splash + 덱 카드)
  cka/                        # 덱 하나 = 디렉터리 하나 = topic 하나
    index.md                  #   덱 개요 페이지
    00-intro.md … 20-wrapup.md
src/styles/custom.css         # 최소 커스텀 (mermaid 오버플로 처리뿐)
```

- **덱 하나 = topic 하나** — [starlight-sidebar-topics](https://starlight-sidebar-topics.netlify.app)가
  상단에서 덱을 전환하고 덱마다 독립된 사이드바를 준다
- **검색은 Pagefind 내장** — 빌드 시 정적 인덱스가 생성된다. 별도 설정 없음
- **mermaid는 [astro-mermaid](https://www.npmjs.com/package/astro-mermaid)** — ```` ```mermaid ````
  펜스를 클라이언트에서 렌더하고 라이트/다크 테마를 자동 추적한다

## 사용법

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # dist/ 생성 + Pagefind 인덱스
pnpm preview
```

## 새 덱 추가

1. `src/content/docs/<덱이름>/` 에 `index.md`(개요)와 본문 페이지를 만든다
2. `astro.config.mjs`의 `starlightSidebarTopics([...])` 배열에 topic을 추가한다
   (label / link / icon / items — 사이드바 그룹과 페이지 slug를 여기서 정한다)
3. `src/content/docs/index.mdx` 랜딩의 카드 목록에 항목을 추가한다

## 문서 작성 규칙

- **순수 마크다운으로 쓴다.** HTML 태그(`<div>`, `<strong>` 등)를 쓰지 않는다
- 시험 포인트·팁은 `:::tip[제목]`, 함정·주의는 `:::caution[제목]` aside를 쓴다
- 페이지 프론트매터는 `title` / `description` 두 개면 충분하다.
  사이드바 순서·그룹은 `astro.config.mjs`의 topics에서 slug로 관리한다
- 다이어그램은 ```` ```mermaid ```` 펜스로 — 별도 이미지 파일을 만들지 않는다

## 배포

정적 빌드 산출물(`dist/`)이므로 아무 정적 호스팅에나 올릴 수 있다.
Cloudflare Pages 기준:

```bash
pnpm build
pnpm exec wrangler pages deploy dist --project-name=<프로젝트명>
```

배포 URL이 정해지면 `astro.config.mjs`에 `site: 'https://…'`를 넣는다
(sitemap 생성에 필요).
