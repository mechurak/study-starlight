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
    index.mdx                 #   덱 개요 페이지
    00-intro.mdx … 20-wrapup.mdx  #   본문 페이지 (컴포넌트를 쓰므로 전부 .mdx)
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

- **raw HTML 태그(`<div>`, `<strong>` 등)는 쓰지 않는다.** 강조는 `**`로 한다
- 시험 포인트·팁은 `:::tip[제목]`, 함정·주의는 `:::caution[제목]` aside를 쓴다
- 페이지 프론트매터는 `title` / `description` 두 개면 충분하다.
  사이드바 순서·그룹은 `astro.config.mjs`의 topics에서 slug로 관리한다
- 다이어그램은 ```` ```mermaid ```` 펜스로 — 별도 이미지 파일을 만들지 않는다
- **Starlight 내장 컴포넌트는 쓴다.** 절차는 `<Steps>`, 두 갈래 비교는 `<Tabs>`,
  개요 카드는 `<CardGrid>`, 디렉터리 구조는 `<FileTree>`.
  쓰려면 파일 확장자를 **`.mdx`로 바꾸고** 맨 위에 import를 넣는다 —
  topics의 slug는 확장자를 안 쓰므로 `astro.config.mjs`는 건드리지 않아도 된다

  ```mdx
  import { Steps, Card, CardGrid, Tabs, TabItem, FileTree } from '@astrojs/starlight/components';
  ```

## 배포

**Cloudflare Pages + GitHub 연동**으로 `main`에 푸시하면 자동 배포된다.
브랜치를 밀면 그 브랜치의 preview URL이 따로 생긴다.

### 최초 연결 (대시보드에서 한 번만)

Git 연결은 OAuth 승인이 필요해서 **대시보드에서만** 할 수 있다 (CLI/API 불가).

1. Cloudflare 대시보드 → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
2. GitHub 로그인 → `mechurak/study-starlight` 선택 → **Install & Authorize** → **Begin setup**
3. 빌드 설정을 아래처럼 넣는다

   | 항목 | 값 |
   |---|---|
   | Framework preset | Astro |
   | Build command | `pnpm build` |
   | Build output directory | `dist` |
   | Production branch | `main` |

4. **Settings → Environment variables 에 반드시 추가** (아래 참고)

   | 변수 | 값 |
   |---|---|
   | `PNPM_VERSION` | `11.20.0` |

### 왜 `PNPM_VERSION`을 박아야 하나

- `pnpm-workspace.yaml`의 **`allowBuilds`는 pnpm 10.26.0에서 들어온 문법**인데,
  Cloudflare v3 빌드 이미지의 기본 pnpm은 **10.11.1** 이다 → 필드를 무시하고
  **esbuild·sharp의 빌드 스크립트가 막혀 빌드가 깨진다**
- v3 이미지는 **`pnpm-lock.yaml`에서 pnpm 버전을 자동 감지하지 않는다.** 직접 지정해야 한다
- Node 버전은 `.nvmrc`(현재 `24`)로 고정된다 — 이건 파일이라 대시보드 설정이 필요 없다

### 배포 후

- 기본 도메인은 `https://<프로젝트명>.pages.dev` 다.
  실제 URL이 다르거나 커스텀 도메인을 붙이면 **`astro.config.mjs`의 `site`를 그 값으로 고친다**
  (sitemap이 이 값으로 생성된다)

### 로컬에서 직접 올리고 싶을 때

```bash
pnpm build
pnpm exec wrangler pages deploy dist --project-name=<프로젝트명>
```
