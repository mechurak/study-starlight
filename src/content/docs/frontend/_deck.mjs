// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 600,
	"catalogOrder": 1700,
	"label": "프론트엔드",
	"title": "프론트엔드 실전 스택",
	"icon": "laptop",
	"aliases": [
		"Next.js Tailwind shadcn/ui",
		"프론트엔드 스택"
	],
	"description": "Next.js · Tailwind · shadcn/ui — 세 도구가 각각 무슨 문제를 푸는가.",
	"category": "app",
	"tags": [
		"frontend"
	],
	"termIntro": "legacy",
	"groups": [
		{
			"id": "intro",
			"label": "시작"
		},
		{
			"id": "rsc",
			"label": "Next.js — 실행 환경"
		},
		{
			"id": "css-history",
			"label": "Tailwind CSS — 스타일 언어"
		},
		{
			"id": "shadcn",
			"label": "shadcn/ui — 컴포넌트"
		},
		{
			"id": "design-system",
			"label": "시스템으로 만들기"
		},
		{
			"id": "patterns",
			"label": "마무리"
		}
	],
	"map": [
		{
			"label": "0~1장",
			"href": "/frontend/00-intro/",
			"title": "시작",
			"tone": "mute",
			"desc": "읽는 법 · 세 도구의 지형도"
		},
		{
			"label": "2~8장 + 실전",
			"href": "/frontend/02-rsc/",
			"title": "Next.js",
			"badge": "실행 환경",
			"tone": "key",
			"desc": "서버 컴포넌트 · 라우팅 · 경계 · 데이터 · 캐싱 · 뮤테이션 · 성능 · 런타임 설정"
		},
		{
			"label": "9~12장",
			"href": "/frontend/09-css-history/",
			"title": "Tailwind CSS",
			"badge": "스타일 언어",
			"tone": "ok",
			"desc": "CSS의 문제 · Tailwind v4 · 실전 규칙 · 디자인 토큰"
		},
		{
			"label": "13~16장",
			"href": "/frontend/13-shadcn/",
			"title": "shadcn/ui",
			"badge": "컴포넌트",
			"tone": "warn",
			"desc": "소유권 모델 · 설치 · 컴포넌트 해부 · 자산화"
		},
		{
			"label": "17~19장",
			"href": "/frontend/17-design-system/",
			"title": "시스템으로 만들기",
			"tone": "mute",
			"desc": "디자인 시스템 적용 · 접근성 · 폼과 상태"
		},
		{
			"label": "20~21장",
			"href": "/frontend/20-patterns/",
			"title": "마무리",
			"tone": "mute",
			"desc": "실전 패턴 · 안티패턴 · 정리"
		}
	]
};
