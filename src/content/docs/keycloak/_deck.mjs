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
	"description": "인증 중앙화부터 로컬 SSO·API 인가·외부 디렉터리·운영 복구까지 경계별로 익히는 Keycloak 개념. Compose 재현은 Keycloak 실습 덱.",
	"category": "infra",
	"tags": [
		"auth",
		"k8s",
		"onprem"
	],
	"termIntro": "required",
	"groups": [
		{
			"id": "foundations",
			"label": "기초"
		},
		{
			"id": "login",
			"label": "로그인과 토큰"
		},
		{
			"id": "access",
			"label": "접근 제어"
		},
		{
			"id": "directory",
			"label": "외부 디렉터리"
		},
		{
			"id": "integrations",
			"label": "연동"
		},
		{
			"id": "operations",
			"label": "운영"
		},
		{
			"id": "reference",
			"label": "문제 해결과 마무리"
		}
	],
	"map": [
		{
			"label": "큰 그림",
			"href": "/keycloak/authentication-landscape/",
			"title": "인증 생태계에서 Keycloak의 자리",
			"tone": "key",
			"desc": "디렉터리·IdP·프로토콜 · Keycloak 역할 · realm과 로컬 사용자",
			"note": "비슷한 인증 용어는 어떤 종류이고 어디에서 이어지나",
			"items": [["Keycloak의 역할", "/keycloak/keycloak-overview/"], ["Realm과 로컬 사용자", "/keycloak/realm-and-users/"]]
		},
		{
			"label": "로그인과 접근",
			"href": "/keycloak/oauth-oidc/",
			"title": "로그인에서 최종 API 권한까지",
			"tone": "warn",
			"desc": "Code+PKCE · SSO · token 검증 · group/role · MFA · logout",
			"note": "token은 누가 무엇을 검증하고 401·403·200은 어디서 갈리나",
			"items": [["Client와 SSO", "/keycloak/clients-and-sso/"], ["Token 검증", "/keycloak/token-validation/"], ["인증 Flow", "/keycloak/authentication-flows/"]]
		},
		{
			"label": "외부 디렉터리",
			"href": "/keycloak/ad-and-ldap/",
			"title": "AD 호환 원본에서 API claim까지",
			"tone": "ok",
			"desc": "Samba · LDAPS Federation · 두 mapper · 변경과 장애",
			"note": "외부 group과 계정 상태는 언제 새 token에 반영되나",
			"items": [["LDAP Federation", "/keycloak/ldap-federation/"], ["Group Mapping", "/keycloak/directory-group-mapping/"], ["변경과 장애", "/keycloak/directory-changes/"]]
		},
		{
			"label": "다른 연동",
			"href": "/keycloak/identity-brokering/",
			"title": "외부 IdP·서비스·비네이티브 앱",
			"tone": "key",
			"desc": "OIDC Brokering · SAML · Service Account · proxy · Kubernetes",
			"note": "사용자 redirect와 machine identity, API server 인증은 어떻게 다른가",
			"items": [["Service Accounts", "/keycloak/service-accounts/"], ["oauth2-proxy", "/keycloak/oauth2-proxy/"], ["Kubernetes OIDC", "/keycloak/kubernetes-oidc/"]]
		},
		{
			"label": "운영",
			"href": "/keycloak/deployment/",
			"title": "배포·상태·관찰·복구",
			"tone": "ok",
			"desc": "hostname/TLS · DB/cache · events/metrics · backup/upgrade · keys",
			"note": "실습의 보존 재시작과 운영 HA·복구 보장은 어디서 갈리나",
			"items": [["저장소와 가용성", "/keycloak/storage-and-availability/"], ["백업과 업그레이드", "/keycloak/backup-and-upgrade/"], ["관리 권한과 키", "/keycloak/administration-and-keys/"]]
		},
		{
			"label": "문제 해결과 마무리",
			"href": "/keycloak/troubleshooting/",
			"title": "증상에서 경계를 찾고 범위를 확인한다",
			"tone": "mute",
			"desc": "진단 지도 · 용어 사전 · 통과/보류 범위",
			"items": [["용어 사전", "/keycloak/glossary/"], ["학습 마무리", "/keycloak/wrapup/"]]
		}
	]
};
