// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 1700,
	"catalogOrder": 1000,
	"label": "LiteLLM",
	"title": "LiteLLM",
	"icon": "random",
	"aliases": [
		"LLM Gateway",
		"AI Gateway",
		"LiteLLM Proxy"
	],
	"description": "여러 LLM 앞의 단일 제어 지점 — 온프렘 Kubernetes에서 인증·라우팅·비용·장애를 운영한다.",
	"category": "ai",
	"tags": [
		"llm",
		"k8s",
		"auth",
		"onprem"
	],
	"termIntro": "required",
	"groups": [
		{
			"id": "position",
			"label": "시작"
		},
		{
			"id": "model-config",
			"label": "제어 정책"
		},
		{
			"id": "k8s-architecture",
			"label": "온프렘 Kubernetes"
		},
		{
			"id": "security",
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
			"href": "/litellm/00-position/",
			"title": "자리와 요청의 일생",
			"tone": "key",
			"desc": "Proxy와 SDK의 경계 · 인증부터 provider 응답 이후까지",
			"note": "LiteLLM은 요청의 어느 순간에 무엇을 결정하는가"
		},
		{
			"label": "2~4장",
			"href": "/litellm/02-model-config/",
			"title": "제어 정책",
			"tone": "zone",
			"desc": "공개 모델명과 실제 deployment · key·team·budget · routing·fallback",
			"note": "누가 무엇을 얼마나 쓰며 실패하면 어디로 가는가"
		},
		{
			"label": "5~7장",
			"href": "/litellm/05-k8s-architecture/",
			"title": "온프렘 Kubernetes",
			"tone": "warn",
			"desc": "Pod·Service·Gateway · Helm 배포 · Postgres·Redis·migration",
			"note": "여러 replica가 하나의 gateway처럼 동작하려면 무엇을 공유해야 하는가"
		},
		{
			"label": "8~11장",
			"href": "/litellm/08-security/",
			"title": "운영",
			"tone": "bad",
			"desc": "secret·egress·사내 CA · metrics·Langfuse · upgrade·장애 진단",
			"note": "평소 무엇을 보고, 장애 때 어느 경계부터 가르는가"
		},
		{
			"label": "12~13장",
			"href": "/litellm/12-glossary/",
			"title": "마무리",
			"tone": "mute",
			"desc": "용어 사전 · 전체 지도 · 운영 체크리스트"
		}
	]
};
