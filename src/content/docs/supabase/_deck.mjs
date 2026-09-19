// 덱 단위 metadata와 구조. 페이지 소속·순서는 sidebar 배열에 있다.
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
		"auth"
	],
	"termIntro": "legacy",
	"sidebar": [
		{
			"label": "시작",
			"pages": [
				"00-intro",
				"01-why"
			]
		},
		{
			"label": "기반 — Postgres와 개발 환경",
			"pages": [
				"02-architecture",
				"03-start",
				"03-local-cli",
				"03-remote-cli",
				"04-postgres"
			]
		},
		{
			"label": "핵심 — 데이터와 권한",
			"pages": [
				"05-data-api",
				"06-auth",
				"06-auth-reference",
				"07-rls"
			]
		},
		{
			"label": "주변 제품",
			"pages": [
				"08-storage",
				"09-realtime",
				"10-edge-functions",
				"11-extensions"
			]
		},
		{
			"label": "애플리케이션 통합",
			"pages": [
				"12-vercel",
				"12-deploy-guide",
				"13-nextjs"
			]
		},
		{
			"label": "운영과 규모",
			"pages": [
				"14-ops",
				"15-perf-cost"
			]
		},
		{
			"label": "마무리",
			"pages": [
				"16-patterns",
				"17-wrapup"
			]
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
