# 검증

기본 검증은 다음 한 명령이다.

```bash
pnpm check
```

`check:content`가 manifest 등록과 중복(slug·topicOrder), 프론트매터, h4, 미지원 펜스 언어
(promql·logql·traceql → `text`), 덱 index 컴포넌트, 필수 `TermIntro`를 검사하고,
이어서 Astro 빌드와 Pagefind 인덱스 생성을 확인한다.

## 변경별 브라우저 검증

| 변경 | 검증 |
|---|---|
| 문장·문단·링크 | `pnpm check` |
| 표·컴포넌트 추가 | check + 모바일 넘침 |
| Mermaid 추가·수정 | check + 라이트/다크 렌더·클릭 확대·모바일 |
| D2 추가·수정 | check + SVG 로드·라이트/다크·확대·애니메이션 |
| 테마·`custom.css`·config·override | 아래 항목 전수 |

산출물을 브라우저에서 볼 때는 `pnpm preview`를 사용한다.

1. Mermaid: `.mermaid` 안에 `svg`가 생기고 `.mermaid-frame`이 하나씩 붙는지 확인한다.
   SVG와 확대 버튼이 dialog를 열고 ESC·닫기 버튼·바깥 영역 클릭으로 닫히는지 본다.
   다크 모드 전환 후 SVG가 재렌더되어도 프레임과 확대 버튼이 하나씩인지 확인한다.
2. D2: `/d2/` 아래 SVG 이미지가 로드되는지, 확대 버튼이 dialog를 여는지 확인한다.
   테마 전환 뒤 색이 바뀌고 animated edge가 움직이는지도 본다.
3. 이미지: 일반 본문 이미지와 `<SourceFigure>`의 확대 dialog가 열리고 닫히는지 확인한다.
4. 검색: 검색 dialog를 열고 한국어 질의와 덱 별칭으로 결과가 나오는지 확인한다.
5. 모바일: 390px에서 문서 본문이 `scrollWidth > clientWidth`가 아닌지 확인한다.
   코드 블록 자체의 가로 스크롤은 정상이다.

Playwright 같은 브라우저 자동화를 썼다면 검증 후 `git status --short`로 임시 로그·스냅샷이
변경 목록에 남지 않았는지 확인한다. 이 저장소에서 `.playwright-cli/`는 검증 산출물이므로
커밋하지 않고 `.gitignore`로 제외한다.

`<Tabs>` 안 Mermaid는 비활성 패널이 `hidden`이므로 검사 전에 다음처럼 연다.

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
