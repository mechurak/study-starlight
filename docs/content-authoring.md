# 콘텐츠 작성 규칙

페이지는 전부 `.mdx`로 만든다. 표는 훑어보기, Mermaid는 “왜 그런가”를 보여주는 데 쓴다.
그림을 넣더라도 원래 있던 사실을 지우지 않는다.

## 설명 순서와 제목

- 새 용어·약어는 처음 나올 때 풀 이름을 쓰고, 새 개념은 **없으면 무슨 문제가 생기는지 → 해법** 순서로 설명한다.
- 제목 계층으로 우측 목차를 조직한다. h2는 주제 묶음 5~9개, 상세 절은 h3로 내린다.
- h4는 목차에 잡히지 않으므로 쓰지 않는다. 제목을 바꾸면 앵커 slug도 바뀐다.
- 시험 포인트·핵심 원칙은 `:::tip[…]`, 함정·주의는 `:::caution[함정]`을 쓴다.

## 프론트매터

기본은 `title`과 `description`이다. 사이드바 순서와 그룹은 `src/data/decks.mjs`에서 관리하므로
`sidebar` 계열 필드는 쓰지 않는다. 사이드바 라벨은 `title`에서 오므로 장 번호를 제목에 유지한다.

나중에 찾거나 현재성을 판단하는 데 필요할 때만 다음 필드를 추가한다.

```yaml
aliases: [옛 이름, 약어, 동의어]
reviewedAt: 2026-08-12
status: stable # stable | review | stale
```

`aliases`는 본문 앞에 표시되어 Pagefind 검색 대상이 된다. `reviewedAt`은 단순 수정일이 아니라
내용의 현재성을 실제로 확인한 날짜다. 확신 없이 오늘 날짜를 넣지 않는다.

## 강조와 CommonMark 함정

- 닫는 `**` 앞에 따옴표·괄호·`%`·백틱을 두고 바로 뒤에 한글 조사를 붙이지 않는다.
  - `**"조회 → 해결"**의` → `"**조회 → 해결**"의`
  - `**커리큘럼의 25%**가` → `**커리큘럼의 25%가**`
  - `` **`get all`**이다 `` → `` `get all`이다 ``
- 한 문단이나 표 한 칸에 범위 표시 `~`를 두 번 쓰지 않는다. GFM이 그 사이를 취소선으로 해석할 수 있다.
- raw HTML을 본문에 인라인으로 쓰지 않는다. 한 번 쓸 강조는 `**`와 aside를 사용한다.

## 컴포넌트 위치

```text
src/components/
  layout/  Starlight override와 사이트 레이아웃
  docs/    여러 덱이 공유하는 문서 컴포넌트
  demos/   특정 개념을 보여주는 인터랙티브 데모
```

기존 컴포넌트를 먼저 확인한다. 새 컴포넌트의 스타일은 자체 `<style>`에 캡슐화하고,
다크 모드는 `[data-theme='dark']`로 대응한다. 사이트 전역 조정만 `src/styles/custom.css`에 둔다.

Starlight 내장 컴포넌트의 역할은 다음과 같다.

| 컴포넌트 | 쓸 자리 |
|---|---|
| `<Steps>` | 순서가 있는 절차 |
| `<Tabs>` | 차이만 보여주고 싶은 두 갈래 |
| `<CardGrid>` + `<Card>` | 층·분류의 개요 |
| `<FileTree>` | 디렉터리 구조 |
| `<LinkCard>` | 장 끝의 다음 장 안내 |
| `<LinkButton>` | 덱 index의 “첫 장부터 읽기” CTA — 덱마다 하나 |
| `<Badge>` | 성숙도·deprecated·기본값·시험 비중 같은 짧은 상태 |
| `<DeckMap>` | 덱 index의 “구성” 절 — 덱마다 하나 |
| Mermaid | 결정 트리, 관계도, 상태 머신, 시퀀스 |

`<FileTree>`는 `- 경로/` 뒤에 설명을 이어 쓰면 주석으로 표시된다. 중요한 파일은 `**굵게**` 한다.

## 덱 index

덱 index에는 `<LinkButton>`과 `<DeckMap>`을 각각 하나 둔다. 구성도에 Mermaid를 쓰지 않는다.
`DeckMap`의 props와 의미는 `src/components/docs/DeckMap.astro` 머리 주석에 있다.

## MDX에서 자주 깨지는 것

- JSX 안의 마크다운은 들여쓰기하지 않는다. `<Card>`·`<TabItem>` 태그와 내용을 0칸에 두고 빈 줄로 띄운다.
- `<Steps>` 안 번호 목록에 딸린 코드 블록만 3칸 들여쓴다.
- 제목에 `<Badge>`를 붙일 때 공백 없이 쓴다. 공백이 있으면 앵커 slug 끝에 `-`가 붙는다.
- `src/content/docs/`의 새 페이지는 manifest에 넣거나 topic plugin의 `exclude`에 추가한다.
- 코드 펜스 언어는 하이라이터가 지원하는 이름만 쓴다. 전용 문법이 없으면 `text`를 쓴다.

## Mermaid

다이어그램은 이미지 파일 대신 ```` ```mermaid ```` 펜스를 쓴다. 빌드 성공은 클라이언트 렌더 성공을
보장하지 않으므로 변경 시 브라우저에서 라이트·다크 모드를 확인한다.

의미 팔레트는 다음 여섯 개로 통일한다.

```text
classDef ok   fill:#dcfce7,stroke:#16a34a,color:#14532d
classDef bad  fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
classDef warn fill:#fef3c7,stroke:#d97706,color:#78350f
classDef key  fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
classDef mute fill:#f1f5f9,stroke:#94a3b8,color:#334155
classDef zone fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
```

- `stateDiagram-v2`는 테마 기본값을 쓴다.
- 노드 라벨은 `["…"]`, 엣지 라벨은 `-->|"…"|`처럼 감싼다.
- 라벨의 `&`는 `&amp;`로 쓰고 `<`·`>`는 피한다. `<br/>`만 줄바꿈에 사용한다.
- 여러 subgraph는 `flowchart LR`과 내부 `direction`으로 정렬한다.
- `<Tabs>` 안 다이어그램을 검사할 때는 숨은 tabpanel을 먼저 연다.
