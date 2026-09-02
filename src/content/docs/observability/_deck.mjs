// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 400,
	"catalogOrder": 500,
	"label": "관측",
	"title": "관측",
	"icon": "analytics",
	"aliases": [
		"모니터링",
		"Monitoring",
		"Telemetry"
	],
	"description": "메트릭·로그·트레이스를 Prometheus·Loki·Tempo·Grafana로 세우고, 셋 사이를 잇는 법.",
	"category": "infra",
	"tags": [
		"o11y",
		"k8s",
		"hands-on"
	],
	"termIntro": "required",
	"groups": [
		{
			"id": "intro",
			"label": "시작"
		},
		{
			"id": "prometheus",
			"label": "세 신호"
		},
		{
			"id": "grafana",
			"label": "하나의 창"
		},
		{
			"id": "glossary",
			"label": "마무리"
		},
		{
			"id": "lab-setup",
			"label": "따라 하기"
		}
	],
	"map": [
		{
			"label": "0장",
			"href": "/observability/00-intro/",
			"title": "시작하기 전에",
			"tone": "key",
			"desc": "범위와 기준 시점 · 2026년의 관측 지형",
			"note": "무엇이 끝났고 무엇으로 갈아타는가"
		},
		{
			"label": "1장",
			"href": "/observability/01-signals/",
			"title": "세 신호",
			"tone": "zone",
			"desc": "같은 사건을 셋으로 나란히 보기 · 스택 전체 그림 · 카디널리티",
			"note": "무엇이 무엇에 답하고, 셋은 어떻게 이어지는가"
		},
		{
			"label": "2장",
			"href": "/observability/02-prometheus/",
			"title": "메트릭 — Prometheus",
			"tone": "warn",
			"desc": "메트릭 타입 넷 · PromQL 다섯 형태 · RED와 USE · 알림 설계",
			"note": "얼마나 · 언제부터 · 그리고 누가 사람을 깨우는가"
		},
		{
			"label": "3장",
			"href": "/observability/03-loki/",
			"title": "로그 — Loki",
			"tone": "ok",
			"desc": "스트림과 chunk · 라벨 설계 · LogQL 네 단계 · Alloy 수집",
			"note": "그 시각에 정확히 무슨 일이 있었는가"
		},
		{
			"label": "4장",
			"href": "/observability/04-tempo/",
			"title": "추적 — Tempo",
			"tone": "bad",
			"desc": "스팬의 생김새 · 컨텍스트 전파 · 샘플링 · TraceQL · Tempo 3.0",
			"note": "한 요청이 어디서 느렸는가"
		},
		{
			"label": "5장",
			"href": "/observability/05-grafana/",
			"title": "조회 — Grafana",
			"tone": "key",
			"desc": "상관 관계 설정 · Explore 조사 흐름 · 대시보드 설계 · SSO",
			"note": "셋 사이를 두 번의 클릭으로 오갈 수 있는가"
		},
		{
			"label": "6~7장",
			"href": "/observability/06-glossary/",
			"title": "마무리",
			"tone": "mute",
			"desc": "용어 사전과 질의 언어 요약 · 조사 흐름 · 도입 순서와 사고 대응 카드"
		},
		{
			"label": "8~11장",
			"href": "/observability/08-lab-setup/",
			"title": "따라 하기",
			"tone": "ok",
			"desc": "공식 LGTM · 공식 rolldice 앱 · 첫 통합 조사 · 첫 대시보드 · 내 앱 계측",
			"note": "Explore에서 원인을 찾고, 마지막에는 자체 앱을 직접 계측해 연결하는가"
		}
	]
};
