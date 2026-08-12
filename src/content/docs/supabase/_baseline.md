# Supabase 덱 기준

- 기준일: 2026-08-13
- 기준 제품: Supabase hosted platform과 Supabase CLI 2.x. 셀프호스팅은 범위 밖이다.
- 애플리케이션 통합 기준: `supabase-js` 2.x, `@supabase/ssr`, Next.js 16 App Router.
- 새 API 키(`sb_publishable_...`, `sb_secret_...`)와 비대칭 JWT 서명 키를 우선 설명한다.
  레거시 `anon`/`service_role` JWT 키는 로컬 CLI와 이전 프로젝트를 설명할 때만 다룬다.
- 가격·한도·대시보드 메뉴·브랜칭·Edge Functions 런타임은 변동성이 높다. 수정할 때
  Supabase 공식 문서와 가격 페이지를 다시 확인하고 `reviewedAt`을 갱신한다.
- 보안 예제는 RLS를 최종 방어선으로 두되, 공개 엔드포인트·Server Action·관리자 클라이언트에도
  입력 검증과 호출자 확인이 필요하다는 원칙을 유지한다.
- 예제의 목적은 복사 가능한 출발점을 주는 것이다. 생략한 오류 처리나 도메인 로직은 생략 사실을
  명시하며, 생략 때문에 보안·원자성·멱등성이 깨지는 예제는 두지 않는다.
