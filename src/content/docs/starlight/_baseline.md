# Starlight 덱의 기준

이 덱을 고치기 전에 읽는다.

## 독자·학습 결과·범위

독자는 Git·Markdown·기본 명령 실행을 알지만 이 사이트의 구조는 처음인 동료다.
실행 준비 → 첫 덱 작성 → 의미 리뷰 → 기술 검증을 마치고 기존 URL을 유지하며 페이지를 추가할 수 있게 한다.
Astro·구조·MDX·컴포넌트는 필요한 작업에서 참조한다. 일반 웹앱 개발·프레임워크 전체 API와
호스팅별 전체 운영은 다루지 않는다.

## 기준 버전과 근거

2026-09-18 설치·lockfile 기준: Astro 7.1.6, Starlight 0.41.6, astro-d2 0.13.1,
sidebar-topics 0.8.0, image-zoom 0.15.0, native D2 0.8.2.
버전 범위는 package.json, 재현 설치는 package-lock.json을 따른다.

공식 기능은 Astro 컴포넌트·브라우저 script·TypeScript 문서와 Starlight 검색·컴포넌트 문서를,
프로젝트 동작은 실제 loader·schema·check 스크립트·components·astro.config.mjs를 대조한다.
일반 Astro build는 타입 검사를 하지 않는다. npm run check도 astro check와 다른 프로젝트 명령이다.

배포 세 페이지는 2026-09-18에 Astro deploy 가이드(github·vercel·cloudflare), GitHub Pages 문서,
withastro/action README, Vercel package-managers·configure-a-build·node-js-versions 문서,
Cloudflare Pages build-image·build-configuration 문서와 저장소의 prepare-*.mjs를 대조했다.
2026-09-19 npm 전환에 맞춰 갱신했다. pnpm 기반 Cloudflare Pages 배포는 실측 이력이 있으나
npm 기반 빌드는 세 호스팅 모두 아직 문서 확인이며, 다음 푸시의 빌드 로그로 확인한다.
GitHub Pages는 2026-09-19에 템플릿 생성·수동 실행·비활성화 공식 안내를 추가 대조했다.
`deploy.yml`은 main push 트리거를 주석으로 제공한다. GitHub Pages 사용 시 주석을 해제하며,
기본 상태는 수동 실행만 가능하다. 실제 Pages 배포는 아직 실행하지 않았다.
프로젝트 사이트 안내는 Astro site·base 정의와 GHES Pages 주소·action 호환성 문서를 대조했다.
현재 저장소의 하위 경로 대응은 미구현이며, 문서의 설정 예제와 동작하는 구현을 구분한다.

## 서술 규칙

예제는 이 저장소의 실제 구조에 맞춘다. 발췌·가상 경로는 그대로 실행 가능한 완성 파일과 구분한다.
first-deck의 네 파일이 복사 가능한 최소 예제다. 결과를 바꾸는 실습에는 예상 결과와 복구를 둔다.
개념 이름·URL에는 순서 번호를 넣지 않고 _deck.mjs의 sidebar 배열로 읽는 순서를 정한다.

Starlight 공식 기능, 플러그인 기능, 자체 loader·검사를 구분한다. topic exclude와 검색 제외,
정적 컴포넌트와 일반 script·프레임워크 아일랜드, description과 검색 발췌를 혼동하지 않는다.
검증은 docs/verification.md를 따르며 전수 브라우저 검사를 기본으로 권하지 않는다.
원본의 개인 배포 설정은 docs/deploy.md에 있고 다른 저장소의 기본값으로 복제하지 않는다.
GitHub Pages는 프로젝트 사이트를 기본 예제로 쓰며, 루트 배포용 현재 코드의 추가 수정 범위를 명시한다.
다른 배포 페이지는 도메인 루트 배포가 기본이다. 문서로 확인한 값과 실측한 값을 구분해 적는다.

새 학습 본문에는 Thesis·TermIntro를 둔다. wrapup은 TermIntro 예외다.
옛 열 페이지의 URL·절 북마크는 src/data/starlight-legacy-routes.json이 소유한다.
