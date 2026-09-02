// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 1300,
	"catalogOrder": 2000,
	"label": "Starlight",
	"title": "Starlight",
	"icon": "star",
	"aliases": [
		"Astro Starlight"
	],
	"description": "왜 이 도구를 골랐고 어떻게 쓰는지 — 이 사이트 자체가 예제다.",
	"category": "tools",
	"tags": [
		"frontend"
	],
	"termIntro": "required",
	"groups": [
		{
			"id": "intro",
			"label": "시작"
		},
		{
			"id": "astro",
			"label": "기반"
		},
		{
			"id": "mdx",
			"label": "콘텐츠"
		},
		{
			"id": "writing",
			"label": "글쓰기와 운영"
		},
		{
			"id": "wrapup",
			"label": "마무리"
		}
	],
	"map": [
		{
			"label": "0~1장",
			"href": "/starlight/00-intro/",
			"title": "시작",
			"tone": "mute",
			"desc": "범위와 3층 멘탈 모델 · 문서 도구 지형과 Starlight를 고른 이유",
			"note": "왜 노션이 아니라 문서 사이트이고, 왜 그중 Starlight인가"
		},
		{
			"label": "2~3장",
			"href": "/starlight/02-astro/",
			"title": "기반",
			"tone": "key",
			"desc": "Astro의 zero-JS 기본값과 아일랜드 · Starlight의 라우팅과 topics",
			"note": "파일 하나가 페이지가 되기까지 밑에서 무슨 일이 일어나나"
		},
		{
			"label": "4~6장",
			"href": "/starlight/04-mdx/",
			"title": "콘텐츠",
			"tone": "ok",
			"desc": "MDX의 문법과 함정 · 내장 컴포넌트의 역할 분담 · 커스텀 컴포넌트와 override",
			"note": "본문에 무엇을 어떻게 쓰고, 어디서 조용히 깨지나"
		},
		{
			"label": "7~8장",
			"href": "/starlight/07-writing/",
			"title": "글쓰기와 운영",
			"tone": "warn",
			"desc": "검색으로 착지하는 독자를 위한 글쓰기 · 빌드 · Pagefind · Cloudflare Pages",
			"note": "빌드가 못 잡는 것은 무엇으로 판정하나"
		},
		{
			"label": "9장",
			"href": "/starlight/09-wrapup/",
			"title": "마무리",
			"tone": "mute",
			"desc": "학습 지식베이스 설계 체크리스트 · 새 덱 추가 절차 · 명령 치트시트",
			"note": "비슷한 사이트를 시작할 때 무엇부터 하고, 언제 구조를 늘리나"
		}
	]
};
