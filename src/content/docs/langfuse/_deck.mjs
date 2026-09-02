// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 1800,
	"catalogOrder": 1100,
	"label": "Langfuse",
	"title": "Langfuse",
	"icon": "analytics",
	"aliases": [
		"LLM Observability",
		"LLMOps",
		"LLM 평가",
		"Prompt Management"
	],
	"description": "LLM 앱이 왜 그런 응답을 냈는지 추적하고, prompt·평가·실험을 production 피드백 루프로 잇는다.",
	"category": "ai",
	"tags": [
		"llm",
		"o11y",
		"k8s",
		"onprem"
	],
	"termIntro": "required",
	"groups": [
		{
			"id": "position",
			"label": "시작"
		},
		{
			"id": "instrumentation",
			"label": "관측 설계"
		},
		{
			"id": "prompt-management",
			"label": "개선 루프"
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
			"href": "/langfuse/00-position/",
			"title": "자리와 데이터 모델",
			"tone": "key",
			"desc": "관측 플랫폼의 경계 · observation · trace · session · score",
			"note": "무엇을 어떤 단위로 남겨야 질문에 답할 수 있는가"
		},
		{
			"label": "2~3장",
			"href": "/langfuse/02-instrumentation/",
			"title": "관측 설계",
			"tone": "zone",
			"desc": "OTel 기반 SDK · batch와 flush · agent/RAG trace 구조",
			"note": "실행을 잃지 않으면서 분석 가능한 이름과 문맥을 어떻게 남기는가"
		},
		{
			"label": "4~6장",
			"href": "/langfuse/04-prompt-management/",
			"title": "개선 루프",
			"tone": "ok",
			"desc": "prompt version·label · score · online eval · dataset experiment",
			"note": "production 실패를 재현 가능한 release gate로 어떻게 되돌리는가"
		},
		{
			"label": "7~9장",
			"href": "/langfuse/07-k8s-architecture/",
			"title": "온프렘 Kubernetes",
			"tone": "warn",
			"desc": "Web·Worker · Postgres·ClickHouse·Redis·S3 · 배포·upgrade·retention",
			"note": "비동기 수집 경로를 여러 replica와 복구 가능한 저장소로 어떻게 운영하는가"
		},
		{
			"label": "10~12장",
			"href": "/langfuse/10-security/",
			"title": "운영",
			"tone": "bad",
			"desc": "masking·key·SSO · queue·storage 관측 · 장애 진단",
			"note": "요청은 성공했는데 trace가 없을 때 어느 경계부터 가르는가"
		},
		{
			"label": "13~14장",
			"href": "/langfuse/13-glossary/",
			"title": "마무리",
			"tone": "mute",
			"desc": "용어 사전 · 전체 지도 · production 준비 체크리스트"
		}
	]
};
