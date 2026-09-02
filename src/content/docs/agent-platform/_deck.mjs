// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 1900,
	"catalogOrder": 1200,
	"label": "Agent 배포 플랫폼",
	"title": "사내 Agent 배포 플랫폼",
	"icon": "setting",
	"aliases": [
		"AI Agent Platform",
		"Agent Runtime",
		"kagent",
		"Amazon Bedrock AgentCore",
		"Temporal",
		"Dapr Agents",
		"agentgateway",
		"agentregistry"
	],
	"description": "Agent·권한·배포 계약을 제품 밖에 둔다 — kagent·AgentCore를 교체 가능한 실행 어댑터로 연결하고 durable execution 층은 보류한 결정으로 관리하는 설계.",
	"category": "ai",
	"tags": [
		"agent",
		"k8s",
		"auth",
		"onprem",
		"cloud"
	],
	"termIntro": "required",
	"groups": [
		{
			"id": "position",
			"label": "큰 그림"
		},
		{
			"id": "agent-types",
			"label": "제품 밖의 계약"
		},
		{
			"id": "kagent-architecture",
			"label": "kagent — 온프렘 실행 어댑터"
		},
		{
			"id": "durable-execution",
			"label": "보류한 결정"
		},
		{
			"id": "agentcore",
			"label": "AWS 실행 어댑터"
		},
		{
			"id": "hybrid",
			"label": "하이브리드 운영"
		},
		{
			"id": "agentgateway",
			"label": "생태계의 인접 층"
		},
		{
			"id": "adoption",
			"label": "도입과 마무리"
		}
	],
	"map": [
		{
			"label": "0~1장",
			"href": "/agent-platform/00-position/",
			"title": "큰 그림과 plane",
			"tone": "key",
			"desc": "왜 runtime만으로 플랫폼이 되지 않는가 · 사용자 경험·control·runtime·foundation plane",
			"note": "제품을 고르기 전에 어떤 경계를 고정해야 하는가"
		},
		{
			"label": "2~5장",
			"href": "/agent-platform/02-agent-types/",
			"title": "제품 밖의 계약",
			"tone": "zone",
			"desc": "Agent 종류의 여섯 요구 차원 · Agent·Knowledge·Version·Trigger·Grant·Deployment · 세 lifecycle · invoke와 tool action 권한",
			"note": "무엇을 회사가 소유해야 provider를 바꿔도 의미가 남는가"
		},
		{
			"label": "6~7장",
			"href": "/agent-platform/06-adapter-contract/",
			"title": "Adapter와 MCP 공급 계약",
			"tone": "ok",
			"desc": "runtime adapter operation · capability profile · 사용자 MCP의 등록·검증·배포·공개",
			"note": "여러 backend의 차이를 보존하면서 Agent와 Tool의 공급 계약을 어떻게 안정시키는가"
		},
		{
			"label": "8~11장",
			"href": "/agent-platform/08-kagent-architecture/",
			"title": "kagent — 온프렘 실행 어댑터",
			"tone": "warn",
			"desc": "controller·engine 구조 · Agent와 tool 리소스 · 사내 frontend·backend 연결 · 맨 Kubernetes 기준선과 adapter 운영",
			"note": "온프렘 영가설보다 kagent가 실제로 줄이는 비용은 무엇인가"
		},
		{
			"label": "12장",
			"href": "/agent-platform/12-durable-execution/",
			"title": "보류한 execution durability",
			"tone": "warn",
			"desc": "workload target과 분리한 execution profile · 재개 조건 · Temporal·Dapr 후보",
			"note": "무엇을 지금 도입하지 않으며 어떤 증거가 생기면 다시 여는가"
		},
		{
			"label": "13장",
			"href": "/agent-platform/13-agentcore/",
			"title": "AgentCore — AWS 실행 어댑터",
			"tone": "ok",
			"desc": "managed session runtime · Container와 CodeZip · VPC·PrivateLink·JWT·Cedar 경계",
			"note": "AWS target은 제품 중립 계약을 어디까지 구현하고 무엇을 회사에 남기는가"
		},
		{
			"label": "14~15장",
			"href": "/agent-platform/14-hybrid/",
			"title": "하이브리드 운영",
			"tone": "bad",
			"desc": "data zone별 target 선택 · network · 감사 · SLO · 장애 격리와 복구",
			"note": "온프렘과 AWS를 한 control plane에서 어떻게 운영하는가"
		},
		{
			"label": "16~17장",
			"href": "/agent-platform/16-agentgateway/",
			"title": "생태계의 인접 층",
			"tone": "zone",
			"desc": "agentgateway 트래픽 데이터 평면 · agentregistry 유통 catalog · 자체 backend·LiteLLM과의 겹침 경계",
			"note": "같은 생태계의 인접 층 중 무엇이 이미 회사 소유로 정한 자리와 겹치는가"
		},
		{
			"label": "18~19장",
			"href": "/agent-platform/18-adoption/",
			"title": "도입과 마무리",
			"tone": "mute",
			"desc": "두 Agent와 사용자 MCP로 검증하는 PoC · 선택 기준 · 용어 사전 · production checklist"
		}
	]
};
