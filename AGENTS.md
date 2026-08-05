# CLAUDE.md

Starlight 기반 스터디 노트 사이트. 작업 전 [README.md](README.md)를 먼저 볼 것.
이 문서는 README에 없는, 실제로 부딪혀서 알게 된 것들만 남긴다.

## 작업 방식

소유자 1인이 혼자 쓰는 레포다. 커밋은 `main`에 직접 하고, 커밋/푸시는 요청받았을 때만 한다.
슬라이드가 아니라 문서다 — **축적·검색·참조**에 맞게 쓴다.

dev 서버는 백그라운드 모드로 띄운다: `astro dev --background`
(관리: `astro dev stop` / `astro dev status` / `astro dev logs`)

## 현재 상태

| 덱 | 규모 | 비고 |
|---|---|---|
| `cka` | 22페이지 (개요 + 21장) | mermaid 189개 + Starlight 컴포넌트 |
| `frontend` | 23페이지 (개요 + 21장) | mermaid 31개. Next.js·Tailwind·shadcn/ui |
| `supabase` | 19페이지 (개요 + 17장) | mermaid 35개. Postgres·RLS·Vercel 역할 배분 |

`frontend`와 `supabase`는 slidev 덱(`~/workspace/study-decks/decks/<이름>`)의 내용을
**참고해 다시 쓴 것**이다. 저쪽은 슬라이드(클릭 애니메이션·라이브 데모가 핵심)라 구조가 다르다 —
동기화 대상이 아니다. 여기가 문서판 원본이다.

Astro 7 / Starlight 0.41 / starlight-sidebar-topics 0.8 / astro-mermaid 2.1 /
starlight-theme-rapide 0.5 기준.

외관은 세 겹이다 (2026-08-05 소유자 결정) —

- **테마**: `starlight-theme-rapide` (코드 블록 테마도 Vitesse 계열로 함께 바뀐다)
- **폰트**: Pretendard Variable 셀프호스팅. `customCss`의 **dynamic subset** CSS가 핵심이다
  — 한글 폰트는 웨이트당 수 MB라, 쓰인 글자의 조각만 내려받는 이 방식이 아니면 못 쓴다
- **본문 폭**: `--sl-content-width: 55rem` (기본 45rem은 다이어그램·표 위주 문서에 좁다)

페이지는 전부 `.mdx`다. 새 페이지도 처음부터 `.mdx`로 만든다.
본문 구조는 **표는 훑어보기용, 그림(mermaid)은 "왜 그런가"용**으로 역할을 나눈다 —
원래 있던 사실을 지우면서 그림으로 대체하지 않는다.

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

## 콘텐츠 규칙

- **제목 계층으로 우측 목차(TOC)를 조직한다.** 목차에는 h2·h3만 나온다.
  h2는 **주제 묶음 5~9개**로 세우고 상세 절은 h3로 내린다 — h2만 나열하면 목차가
  평면이 되어 안 읽히고, h4는 목차에 안 잡히니 만들지 않는다.
  (2026-08-05에 cka 전 페이지를 이 구조로 재조직했다. 제목을 고치면 앵커 slug도 바뀐다.)
- **raw HTML은 본문에 인라인으로 쓰지 않는다.** 강조는 `**`, 안내 박스는 aside로.
  Starlight 내장 컴포넌트는 허용한다 (아래 절). **그 이상의 시각 효과가 필요하면
  `src/components/`에 Astro 컴포넌트를 만들어 import한다** — 스타일은 컴포넌트 `<style>`에
  캡슐화하고(다크 모드는 `[data-theme='dark']`로 대응), 본문에는 태그 하나만 남긴다.
  사이트 전역 조정은 `src/styles/custom.css`.
- 시험 포인트는 `:::tip[시험]`, 함정·주의는 `:::caution[함정]` aside를 쓴다.
  aside 제목에 구체 라벨을 달 수 있다 (`:::caution[함정 1 — ...]` 처럼).
- 페이지 사이드바 라벨은 프론트매터 `title`에서 온다. 장 번호를 제목에 유지한다 ("7. 스케줄링").

## 시각화 — 다이어그램과 컴포넌트

**컴포넌트를 쓰려면 파일이 `.mdx`여야 한다** (전 페이지가 이미 `.mdx`다).
topics의 slug는 **확장자를 안 쓰므로** 파일 확장자와 무관하다.
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

빌드가 대부분을 잡아준다.

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

**이 레포가 원본이다.** 다른 곳과 맞출 필요 없이 여기만 고치면 된다 (2026-08-05 소유자 결정).

### 기준 시점과 출처

장 구성과 배점은 **CKA 커리큘럼 v1.35**를, 명령·API 버전은 **시험 환경 Kubernetes v1.35**를
기준으로 쓰여 있다. 2026-08-05에 아래 출처를 직접 조회해 확인했다.

- 커리큘럼 PDF: `github.com/cncf/curriculum` → `CKA_Curriculum_v1.35.pdf`
- 시험 환경/형식: `docs.linuxfoundation.org/tc-docs/certification/tips-cka-and-ckad`
- 열람 허용 사이트: `docs.linuxfoundation.org/tc-docs/certification/certification-resources-allowed`

**커리큘럼은 분기마다, 시험 환경 버전은 k8s 릴리스 후 4~8주 안에 바뀐다.**
배점·도메인·버전 표기를 고칠 때는 반드시 위 출처를 다시 조회할 것.
**"이 기능은 없다"는 판단도 kubernetes.io/docs를 직접 조회한 뒤에 내릴 것.**

| 항목 | 현재 | 옛 정보 (쓰면 안 됨) |
|---|---|---|
| 도메인 5종 | Troubleshooting 30% / Cluster Arch 25% / **Servicing and Networking** 20% / Workloads 15% / Storage 10% | 비중이 다른 옛 개정판 |
| 시험 형식 | **2시간, 15~20문항, 66%**, 노드는 `ssh <name>` + `sudo -i` | — |
| 시험 환경 | **Kubernetes v1.35**, `k` alias·bash 자동완성·`yq` 사전 설치 | 1.29/1.30 등 |
| 열람 허용 | kubernetes.io/docs · /blog · **helm.sh/docs** · **gateway-api.sigs.k8s.io** | GitHub·블로그(금지) |
| 커리큘럼 신규 항목 | **Gateway API로 Ingress 트래픽 관리**, Helm·Kustomize로 컴포넌트 설치, CRD·오퍼레이터, 워크로드 오토스케일링 | 이 항목들이 빠진 옛 자료 |
| 사이드카 | **네이티브 사이드카**(`initContainers` + `restartPolicy: Always`) v1.33 GA | `containers`에 나란히 두는 방식만 |
| Pod 리소스 변경 | **in-place resize v1.35 GA** (`--subresource=resize`, `resizePolicy`) | 재생성만 가능 |
| 컨테이너 런타임 | **containerd + `crictl`** | Docker / `docker` 명령 (v1.24에서 제거) |
| Pod 보안 | **Pod Security Admission**(네임스페이스 라벨) | PodSecurityPolicy (v1.25에서 제거) |
| 엔드포인트 | **EndpointSlice**가 실제 데이터 소스 | `Endpoints`만 |
| Gateway API | CRD 별도 설치. Standard 채널에 GatewayClass·Gateway·HTTPRoute·**GRPCRoute**(v1.4~), TCP/UDPRoute는 v1.6에서 GA | Ingress만 다루는 자료 |
| SA 토큰 | **TokenRequest 기반 수명 있는 projected 토큰**, `kubectl create token` | SA 생성 시 자동 생성되는 무기한 Secret |

### 유지할 서술 원칙

- 덱 전체의 축은 **"선언된 상태(spec)와 실제 상태(status)의 차이를 줄이는 루프"** — 0장과 20장이 이걸 감싼다
- 각 장이 **"실제로 무엇이 일어나는가" → 명령 → 함정** 순서로 간다
- 배점 순서와 학습 순서를 구분한다 — 트러블슈팅(30%)이 18장인 건 앞의 전부가 재료라서다
- 장 끝마다 요약 절. 19장은 치트시트, 20장은 장별 한 줄 요약 — **시험 직전에 이 둘만 봐도 되게** 유지한다

## Astro 참고 문서

- [라우팅](https://docs.astro.build/en/guides/routing/) ·
  [컴포넌트](https://docs.astro.build/en/basics/astro-components/) ·
  [프레임워크 컴포넌트](https://docs.astro.build/en/guides/framework-components/) ·
  [콘텐츠 컬렉션](https://docs.astro.build/en/guides/content-collections/) ·
  [스타일링](https://docs.astro.build/en/guides/styling/) ·
  [i18n](https://docs.astro.build/en/guides/internationalization/)
