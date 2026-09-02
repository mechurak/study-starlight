// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 1100,
	"catalogOrder": 1900,
	"label": "Supabase",
	"title": "Supabase",
	"icon": "seti:db",
	"aliases": [
		"Backend as a Service",
		"BaaS"
	],
	"description": "Auth가 발급한 JWT를 RLS가 행 단위로 판정한다 — 그 한 문장을 축으로 한 백엔드 플랫폼.",
	"category": "app",
	"tags": [
		"data",
		"auth",
		"cloud"
	],
	"termIntro": "legacy",
	"groups": [
		{
			"id": "intro",
			"label": "시작"
		},
		{
			"id": "architecture",
			"label": "기반 — Postgres와 개발 환경"
		},
		{
			"id": "data-api",
			"label": "핵심 — 데이터와 권한"
		},
		{
			"id": "storage",
			"label": "주변 제품"
		},
		{
			"id": "vercel",
			"label": "애플리케이션 통합"
		},
		{
			"id": "ops",
			"label": "운영과 규모"
		},
		{
			"id": "patterns",
			"label": "마무리"
		}
	],
	"map": [
		{
			"label": "0~1장",
			"href": "/supabase/00-intro/",
			"title": "시작",
			"tone": "mute",
			"desc": "읽는 법 · 왜 Supabase인가"
		},
		{
			"label": "2~4장",
			"href": "/supabase/02-architecture/",
			"title": "기반",
			"tone": "ok",
			"desc": "아키텍처 · 로컬 개발 환경 · Postgres 최소 지식"
		},
		{
			"label": "5~7장",
			"href": "/supabase/05-data-api/",
			"title": "핵심 — 데이터와 권한",
			"tone": "key",
			"desc": "Data API · Auth · RLS"
		},
		{
			"label": "8~11장",
			"href": "/supabase/08-storage/",
			"title": "주변 제품",
			"tone": "warn",
			"desc": "Storage · Realtime · Edge Functions · 확장"
		},
		{
			"label": "12~13장",
			"href": "/supabase/12-vercel/",
			"title": "애플리케이션 통합",
			"tone": "warn",
			"desc": "Vercel과의 역할 배분 · Next.js 통합"
		},
		{
			"label": "14~15장",
			"href": "/supabase/14-ops/",
			"title": "운영과 규모",
			"tone": "mute",
			"desc": "마이그레이션 · 브랜칭 · 성능 · 비용"
		},
		{
			"label": "16~17장",
			"href": "/supabase/16-patterns/",
			"title": "마무리",
			"tone": "mute",
			"desc": "실전 패턴 · 안티패턴 · 정리"
		}
	]
};
