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

## 절대 깨뜨리면 안 되는 것

- **`astro.config.mjs`에서 `mermaid()`가 `starlight()`보다 먼저** 와야 한다.
  순서가 바뀌면 ```` ```mermaid ```` 펜스가 그냥 코드 블록으로 렌더된다.
- **topics의 `items`는 slug 문자열**(`'cka/00-intro'`)이다. 파일명을 바꾸면
  config의 slug도 같이 바꿔야 한다 — 빌드가 sidebar 참조 오류로 실패하니 바로 잡힌다.
- **랜딩(`/`)은 어느 topic에도 속하지 않는다** — plugin 옵션 `exclude: ['/']`가 그 처리다.
  topic 밖 페이지를 새로 만들면 여기에 추가해야 경고가 안 난다.
- **`pnpm-workspace.yaml`은 워크스페이스가 아니라 `allowBuilds`(esbuild·sharp) 설정용**이다.
  지우면 설치 시 빌드 스크립트가 막힌다.
- **`CLAUDE.md`는 `AGENTS.md`로의 심링크**다. 수정은 AGENTS.md에 한다.

## 콘텐츠 규칙 (cka 이관하며 정한 것)

- **HTML을 쓰지 않는다.** Slidev 시절의 `<div class="grid...">`, `<strong>`, `<br>` 는
  전부 순수 마크다운으로 내렸다 — 2단 비교는 순차 블록이나 표로, 강조는 `**`, 안내 박스는 aside로.
- Slidev의 `.exam-tip` → `:::tip[시험]`, `.pitfall` → `:::caution[함정]`.
  원본의 `<strong>제목</strong> —` 접두는 aside 제목으로 승격했다 (`:::caution[함정 1]` 등).
- 페이지 사이드바 라벨은 프론트매터 `title`에서 온다. 장 번호를 제목에 유지한다 ("7. 스케줄링").
- 슬라이드→문서 변환기는 스크래치패드에서 썼고 레포에 커밋하지 않는다.
  다른 덱을 이관할 일이 생기면 같은 규칙(구분자·v-click 제거, aside 변환, 인라인 HTML 하향)을 적용.

## 검증

빌드가 대부분을 잡아준다 (슬라이드 시절의 세로 넘침 검사 같은 것은 필요 없다).

```bash
pnpm build          # 실패하면 topics slug 오타나 mdx 문법이 대부분
npx serve dist -l 4323
```

브라우저로 확인할 것 세 가지 (Playwright는 레포 의존성이 아니다 — 스크래치패드에서 돌린다):

1. **mermaid** — `.mermaid` 안에 `svg`가 있는가 (astro-mermaid는 shadow DOM을 쓰지 않는다)
2. **검색** — `button[data-open-modal]` 클릭 → `dialog[open] input`에 질의.
   한국어 질의 포함 결과가 나오는가 (Pagefind 인덱스는 빌드 시 생성)
3. 모바일 390px에서 `scrollWidth > clientWidth`가 아닌가

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
