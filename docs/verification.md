# 검증

기본 검증은 다음 한 명령이다.

```bash
pnpm check
```

`check:content`가 `_deck.mjs`와 MDX에서 파생한 slug·순서·그룹, `category`·`tag` 어휘,
필수 baseline, 프론트매터, h4, 미지원 펜스 언어(promql·logql·traceql → `text`), 덱 index
컴포넌트, `<Thesis>` 이관 표시, 필수 `<TermIntro>`, 검토 날짜 정합성을 검사한다. 이어서 Astro
빌드와 Pagefind 인덱스를 만들고, `check:links`가 **렌더된 HTML의 내부 페이지·파일·anchor**를 검사한다.
외부 URL의 생존 여부는 네트워크 상태와 rate limit 영향을 받으므로 기본 검사를 막지 않는다.

덱별 검토 이력·검토 주기 초과·`legacyThesis` 잔량은 필요할 때 다음으로 본다.

```bash
pnpm report:content
```

## 변경별 브라우저 검증

| 변경 | 검증 |
|---|---|
| 문장·문단·링크 | `pnpm check` |
| 새 페이지·덱 설정·순서 변경 | check + 해당 덱의 사이드바·DeckMap |
| 표·컴포넌트 추가 | check + 모바일 넘침 |
| D2 추가·수정 | check + SVG 로드·라이트/다크·확대·애니메이션 |
| 테마·`custom.css`·config·override | 아래 항목 전수 |

산출물을 브라우저에서 볼 때는 `pnpm preview`를 사용한다.

D2의 전체 작성 규칙은 [d2-authoring.md](d2-authoring.md)에 있다. 폭·배치를 조정하는 반복 작업에서는 매번 빌드하지 말고
`node scripts/d2-measure.mjs [--png] <파일.mdx>`를 쓴다 — 빌드 산출물과 픽셀 단위로 같은
크기를 캐시 준비 뒤 파일당 1~2초에 찍고, `--png`는 블록별 이미지를 `.d2-measure/`에 만들어 렌더 결과
(라벨 겹침·컨테이너 관통처럼 폭 수치로 안 잡히는 결함)를 빌드·브라우저 없이 훑게 해 준다.
이 스크립트도 `astro.config.mjs`와 같은 준비 함수를 거쳐 캐시된 native D2 v0.8.2 CLI를 쓴다.
최종 확인은 여전히 `pnpm check`와 아래 브라우저 검증이다.

1. D2: `/d2/` 아래 SVG 이미지가 로드되는지, 확대 버튼이 dialog를 여는지 확인한다.
   테마 전환 뒤 색이 바뀌고 animated edge가 움직이는지도 본다.
2. 이미지: 일반 본문 이미지와 `<SourceFigure>`의 확대 dialog가 열리고 닫히는지 확인한다.
3. 검색: 검색 dialog를 열고 한국어 질의와 덱 별칭으로 결과가 나오는지 확인한다.
4. 모바일: 390px에서 문서 본문이 `scrollWidth > clientWidth`가 아닌지 확인한다.
   코드 블록 자체의 가로 스크롤은 정상이다. 랜딩의 태그 칩 바는 여기서 5줄까지 늘어난다.
5. 랜딩 태그 필터(`DeckCatalog`를 고쳤다면): 칩을 눌렀을 때 카드 보기에서 섹션이
   헤딩째 사라지는지, 테이블 보기로 바꿔도 필터가 유지되는지, 정렬 → 필터와
   필터 → 정렬 두 순서 모두 되는지 확인한다. 0이 되는 칩은 흐려지고 눌리지 않아야 하며,
   선택된 칩은 흐려지지 않아 되돌아 나올 수 있어야 한다. `?tags=k8s,onprem` 링크를
   새 탭에서 열면 칩이 눌린 채로 뜨고, 모르는 id는 조용히 버려져야 한다.
   빈 상태는 크래프트한 URL(`?tags=onprem,frontend`)로만 닿는다.
6. 검색 색인: 필터 바·툴바·태그 칩·테이블 보기·빈 상태는 `data-pagefind-ignore` 대상이다.
   "온프렘"으로 검색했을 때 랜딩(`/`)이 결과에 뜨면 어딘가 빠진 것이다.

Playwright 같은 브라우저 자동화를 썼다면 검증 후 `git status --short`로 임시 로그·스냅샷이
변경 목록에 남지 않았는지 확인한다. 이 저장소에서 `.playwright-cli/`는 검증 산출물이므로
커밋하지 않고 `.gitignore`로 제외한다.

`<Tabs>` 안 다이어그램은 비활성 패널이 `hidden`이므로 검사 전에 다음처럼 연다.

```js
document.querySelectorAll('[role="tabpanel"]').forEach((panel) => (panel.hidden = false));
```

## 산출물에서만 잡히는 CommonMark 문제

강조 기호가 그대로 남았는지 확인할 때:

```bash
grep -rho '\*\*[^<*]\{0,45\}' dist --include=index.html | sort -u
```

의도하지 않은 취소선이 생겼는지 확인할 때:

```bash
grep -rho '<del>[^<]*</del>' dist --include=index.html | sort -u
```

코드 블록의 `/**`, 문법을 설명하는 예제, 의도적으로 쓴 `~~취소선~~`은 정상이다.
