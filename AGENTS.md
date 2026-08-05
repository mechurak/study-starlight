# CLAUDE.md

Starlight 기반 스터디 노트 사이트. 작업 전 [README.md](README.md)를 먼저 볼 것.
이 문서는 README에 없는, 실제로 부딪혀서 알게 된 것들만 남긴다.

## 작업 방식

소유자 1인이 혼자 쓰는 레포다. 커밋은 `main`에 직접 하고, 커밋/푸시는 요청받았을 때만 한다.
[study-decks](../study-decks) 레포(Slidev)의 후속이다 — 슬라이드는 발표·선형 1회독용,
이 레포는 **축적·검색·참조**용으로 역할을 나눈다 (2026-08-05 소유자 결정).

dev 서버는 백그라운드 모드로 띄운다: `astro dev --background`
(관리: `astro dev stop` / `astro dev status` / `astro dev logs`)

## 현재 상태

| 덱 | 규모 | 비고 |
|---|---|---|
| `cka` | 22페이지 (개요 + 21장) | study-decks의 cka 덱(358장)을 변환해 이관 |

Astro 7 / Starlight 0.41 / starlight-sidebar-topics 0.8 / astro-mermaid 2.1 기준.

**`cka` 22페이지 전부 `.mdx`로 전환 완료** (2026-08-05). 텍스트 위주였던 본문에
mermaid 다이어그램 **약 175개**와 Starlight 컴포넌트를 얹었다 — 원래 있던 사실은
하나도 지우지 않고 표는 그대로 둔 채, 그 위에 그림을 더한 구조다
(**표는 훑어보기용, 그림은 "왜 그런가"용**으로 역할을 나눴다).

`.md`로 남아 있는 페이지는 없다. 새 페이지도 처음부터 `.mdx`로 만든다.

## 절대 깨뜨리면 안 되는 것

- **`astro.config.mjs`에서 `mermaid()`가 `starlight()`보다 먼저** 와야 한다.
  순서가 바뀌면 ```` ```mermaid ```` 펜스가 그냥 코드 블록으로 렌더된다.
- **topics의 `items`는 slug 문자열**(`'cka/00-intro'`)이다. 파일명을 바꾸면
  config의 slug도 같이 바꿔야 한다 — 빌드가 sidebar 참조 오류로 실패하니 바로 잡힌다.
- **랜딩(`/`)은 어느 topic에도 속하지 않는다** — plugin 옵션 `exclude: ['/']`가 그 처리다.
  topic 밖 페이지를 새로 만들면 여기에 추가해야 경고가 안 난다.
- **`pnpm-workspace.yaml`은 워크스페이스가 아니라 `allowBuilds`(esbuild·sharp) 설정용**이다.
  지우면 설치 시 빌드 스크립트가 막힌다.
  **`allowBuilds`는 pnpm 10.26.0부터의 문법**이다 (그 전에는 `onlyBuiltDependencies`).
  더 낮은 pnpm에서 설치하면 필드가 무시되고 **sharp가 안 빌드돼 `astro build`가 깨진다** —
  CI(Cloudflare 기본 이미지는 pnpm 10.11.1)에서 실제로 걸리는 지점이라 `PNPM_VERSION`을 박아야 한다.
- **`CLAUDE.md`는 `AGENTS.md`로의 심링크**다. 수정은 AGENTS.md에 한다.

## 콘텐츠 규칙 (cka 이관하며 정한 것)

- **raw HTML은 쓰지 않는다.** Slidev 시절의 `<div class="grid...">`, `<strong>`, `<br>` 는
  전부 순수 마크다운으로 내렸다 — 강조는 `**`, 안내 박스는 aside로.
  **Starlight 내장 컴포넌트는 예외로 허용한다** (아래 절). 2026-08-05 소유자 결정으로 완화했다.
- Slidev의 `.exam-tip` → `:::tip[시험]`, `.pitfall` → `:::caution[함정]`.
  원본의 `<strong>제목</strong> —` 접두는 aside 제목으로 승격했다 (`:::caution[함정 1]` 등).
- 페이지 사이드바 라벨은 프론트매터 `title`에서 온다. 장 번호를 제목에 유지한다 ("7. 스케줄링").
- 슬라이드→문서 변환기는 스크래치패드에서 썼고 레포에 커밋하지 않는다.
  다른 덱을 이관할 일이 생기면 같은 규칙(구분자·v-click 제거, aside 변환, 인라인 HTML 하향)을 적용.

## 시각화 — 다이어그램과 컴포넌트

**컴포넌트를 쓰려면 파일이 `.mdx`여야 한다.** `git mv 13-storage.md 13-storage.mdx` 하면 되고,
`astro.config.mjs`의 topics slug(`'cka/13-storage'`)는 **확장자를 안 쓰므로 그대로 둔다.**
`@astrojs/mdx`는 Starlight의 전이 의존성이라 별도 설치가 필요 없다.

```mdx
import { Steps, Card, CardGrid, Tabs, TabItem, FileTree } from '@astrojs/starlight/components';
```

무엇을 어디에 쓰는지 —

| 컴포넌트 | 쓸 자리 |
|---|---|
| `<Steps>` | 순서가 있는 절차 (etcd 복구, kubeadm 업그레이드, 진단 순서) |
| `<Tabs>` | **차이만 보여주고 싶은 두 갈래** (Immediate/WaitForFirstConsumer, apply/node, Stacked/External) |
| `<CardGrid>` + `<Card>` | 층·분류의 개요. 장 첫머리나 "해결책 넷 중 하나" |
| `<FileTree>` | 디렉터리 구조 (`/etc/kubernetes/`, Helm 차트, Kustomize 오버레이) |
| `<LinkCard>` | 장 끝의 "다음 장으로" 안내 |
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
  ```

  `stateDiagram-v2`는 **색을 주지 않는 편이 낫다** — 테마 기본값이 양쪽 모드에서 이미 잘 맞는다.
  22페이지에 걸쳐 이 5색을 일관되게 쓰면 **색만 봐도 결론의 성격**이 읽힌다.
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

## 검증

빌드가 대부분을 잡아준다 (슬라이드 시절의 세로 넘침 검사 같은 것은 필요 없다).

```bash
pnpm build          # 실패하면 topics slug 오타나 mdx 문법이 대부분
npx serve dist -l 4323
```

브라우저로 확인할 것 세 가지 (Playwright는 레포 의존성이 아니다 — 스크래치패드에서 돌린다):

1. **mermaid** — `.mermaid` 안에 `svg`가 있는가 (astro-mermaid는 shadow DOM을 쓰지 않는다).
   **다크 모드에서도** 확인한다: `document.documentElement.dataset.theme = 'dark'` 후 재렌더를 기다린다
2. **검색** — `button[data-open-modal]` 클릭 → `dialog[open] input`에 질의.
   한국어 질의 포함 결과가 나오는가 (Pagefind 인덱스는 빌드 시 생성)
3. 모바일 390px에서 `scrollWidth > clientWidth`가 아닌가
   (코드 블록이 `main` 밖으로 나가는 것은 정상 — 자체 가로 스크롤이다. 문서 본문이 넘치는지를 본다)

**22페이지 × 라이트/다크를 한 번에 도는 스윕은 3분 넘게 걸린다.** Bash 타임아웃(2분)에 걸리니
`run_in_background: true`로 돌리고 로그 파일을 기다릴 것. 페이지당 mermaid 렌더에 2.5초 이상을
줘야 하고, `<Tabs>` 안의 다이어그램은 위의 `hidden = false` 처리를 먼저 해야 카운트가 맞는다.

## cka 덱 내용을 고칠 때

기준 시점·확인 출처·서술 원칙은 **study-decks의 CLAUDE.md "cka 덱 내용을 고칠 때" 절**을 따른다
(CKA 커리큘럼 v1.35 / 시험 환경 k8s v1.35, 2026-08-05 확인).
현재는 **study-decks가 원본이고 여기는 이관본**이다 — 내용을 고칠 때 한쪽만 고치면 어긋난다.
장기적으로 어느 쪽을 원본으로 둘지는 소유자가 정한다.

## Astro 참고 문서

- [라우팅](https://docs.astro.build/en/guides/routing/) ·
  [컴포넌트](https://docs.astro.build/en/basics/astro-components/) ·
  [프레임워크 컴포넌트](https://docs.astro.build/en/guides/framework-components/) ·
  [콘텐츠 컬렉션](https://docs.astro.build/en/guides/content-collections/) ·
  [스타일링](https://docs.astro.build/en/guides/styling/) ·
  [i18n](https://docs.astro.build/en/guides/internationalization/)
