# CLAUDE.md

Astro Starlight 기반 스터디 노트 사이트. 덱 하나 = `src/content/docs/<이름>/` = topic 하나.

이 문서에는 **레포를 봐서는 알 수 없는 것**만 적는다 —
구조와 사용법은 [README.md](README.md), 배포는 [docs/deploy.md](docs/deploy.md)에 있다.

## 작업 방식

소유자 1인이 혼자 쓰는 레포다. 커밋은 `main`에 직접 하고, 커밋/푸시는 요청받았을 때만 한다.
슬라이드가 아니라 문서다 — **축적·검색·참조**에 맞게 쓴다.

dev 서버는 백그라운드 모드로 띄운다: `astro dev --background`
(관리: `astro dev stop` / `astro dev status` / `astro dev logs`)

## 덱

덱 목록의 원본은 `astro.config.mjs`의 topics와 랜딩(`src/content/docs/index.mdx`)이다.
여기에는 **고치기 전에 알아야 할 것이 있는 덱만** 적는다 — 특별한 규칙이 없는 덱은
새로 만들어도 이 문서를 고칠 필요가 없다.

- `cka` — **[docs/cka-baseline.md](docs/cka-baseline.md)를 먼저 읽는다** (기준 커리큘럼과 버전 고정)
- `shadcn` — 아래 절의 전용 규칙 셋을 따른다
- `shadcn` · `web` · `keycloak` · `kafka` — 각 장 첫머리의 `<TermIntro>` 상자가 의무다 (아래 절)

### shadcn 덱

`frontend` 13~16장과 주제가 겹치지만 **동기화 대상이 아니다** — 목적이 다르다.
`frontend`는 세 도구의 흐름, `shadcn`은 shadcn/ui 하나를 **테마 = 리소스 목록** 관점으로 깊게 판다.
`frontend` 13~16장과 index에는 이쪽으로 오는 aside 링크만 걸어 뒀다.

이 덱은 **읽기 어렵다는 피드백에서 나왔다.** 그래서 규칙이 셋 더 있다 —

- **용어 규칙("콘텐츠 규칙" 절)을 각 장 첫머리의 `<TermIntro>` 상자로 강제한다**
  (`src/components/TermIntro.astro`). `web`·`keycloak`·`kafka` 덱도 이 규칙을 같이 쓴다.
  `terms`는 `[용어, 풀 이름(없으면 ''), 한 줄 설명][]`이고, 설명 안의 백틱은 코드로 안 바뀐다 — 평문이다
- **곁가지를 넣지 않는다.** 뺀 것은 [0장의 "다루지 않는 것" 표](src/content/docs/shadcn/00-intro.mdx)에
  이름만 남긴다. 새 내용을 넣을 때 그 표와 충돌하는지 먼저 본다
- **12장은 용어 사전**이다. 새 약어를 본문에 쓰면 여기에도 추가한다

## 외관 — 세 겹

- **테마**: `starlight-theme-rapide` (코드 블록 테마도 Vitesse 계열로 함께 바뀐다)
- **폰트**: Pretendard Variable 셀프호스팅. `customCss`의 **dynamic subset** CSS가 핵심이다
  — 한글 폰트는 웨이트당 수 MB라, 쓰인 글자의 조각만 내려받는 이 방식이 아니면 못 쓴다
- **본문 폭**: `--sl-content-width: 55rem` (기본 45rem은 다이어그램·표 위주 문서에 좁다)

## 절대 깨뜨리면 안 되는 것

- **`astro.config.mjs`에서 `mermaid()`가 `starlight()`보다 먼저** 와야 한다.
  순서가 바뀌면 ```` ```mermaid ```` 펜스가 그냥 코드 블록으로 렌더된다.
- **topics의 `items`는 slug 문자열**(`'cka/00-intro'`)이다. 파일명을 바꾸면
  config의 slug도 같이 바꿔야 한다 — 빌드가 sidebar 참조 오류로 실패하니 바로 잡힌다.
- **랜딩(`/`)은 어느 topic에도 속하지 않는다** — plugin 옵션 `exclude: ['/']`가 그 처리다.
  topic 밖 페이지를 새로 만들면 여기에 추가해야 경고가 안 난다.
- **덱 목록은 사이드바 상단 드롭다운이다** — `src/components/Sidebar.astro`가
  starlight-sidebar-topics의 `Sidebar` override를 대체하고
  `starlight-sidebar-topics-dropdown`의 `TopicsDropdown`을 끼운다.
  플러그인이 자기 `components` 뒤에 사용자 `components`를 스프레드해서 이게 성립한다 —
  **덱 목록을 다시 나열하고 싶으면 config의 `Sidebar` 줄을 지우면 원래대로 돌아온다.**
  `src/components/SiteTitle.astro`(헤더의 "Study Note / <덱>")도 같은 라우트 데이터를 쓴다.
- **사이드바 접기 버튼은 `SiteTitle` override에 얹혀 있다** — 헤더에서 갈아끼울 수 있는
  자리가 SiteTitle·Search·SocialIcons뿐이라 `src/components/SidebarToggle.astro`를
  SiteTitle이 렌더한다. 버튼은 `<html data-sidebar-collapsed>`만 토글하고(localStorage에 저장),
  **실제로 레이아웃을 접는 CSS는 `src/styles/custom.css`에 있다** — Starlight의
  `.sidebar-pane`과 `--sl-content-inline-start`를 덮는 전역 규칙이라 컴포넌트 스코프로는 안 닿는다.
  첫 페인트 전에 상태를 복원해야 해서 그 스크립트만 `is:inline`이다(기본 `<script>`는 defer라 깜빡인다).
- **`pnpm-workspace.yaml`은 워크스페이스가 아니라 `allowBuilds`(esbuild·sharp) 설정용**이다.
  지우면 설치 시 빌드 스크립트가 막히고, **sharp가 안 빌드돼 `astro build`가 깨진다.**
  CI에서 실제로 걸리는 지점이라 pnpm 버전을 고정해야 한다 — 이유는 [docs/deploy.md](docs/deploy.md).

## 콘텐츠 규칙

페이지는 전부 `.mdx`다. 새 페이지도 처음부터 `.mdx`로 만든다.
본문 구조는 **표는 훑어보기용, 그림(mermaid)은 "왜 그런가"용**으로 역할을 나눈다 —
원래 있던 사실을 지우면서 그림으로 대체하지 않는다.

- **새 용어·약어는 처음 나올 때 풀 이름을 주고, 새 개념은 "왜 필요한지"부터 설명한다.**
  "이게 뭔지"보다 "**없으면 무슨 문제가 생기는지**"가 잘 읽힌다 — 문제 → 해법 순서로 쓴다.
  (shadcn·web·keycloak·kafka 덱은 여기에 더해 `<TermIntro>` 상자가 의무다 — 위 "덱" 절.)
- **제목 계층으로 우측 목차(TOC)를 조직한다.** 목차에는 h2·h3만 나온다.
  h2는 **주제 묶음 5~9개**로 세우고 상세 절은 h3로 내린다 — h2만 나열하면 목차가
  평면이 되어 안 읽히고, h4는 목차에 안 잡히니 만들지 않는다.
  제목을 고치면 앵커 slug도 바뀐다는 점에 주의한다.
- **시각 효과는 환영하되, raw HTML을 본문에 인라인으로 쓰지 않는다.**
  문서가 "있어보이는" 건 페이지별 장식이 아니라 덱 전체의 일관성 —
  mermaid 팔레트, aside 라벨, 컴포넌트 역할 분담 — 에서 나온다.
  한 번 쓸 강조는 `**`와 aside로, Starlight 내장 컴포넌트는 아래 절의 역할 표대로 쓴다.
  **그 이상이 필요하면 `src/components/`에 Astro 컴포넌트를 만들어 import한다** —
  단, 만들기 전에 기존 컴포넌트에 비슷한 게 있는지 먼저 훑는다.
  스타일은 컴포넌트 `<style>`에 캡슐화하고(다크 모드는 `[data-theme='dark']`로 대응),
  본문에는 태그 하나만 남긴다. 사이트 전역 조정은 `src/styles/custom.css`.
- **닫는 `**` 앞에 문장부호를 두지 않는다** — 한글 문서에서 제일 잘 깨지는 자리다.
  닫는 `**` 바로 앞이 따옴표·괄호·`%`·백틱이고 뒤에 한글 조사가 붙으면, CommonMark가
  강조를 닫지 못해 **`**`가 화면에 그대로 나온다.** 빌드는 통과하니 안 잡힌다.
  ~~`**"조회 → 해결"**의`~~ → `"**조회 → 해결**"의` (따옴표·괄호를 굵게 밖으로),
  ~~`**커리큘럼의 25%**가`~~ → `**커리큘럼의 25%가**` (조사를 굵게 안으로),
  ~~`` **`get all`**이다 ``~~ → `` `get all`이다 `` (코드 서식이 이미 강조다 — `**`를 뺀다).
  의심되면 눈이 아니라 산출물로 판정한다 — `pnpm build` 후
  `grep -rho '\*\*[^<*]\{0,45\}' dist --include=index.html | sort -u`.
  코드 블록 안(글롭 `/**`, JS 주석)에 남는 것은 정상이다.
- 시험 포인트·핵심 원칙은 `:::tip[…]`, 함정·주의는 `:::caution[함정]` aside를 쓴다.
  aside 제목에 구체 라벨을 달 수 있다 (`:::caution[함정 1 — ...]` 처럼).
- 다이어그램은 ```` ```mermaid ```` 펜스로 — **별도 이미지 파일을 만들지 않는다.**
- **프론트매터는 `title` / `description` 두 개면 충분하다.** 사이드바 순서·그룹은
  `astro.config.mjs`의 topics에서 slug로 관리하므로 `sidebar` 계열 필드를 쓰지 않는다.
  사이드바 라벨은 `title`에서 온다 — 장 번호를 제목에 유지한다 ("7. 스케줄링").

## 시각화 — 다이어그램과 컴포넌트

**컴포넌트를 쓰려면 파일이 `.mdx`여야 한다** (전 페이지가 이미 `.mdx`다).
topics의 slug는 **확장자를 안 쓰므로** 파일 확장자와 무관하다.
`@astrojs/mdx`는 Starlight의 전이 의존성이라 별도 설치가 필요 없다.

```mdx
import { Steps, Card, CardGrid, Tabs, TabItem, FileTree, LinkCard, Badge } from '@astrojs/starlight/components';
```

무엇을 어디에 쓰는지 —

| 컴포넌트 | 쓸 자리 |
|---|---|
| `<Steps>` | 순서가 있는 절차 (etcd 복구, kubeadm 업그레이드, 진단 순서) |
| `<Tabs>` | **차이만 보여주고 싶은 두 갈래** (Immediate/WaitForFirstConsumer, 느린 정책/빠른 정책) |
| `<CardGrid>` + `<Card>` | 층·분류의 개요. 장 첫머리나 "해결책 넷 중 하나" |
| `<FileTree>` | 디렉터리 구조 (`/etc/kubernetes/`, Helm 차트, `supabase/`) |
| `<LinkCard>` | 장 끝의 "다음 장으로" 안내 |
| `<LinkButton>` | 덱 index의 "첫 장부터 읽기" 시작 CTA — 덱마다 하나. 본문 중간에는 안 쓴다 (`<LinkCard>`와 역할이 겹친다) |
| `<Badge>` | 표·제목 옆의 짧은 상태 라벨 — 성숙도(`alpha`/`GA`), deprecated, 기본값, 시험 비중. variant 색이 aside 체계와 같다 |
| 아이콘 | 인라인 `<Icon>`이 아니라 **prop으로** — `<Card icon>`, topics의 덱 icon. 본문 문장 속 아이콘은 스캔을 방해한다 |
| mermaid 펜스 | 결정 트리, 관계도, 상태 머신, 시퀀스 |

`<FileTree>` 항목은 **`- 경로/` 뒤에 설명을 그냥 이어 쓰면** 회색 주석으로 붙고,
`**굵게**` 하면 강조 표시가 된다 — 중요한 파일을 눈에 띄게 하는 데 쓴다.

### 부딪힌 것들

- **`astro-mermaid`는 `.mdx`에서도 동작한다.** 빌드 로그에
  `[astro-mermaid] Sätteri transformed mermaid block in ...mdx` 가 찍히면 잡힌 것이다.
  단 **빌드 성공 ≠ 렌더 성공** — 렌더는 클라이언트에서 일어나니 브라우저로 확인해야 한다.
- **JSX 안의 마크다운은 들여쓰기하지 않는다.** `<Card>`·`<TabItem>` 자식을 2칸 이상 들여쓰면
  마크다운이 이를 코드 블록으로 먹는다. 컴포넌트 태그와 내용을 **전부 0칸**에 두고 빈 줄로 띄운다.
  (`<Steps>` 안의 번호 목록은 예외 — 목록 항목에 딸린 코드 블록은 3칸 들여쓴다.)
- **mermaid 노드 색은 `classDef`에 `color:`까지 박는다.** `fill`만 주면 다크 모드에서
  밝은 배경에 밝은 글자가 되어 안 읽힌다. 덱 전체가 쓰는 팔레트 —

  ```
  classDef ok   fill:#dcfce7,stroke:#16a34a,color:#14532d   /* 정상·성공 */
  classDef bad  fill:#fee2e2,stroke:#dc2626,color:#7f1d1d   /* 실패·원인 */
  classDef warn fill:#fef3c7,stroke:#d97706,color:#78350f   /* 주의·대기 */
  classDef key  fill:#dbeafe,stroke:#2563eb,color:#1e3a8a   /* 핵심 대상 */
  classDef mute fill:#f1f5f9,stroke:#94a3b8,color:#334155   /* 배경·경유 */
  classDef zone fill:#ede9fe,stroke:#7c3aed,color:#4c1d95   /* 층·구획 구분 (의미 판정 아님) */
  ```

  `stateDiagram-v2`는 **색을 주지 않는 편이 낫다** — 테마 기본값이 양쪽 모드에서 이미 잘 맞는다.
  덱 전체에 이 팔레트를 일관되게 쓰면 **색만 봐도 결론의 성격**이 읽힌다.
- **mermaid 라벨 안 문자.** 노드 텍스트는 `["…"]` 로 감싸면 대부분 안전하다 —
  `|`, `(`, `:`, `·`, 이모지 전부 통과한다. 다만 **`&` 는 `&amp;` 로 적어야** 하고,
  `<`/`>` 는 쓰지 않는다(`<br/>` 만 예외로 줄바꿈에 쓴다).
  엣지 라벨(`-->|"…"|`)도 따옴표로 감싸는 편이 안전하다.
- **subgraph를 여러 개 쓸 때 `flowchart TB`는 레이아웃이 대각선으로 흩어진다.**
  `flowchart LR` + subgraph 안에 `direction`을 주면 정렬된다 (HA 토폴로지 그림에서 겪었다).
- `<Tabs>` 안의 다이어그램은 **비활성 탭이 `hidden`이라** Playwright 검증 시 안 잡힌다.
  `document.querySelectorAll('[role="tabpanel"]').forEach(p => p.hidden = false)` 로 열고 찍는다.
- `src/content/docs/` 밑에 새 페이지를 만들면 **topics에 넣거나 `exclude`에 추가해야** 빌드가 통과한다
  (`Failed to find the topic for the ... page`). 파일명이 `_`로 시작하면 아예 빌드되지 않는다.
- **제목에 `<Badge>`를 달 때는 공백 없이 붙여 쓴다.** `### 집계 ClusterRole <Badge …/>` 처럼
  띄우면 앵커 slug 끝에 `-`가 붙어(`집계-clusterrole-`) 링크가 조용히 바뀐다 — 빌드는 통과한다.
  `### 집계 ClusterRole<Badge …/>` 로 붙이면 slug가 유지되고,
  간격은 `custom.css`의 `:is(h2, h3) > .sl-badge` 규칙이 준다.

## 검증

빌드가 대부분을 잡아준다.

```bash
pnpm build          # 실패하면 topics slug 오타나 mdx 문법이 대부분
npx serve dist -l 4323
```

**브라우저 검증은 무엇을 고쳤는지에 맞춰 고른다** — 덱을 수정했다고 전부 돌리지 않는다.
검색은 빌드가 통과하면 거의 안 깨지니 따로 확인하지 않는다 (Pagefind 인덱스가 빌드 산출물이다).

| 변경 | 검증 |
|---|---|
| 문장·문단·링크 수정 | `pnpm build`만 |
| 표·컴포넌트(`<Steps>` 등) 추가 | build + 아래 3 (모바일 넘침) |
| mermaid 추가·수정 | build + 아래 1 (라이트/다크 렌더) |
| 테마·`custom.css`·config 변경 | 전수 스윕 (아래 주의 참고) |

브라우저 확인 방법 (Playwright는 레포 의존성이 아니다 — 스크래치패드에서 돌린다):

1. **mermaid** — `.mermaid` 안에 `svg`가 있는가 (astro-mermaid는 shadow DOM을 쓰지 않는다).
   **다크 모드에서도** 확인한다: `document.documentElement.dataset.theme = 'dark'` 후 재렌더를 기다린다
2. **검색** — `button[data-open-modal]` 클릭 → `dialog[open] input`에 질의.
   한국어 질의 포함 결과가 나오는가. 콘텐츠 수정 때는 생략 —
   Starlight·Pagefind 업그레이드처럼 검색 자체를 건드렸을 때만 본다
3. 모바일 390px에서 `scrollWidth > clientWidth`가 아닌가
   (코드 블록이 `main` 밖으로 나가는 것은 정상 — 자체 가로 스크롤이다. 문서 본문이 넘치는지를 본다)

**스윕은 페이지 × 테마(라이트/다크) 방문당 4초 남짓 — 20페이지 덱이면 3분을 넘는다.**
Bash 타임아웃(2분)에 걸리니 `run_in_background: true`로 돌리고 로그 파일을 기다릴 것.
페이지당 mermaid 렌더에 2.5초 이상을 줘야 하고,
`<Tabs>` 안의 다이어그램은 위의 `hidden = false` 처리를 먼저 해야 카운트가 맞는다.
