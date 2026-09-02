// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 500,
	"catalogOrder": 1600,
	"label": "웹 개발 일반",
	"title": "웹 개발 일반",
	"icon": "rocket",
	"aliases": [
		"웹 생태계",
		"Web development"
	],
	"description": "요청의 일생, 렌더링 전략, 기술 지형도, 도구 사슬을 통증 중심으로.",
	"category": "app",
	"tags": [
		"frontend",
		"cloud"
	],
	"termIntro": "required",
	"groups": [
		{
			"id": "intro",
			"label": "시작"
		},
		{
			"id": "landscape",
			"label": "지형"
		},
		{
			"id": "runtime",
			"label": "도구 사슬"
		},
		{
			"id": "quality",
			"label": "품질과 규모"
		},
		{
			"id": "backend",
			"label": "서비스가 되기까지"
		},
		{
			"id": "glossary",
			"label": "마무리"
		}
	],
	"map": [
		{
			"label": "0~2장",
			"href": "/web/00-intro/",
			"title": "웹의 뼈대",
			"tone": "key",
			"desc": "요청의 일생 · 렌더링 전략",
			"note": "브라우저에 주소를 치면 무슨 일이 일어나는가"
		},
		{
			"label": "3장",
			"href": "/web/03-landscape/",
			"title": "기술 스택 지형도",
			"tone": "warn",
			"desc": "무엇이 어느 층의 물건인가",
			"note": "요즘 뭘 많이 쓰고, 각각 어느 층의 물건인가"
		},
		{
			"label": "4~7장",
			"href": "/web/04-runtime/",
			"title": "도구 사슬",
			"tone": "ok",
			"desc": "런타임 · 패키지 매니저 · 번들러 · Vite",
			"note": "`pnpm dev` 한 줄 뒤에서 무엇이 도는가"
		},
		{
			"label": "8~9장",
			"href": "/web/08-quality/",
			"title": "품질과 규모",
			"tone": "key",
			"desc": "품질 도구 · 모노레포",
			"note": "코드가 커져도 무너지지 않게 하는 장치들"
		},
		{
			"label": "10~13장",
			"href": "/web/10-backend/",
			"title": "서비스가 되기까지",
			"tone": "key",
			"desc": "백엔드와 데이터 · 브라우저 보안 · 배포 · Cloudflare",
			"note": "내 코드는 어떻게 서비스가 되는가"
		},
		{
			"label": "14~15장",
			"href": "/web/14-glossary/",
			"title": "마무리",
			"tone": "mute",
			"desc": "용어 사전 · 마무리"
		}
	]
};
