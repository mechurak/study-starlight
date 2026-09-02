# 웹 개발 일반 덱의 기준

`web` 덱을 고치기 전에 읽는다.

## 이 덱의 축

웹 기술을 제품 목록으로 나열하지 않고, **한 요청이 탐색기를 떠나 서버와 도구 사슬을 거쳐 응답으로 돌아오는 흐름**으로 설명한다.
새 도구를 추가할 때는 기존 단계의 어떤 불편을 풀었는지를 먼저 밝힌다.

## 범위 경계

- 다룬다: HTTP 요청·렌더링, runtime·package manager·bundler·Vite, 품질·monorepo, backend·보안·배포의 역할.
- 깊게 다루지 않는다: 특정 framework API 전체, CSS·UI 구현 상세, cloud provider별 모든 설정.
- Next.js·Tailwind·shadcn/ui 구현은 `frontend`과 `shadcn` 덱으로 넘긴다.

## 현재성과 서술 규칙

- 품질·보안·배포 규칙은 역할과 불변조건을 먼저 쓰고 현재 제품명은 예시로 둔다.
- 버전·deprecated·기본값 주장은 공식 문서를 다시 확인한 뒤 쓴다.
- 학습 본문의 `<TermIntro>`는 의무다.
