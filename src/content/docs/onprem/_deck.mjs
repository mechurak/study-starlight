// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 300,
	"catalogOrder": 300,
	"label": "온프렘 쿠버네티스",
	"title": "온프렘 쿠버네티스",
	"icon": "server",
	"aliases": [
		"온프레미스 Kubernetes",
		"on-premises Kubernetes"
	],
	"description": "클라우드가 대신 해 주던 자리 — LB·인증서·SSO·스토리지·백업 — 를 직접 채우는 운영.",
	"category": "infra",
	"tags": [
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
			"id": "foundation",
			"label": "기반"
		},
		{
			"id": "gateway",
			"label": "바깥으로 여는 길"
		},
		{
			"id": "minio",
			"label": "상태를 맡는 것들"
		},
		{
			"id": "observability",
			"label": "관측"
		},
		{
			"id": "gitops",
			"label": "배포와 복구"
		},
		{
			"id": "ops",
			"label": "운영"
		},
		{
			"id": "glossary",
			"label": "마무리"
		}
	],
	"map": [
		{
			"label": "0~1장",
			"href": "/onprem/00-intro/",
			"title": "빈칸 목록 만들기",
			"tone": "key",
			"desc": "범위와 기준 시점 · 클라우드가 대신 해 주던 것",
			"note": "관리형 서비스가 사라진 자리에 각각 무엇이 들어가는가"
		},
		{
			"label": "2장",
			"href": "/onprem/02-foundation/",
			"title": "바닥",
			"tone": "mute",
			"desc": "클러스터 형태 · CNI · 스토리지 계층",
			"note": "위에 얹을 것들이 전부 딛고 설 땅은 무엇인가"
		},
		{
			"label": "3~5장",
			"href": "/onprem/03-gateway/",
			"title": "바깥으로 여는 길",
			"tone": "warn",
			"desc": "MetalLB와 Gateway API · cert-manager와 external-dns · Keycloak과 oauth2-proxy",
			"note": "외부에서 이름으로, HTTPS로, 로그인해서 닿게 하려면 무엇이 필요한가"
		},
		{
			"label": "6~7장",
			"href": "/onprem/06-minio/",
			"title": "상태를 맡는 것들",
			"tone": "bad",
			"desc": "오브젝트 스토리지(MinIO) · 데이터베이스(CloudNativePG)",
			"note": "위층 전부의 상태가 떨어지는 바닥 두 개는 어떻게 세우는가"
		},
		{
			"label": "8장",
			"href": "/onprem/08-observability/",
			"title": "관측",
			"tone": "ok",
			"desc": "세 신호의 자리 · 감시자의 배치 · 유한한 용량 (도구 상세는 관측 덱)",
			"note": "장애가 났을 때 어디를 보고, 그 답은 어디에 저장되는가"
		},
		{
			"label": "9~11장",
			"href": "/onprem/09-gitops/",
			"title": "배포와 복구",
			"tone": "zone",
			"desc": "Argo CD · 시크릿 · 백업과 재해 복구",
			"note": "이 스택 전부를 어떻게 재현하고, 잃으면 무엇부터 되살리는가"
		},
		{
			"label": "12장",
			"href": "/onprem/12-ops/",
			"title": "운영",
			"tone": "warn",
			"desc": "루틴 · 업그레이드 · 용량 · 진단 사다리",
			"note": "평상시에 무엇을 하고, 터졌을 때 어느 층부터 가르는가"
		},
		{
			"label": "13~14장",
			"href": "/onprem/13-glossary/",
			"title": "마무리",
			"tone": "mute",
			"desc": "용어 사전 · 마무리"
		}
	]
};
