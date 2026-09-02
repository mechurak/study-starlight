// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 800,
	"catalogOrder": 600,
	"label": "Keycloak",
	"title": "Keycloak",
	"icon": "seti:lock",
	"aliases": [
		"SSO",
		"OIDC identity provider",
		"키클록",
		"키클락",
		"IdP",
		"AD 인증"
	],
	"description": "사내 AD를 사용자 저장소로 빌려 쓰는 SSO 허브 — 토큰, 연동, 배포까지 관리자 관점.",
	"category": "infra",
	"tags": [
		"auth",
		"k8s",
		"onprem"
	],
	"termIntro": "required",
	"groups": [
		{
			"id": "intro",
			"label": "시작"
		},
		{
			"id": "oauth-oidc",
			"label": "프로토콜"
		},
		{
			"id": "structure",
			"label": "Keycloak 들여다보기"
		},
		{
			"id": "k8s-oidc",
			"label": "연동"
		},
		{
			"id": "deploy",
			"label": "배포와 운영"
		},
		{
			"id": "glossary",
			"label": "마무리"
		}
	],
	"map": [
		{
			"label": "0~1장",
			"href": "/keycloak/00-intro/",
			"title": "왜 SSO인가",
			"tone": "key",
			"desc": "범위 · Keycloak의 자리",
			"note": "AD가 이미 있는데 Keycloak은 왜 필요한가"
		},
		{
			"label": "2장",
			"href": "/keycloak/02-oauth-oidc/",
			"title": "OAuth 2.0 · OIDC",
			"tone": "warn",
			"desc": "토큰의 문법",
			"note": "토큰 세 종류는 각각 무엇이고 누가 검증하는가"
		},
		{
			"label": "3~5장",
			"href": "/keycloak/03-structure/",
			"title": "Keycloak 들여다보기",
			"tone": "ok",
			"desc": "realm · client · AD 연동 · 세션",
			"note": "AD 그룹이 앱의 토큰까지 어떻게 오는가"
		},
		{
			"label": "6~7장",
			"href": "/keycloak/06-k8s-oidc/",
			"title": "연동",
			"tone": "key",
			"desc": "k8s API 서버 · 사내 앱",
			"note": "kubectl과 사내 앱이 어떻게 SSO를 타는가"
		},
		{
			"label": "8~10장",
			"href": "/keycloak/08-deploy/",
			"title": "배포와 운영",
			"tone": "ok",
			"desc": "온프렘 배포 · 운영 · 트러블슈팅",
			"note": "온프렘 k8s에서 Keycloak 자체를 어떻게 돌리는가"
		},
		{
			"label": "11~12장",
			"href": "/keycloak/11-glossary/",
			"title": "마무리",
			"tone": "mute",
			"desc": "용어 사전 · 마무리"
		}
	]
};
