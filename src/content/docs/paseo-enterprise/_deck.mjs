// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 2200,
	"catalogOrder": 2200,
	"label": "Paseo 사내 연동",
	"title": "Paseo 사내 카탈로그",
	"icon": "puzzle",
	"aliases": [
		"Paseo 사내 빌드",
		"Paseo plugin",
		"Paseo enterprise catalog",
		"사내 AI 도구 카탈로그"
	],
	"description": "Paseo 사내 빌드를 카탈로그 프런트엔드로 쓴다 — upstream 최소 패치, 동봉 plugin, Keycloak, oauth2-proxy와 권한 필터링.",
	"category": "tools",
	"tags": [
		"auth",
		"onprem"
	],
	"termIntro": "required",
	"groups": [
		{
			"id": "decision",
			"label": "큰 그림"
		},
		{
			"id": "keycloak-login",
			"label": "인증과 인가"
		},
		{
			"id": "catalog-types",
			"label": "카탈로그와 구현"
		},
		{
			"id": "windows-installer",
			"label": "운영과 도입"
		},
		{
			"id": "desktop-plugin-management",
			"label": "대안 검토"
		}
	],
	"map": [
		{
			"label": "0~2장",
			"href": "/paseo-enterprise/00-decision/",
			"title": "경계부터 긋기",
			"tone": "key",
			"desc": "사내 빌드 결정과 AGPL 조건 · config·plugin·패치 층 구조 · 개인 PC와 온프렘 K8s 전체 구조",
			"note": "왜 plugin 개별 배포 대신 사내 빌드이며 무엇을 PC에 두지 않는가"
		},
		{
			"label": "3~4장",
			"href": "/paseo-enterprise/03-keycloak-login/",
			"title": "사용자를 증명하기",
			"tone": "zone",
			"desc": "Keycloak client 분리 · Device Flow · oauth2-proxy cookie와 Bearer 이중 경로",
			"note": "localhost callback이 필요한 경우와 필요하지 않은 경우는 무엇인가"
		},
		{
			"label": "5장",
			"href": "/paseo-enterprise/05-authorization/",
			"title": "허용 범위 계산하기",
			"tone": "warn",
			"desc": "`sub` · group · department · entitlement로 항목별 접근 제어",
			"note": "로그인한 사람에게 무엇을 보여 주고 실행시킬 것인가"
		},
		{
			"label": "6~7장",
			"href": "/paseo-enterprise/06-catalog-types/",
			"title": "카탈로그를 동작으로 잇기",
			"tone": "ok",
			"desc": "네 종류의 실행 모델 · artifact 계약 · 동봉 plugin RPC와 query 구현 골격",
			"note": "목록의 선택을 안전한 설치·첨부·실행으로 어떻게 바꾸는가"
		},
		{
			"label": "8~10장",
			"href": "/paseo-enterprise/08-windows-installer/",
			"title": "회사 제품으로 운영하기",
			"tone": "bad",
			"desc": "Windows x64·ARM64 package · provider CLI · npm 경계 · upstream 추적 · 업데이트 · 권한 회수",
			"note": "비개발자용 설치와 PoC 이후의 통제 상태를 어떻게 유지하는가"
		},
		{
			"label": "대안",
			"href": "/paseo-enterprise/enterprise-capability-store/",
			"title": "비개발자용 native 배포",
			"tone": "mute",
			"desc": "Claude·ChatGPT의 조직 배포 비교 · Gemini를 포함한 통합 AI Capability Store control plane",
			"note": "이미 보유한 Enterprise 앱을 실행 화면으로 유지하면서 진입점을 하나로 모을 수 있는가",
			"items": [
				[
					"Desktop 조직 plugin 관리",
					"/paseo-enterprise/desktop-plugin-management/"
				],
				[
					"통합 AI Capability Store",
					"/paseo-enterprise/enterprise-capability-store/"
				]
			]
		}
	]
};
