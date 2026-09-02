// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 1000,
	"catalogOrder": 400,
	"label": "서버 관리 일반",
	"title": "서버 관리 일반",
	"icon": "linux",
	"aliases": [
		"Linux server",
		"Ubuntu server"
	],
	"description": "Ubuntu 24.04 실무 — “이 서버는 무슨 물건인가”부터 상황에서 출발하는 명령 정리.",
	"category": "infra",
	"tags": [
		"linux",
		"onprem"
	],
	"termIntro": "required",
	"groups": [
		{
			"id": "intro",
			"label": "준비"
		},
		{
			"id": "hardware",
			"label": "이 서버는 무엇인가"
		},
		{
			"id": "systemd",
			"label": "서비스와 로그"
		},
		{
			"id": "network",
			"label": "네트워크"
		},
		{
			"id": "users",
			"label": "사용자와 접근"
		},
		{
			"id": "packages",
			"label": "운영과 보안"
		},
		{
			"id": "playbook",
			"label": "마무리"
		}
	],
	"map": [
		{
			"label": "0~1장",
			"href": "/server/00-intro/",
			"title": "준비",
			"tone": "mute",
			"desc": "범위 · 낡은 명령 대응표 · 명령 읽는 법",
			"note": "모르는 명령을 만났을 때 스스로 알아내는 법은"
		},
		{
			"label": "2~4장",
			"href": "/server/02-hardware/",
			"title": "이 서버는 무엇인가",
			"tone": "key",
			"desc": "OS · 하드웨어 · 디스크와 파일시스템 · 프로세스와 자원",
			"note": "이 서버는 무슨 물건이고, 지금 무엇이 자원을 쓰고 있나"
		},
		{
			"label": "5~6장",
			"href": "/server/05-systemd/",
			"title": "서비스와 로그",
			"tone": "ok",
			"desc": "systemd · journalctl · /var/log",
			"note": "서비스는 어떻게 켜고 끄고, 무슨 일이 있었는지는 어디서 보나"
		},
		{
			"label": "7~9장",
			"href": "/server/07-network/",
			"title": "네트워크",
			"tone": "warn",
			"desc": "상태 보기 · 층별 진단 · 사내 프록시와 사설 CA",
			"note": "안 될 때 **어디까지** 되고 있는가"
		},
		{
			"label": "10~11장",
			"href": "/server/10-users/",
			"title": "사용자와 접근",
			"tone": "key",
			"desc": "계정 · 권한 · SSH · 접속 이력과 명령 감사",
			"note": "누가 언제 들어와 무슨 명령을 썼나"
		},
		{
			"label": "12~13장",
			"href": "/server/12-packages/",
			"title": "운영과 보안",
			"tone": "ok",
			"desc": "apt와 업데이트 · ufw · fail2ban · 시간 동기화",
			"note": "업데이트와 최소한의 보안은 어떻게 챙기나"
		},
		{
			"label": "14~16장",
			"href": "/server/14-playbook/",
			"title": "마무리",
			"tone": "mute",
			"desc": "상황별 진단 플레이북 · 용어 사전 · 치트시트",
			"note": "증상에서 출발해 어느 순서로 명령을 꺼내 쓰나"
		}
	]
};
