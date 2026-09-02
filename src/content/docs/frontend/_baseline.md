# 프론트엔드 실전 스택 덱의 기준

`frontend` 덱을 고치기 전에 읽는다.

## 이 덱의 축

Next.js는 **실행·렌더링 경계**, Tailwind CSS는 **스타일 언어**, shadcn/ui는 **소유하는 component code**를 맡는다.
세 도구를 유행하는 스택 목록으로 쓰지 않고, 각각 무슨 문제를 푸는지와 그 경계를 유지한다.

## 다른 덱과의 경계

- 웹 요청·runtime·bundler·백엔드의 일반 지형은 [웹 개발 일반](/web/)이 맡는다.
- shadcn/ui를 테마 리소스 관점으로 깊게 파는 내용은 [shadcn/ui](/shadcn/) 덱이 맡는다. 두 덱을 문장 단위로 동기화하지 않는다.
- 이 덱은 애플리케이션 구현과 품질 경계에 집중하고, framework·component 레퍼런스 전체를 복제하지 않는다.

## 현재성과 서술 규칙

- Next.js·Tailwind·shadcn/ui의 API·기본값·deprecated 여부는 수정할 때 공식 문서를 다시 확인한다.
- Server·Client 경계, cache, form·state 예제는 보안·접근성·재현 가능성을 함께 설명한다.
- 이 규칙 도입 전 장 때문에 덱 정책은 `termIntro: legacy`지만, 새 학습 장에는 `<TermIntro>`를 둔다.
