// 덱 단위 metadata와 구조. 페이지 소속·순서는 sidebar 배열에 있다.
export default {
	"navOrder": 810,
	"catalogOrder": 610,
	"label": "Keycloak 실습",
	"title": "Keycloak 실습",
	"icon": "pencil",
	"aliases": [
		"Keycloak lab",
		"Keycloak hands-on",
		"키클록 실습",
		"Compose SSO 실습",
		"LDAP 로그인 실습"
	],
	"description": "Docker Compose 한 환경에서 client 로그인·두 앱 SSO·API 권한·Samba LDAP 로그인·외부 group 권한을 순서대로 재현한다.",
	"category": "infra",
	"tags": [
		"auth"
	],
	"termIntro": "not-required",
	"sidebar": [
		{
			"label": "환경 준비",
			"pages": [
				"lab-setup",
				"lab-code-guide"
			]
		},
		{
			"label": "로컬 로그인과 SSO",
			"pages": [
				"client-login-lab",
				"sso-api-lab"
			]
		},
		{
			"label": "외부 디렉터리",
			"pages": [
				"samba-directory",
				"directory-login-lab",
				"directory-permissions-lab",
				"state-inspection"
			]
		}
	],
	"map": [
		{
			"label": "환경 준비",
			"href": "/keycloak-lab/lab-setup/",
			"title": "Compose 환경과 읽을 코드",
			"tone": "key",
			"desc": "Colima/Docker Engine · issuer·CA·secret · guided/ready · stop/resume",
			"note": "무엇을 직접 읽고 바꾸며 무엇은 스크립트가 대신하나",
			"items": [["실습 환경 준비", "/keycloak-lab/lab-setup/"], ["실습 코드에서 읽을 것", "/keycloak-lab/lab-code-guide/"]]
		},
		{
			"label": "로컬 로그인과 SSO",
			"href": "/keycloak-lab/client-login-lab/",
			"title": "client 하나에서 API 401·403·200까지",
			"tone": "warn",
			"desc": "app-a client · redirect 실패와 복구 · app-b SSO · audience·role · API 결과",
			"note": "Keycloak session 재사용과 API의 별도 검증은 어디서 갈리나",
			"items": [["Client 로그인 실습", "/keycloak-lab/client-login-lab/"], ["두 앱 SSO와 API 권한 실습", "/keycloak-lab/sso-api-lab/"]]
		},
		{
			"label": "외부 디렉터리",
			"href": "/keycloak-lab/samba-directory/",
			"title": "Samba 계정 로그인에서 group 권한까지",
			"tone": "ok",
			"desc": "Samba seed · LDAPS Federation · LDAP group mapper · role·groups claim · API 정책",
			"note": "외부 group은 어느 두 단계를 거쳐 API 권한이 되나",
			"items": [["Samba 테스트 디렉터리", "/keycloak-lab/samba-directory/"], ["외부 계정 로그인 실습", "/keycloak-lab/directory-login-lab/"], ["외부 Group 권한 실습", "/keycloak-lab/directory-permissions-lab/"], ["적용된 상태 조회", "/keycloak-lab/state-inspection/"]]
		}
	]
};
