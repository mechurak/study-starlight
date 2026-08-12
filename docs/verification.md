# 검증

기본 검증은 다음 한 명령이다.

```bash
pnpm check
```

`check:content`가 manifest 등록, 프론트매터, h4, 덱 index 컴포넌트, 필수 `TermIntro`를 검사하고,
이어서 Astro 빌드와 Pagefind 인덱스 생성을 확인한다.

## 변경별 브라우저 검증

| 변경 | 검증 |
|---|---|
| 문장·문단·링크 | `pnpm check` |
| 표·컴포넌트 추가 | check + 모바일 넘침 |
| Mermaid 추가·수정 | check + 라이트/다크 렌더 |
| 테마·`custom.css`·config·override | 아래 항목 전수 |

산출물을 브라우저에서 볼 때는 `pnpm preview`를 사용한다.

1. Mermaid: `.mermaid` 안에 `svg`가 생기는지 확인한다. 다크 모드 전환 후 재렌더도 기다린다.
2. 검색: 검색 dialog를 열고 한국어 질의와 덱 별칭으로 결과가 나오는지 확인한다.
3. 모바일: 390px에서 문서 본문이 `scrollWidth > clientWidth`가 아닌지 확인한다.
   코드 블록 자체의 가로 스크롤은 정상이다.

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
