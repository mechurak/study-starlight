// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 700,
	"catalogOrder": 1800,
	"label": "shadcn/ui",
	"title": "shadcn/ui",
	"icon": "puzzle",
	"aliases": [
		"shadcn",
		"shadcn ui"
	],
	"description": "앱의 외모를 다섯 리소스로 쪼개 이름 붙이고, 그 한 벌을 테마로 관리한다.",
	"category": "app",
	"tags": [
		"frontend"
	],
	"termIntro": "required",
	"groups": [
		{
			"id": "intro",
			"label": "준비"
		},
		{
			"id": "theme",
			"label": "테마라는 그릇"
		},
		{
			"id": "color",
			"label": "리소스 하나씩"
		},
		{
			"id": "dark",
			"label": "테마 다루기"
		},
		{
			"id": "glossary",
			"label": "마무리"
		}
	],
	"map": [
		{
			"label": "0~1장",
			"title": "준비",
			"tone": "mute",
			"items": [
				[
					"0. 이 덱을 읽는 법 · 기본 용어 다섯 개",
					"/shadcn/00-intro/"
				],
				[
					"1. shadcn/ui란 — 설치하지 않는 컴포넌트",
					"/shadcn/01-what-is-shadcn/"
				]
			]
		},
		{
			"label": "2~3장",
			"title": "테마라는 그릇",
			"tone": "key",
			"desc": "**테마 = 리소스 목록** — 이 덱의 중심",
			"items": [
				[
					"2. 테마 = 리소스 목록",
					"/shadcn/02-theme/"
				],
				[
					"3. 테마가 놓이는 자리 — 설치와 파일 구조",
					"/shadcn/03-setup/"
				]
			]
		},
		{
			"label": "4~8장",
			"title": "리소스 하나씩",
			"tone": "ok",
			"desc": "앱의 외모를 다섯 리소스로 쪼개 이름을 붙인다",
			"items": [
				[
					"4. 색 — 짝으로 관리한다",
					"/shadcn/04-color/"
				],
				[
					"5. 형태 — 둥글기 · 간격 · 테두리 · 그림자",
					"/shadcn/05-shape/"
				],
				[
					"6. 글자 — 크기 스케일과 한글",
					"/shadcn/06-typography/"
				],
				[
					"7. 컴포넌트 — 결정이 담긴 코드",
					"/shadcn/07-component/"
				],
				[
					"8. 아이콘 · 폰트",
					"/shadcn/08-icon-font/"
				]
			]
		},
		{
			"label": "9~11장",
			"title": "테마 다루기",
			"tone": "warn",
			"desc": "리소스 한 벌을 두 벌로, 그리고 팀의 자산으로",
			"items": [
				[
					"9. 테마 두 벌 — 다크 모드",
					"/shadcn/09-dark/"
				],
				[
					"10. 내 테마 만들기",
					"/shadcn/10-make-theme/"
				],
				[
					"11. 테마를 팀에 배포하기",
					"/shadcn/11-registry/"
				]
			]
		},
		{
			"label": "12~13장",
			"title": "마무리",
			"tone": "mute",
			"items": [
				[
					"12. 용어 사전",
					"/shadcn/12-glossary/"
				],
				[
					"13. 마무리 — 한 장 요약",
					"/shadcn/13-wrapup/"
				]
			]
		}
	]
};
