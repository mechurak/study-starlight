// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 2000,
	"catalogOrder": 1300,
	"label": "kagent 실습",
	"title": "kagent 실습",
	"icon": "pencil",
	"aliases": [
		"kagent lab",
		"kagent hands-on",
		"AI Agent Kubernetes 실습",
		"kmcp 실습"
	],
	"description": "같은 kind 클러스터에서 kagent의 Agent·MCP·A2A부터 backend 연동·권한·온프렘 승격·Substrate A/B 비교까지 검증한다.",
	"category": "ai",
	"tags": [
		"agent",
		"k8s",
		"hands-on"
	],
	"termIntro": "not-required",
	"groups": [
		{
			"id": "lab-map",
			"label": "준비와 설치"
		},
		{
			"id": "first-agent",
			"label": "Agent와 tool"
		},
		{
			"id": "a2a-invoke",
			"label": "호출과 진단"
		},
		{
			"id": "backend-walking-skeleton",
			"label": "Backend 연동과 권한"
		},
		{
			"id": "byo-agent",
			"label": "코드형과 온프렘 승격"
		},
		{
			"id": "substrate-install",
			"label": "Agent Substrate"
		},
		{
			"id": "adoption-decision",
			"label": "판정과 정리"
		}
	],
	"map": [
		{
			"label": "0~2장",
			"href": "/kagent-lab/00-lab-map/",
			"title": "안전한 시작과 첫 호출",
			"tone": "key",
			"desc": "전용 context · pinned 설치 · sample Agent · model과 tool evidence",
			"note": "다른 cluster를 건드리지 않고 재현 가능한 기준선을 어떻게 만드나"
		},
		{
			"label": "3~6장",
			"href": "/kagent-lab/03-declarative-agent/",
			"title": "Agent·MCP·A2A와 진단",
			"tone": "ok",
			"desc": "명시적 runtime · tool allowlist · controller A2A route · condition과 log",
			"note": "선언부터 실제 호출까지 어느 checkpoint에서 실패했는가"
		},
		{
			"label": "7~8장",
			"href": "/kagent-lab/07-backend-walking-skeleton/",
			"title": "Backend와 권한 경계",
			"tone": "zone",
			"desc": "Node/TypeScript · CRD apply·status · A2A invoke · Grant·RBAC·우회 차단",
			"note": "우리 backend를 유일한 관리·호출 입구로 만들려면 무엇이 필요한가"
		},
		{
			"label": "9~10장",
			"href": "/kagent-lab/09-byo-agent/",
			"title": "코드형과 온프렘 승격",
			"tone": "warn",
			"desc": "BYO image의 kind 배포 · external PostgreSQL · HA · namespace scope · upgrade",
			"note": "로컬 데모를 비운영 온프렘 staging으로 옮길 때 무엇을 바꿔야 하나"
		},
		{
			"label": "11~12장",
			"href": "/kagent-lab/11-substrate-install/",
			"title": "같은 cluster의 Substrate A/B",
			"tone": "bad",
			"desc": "Substrate control/data plane · WorkerPool · SandboxAgent · suspend·restore 관찰",
			"note": "환경 차이를 제거하고 상주 Agent 대비 가치와 비용을 어떻게 측정하나"
		},
		{
			"label": "13장",
			"href": "/kagent-lab/13-adoption-decision/",
			"title": "채택 판정",
			"tone": "mute",
			"desc": "맨 Kubernetes · kagent · kagent+Substrate scorecard와 중단 조건",
			"note": "기능 목록이 아니라 어떤 실행 증거로 도입 여부를 결정하나"
		},
		{
			"label": "14장",
			"href": "/kagent-lab/14-cleanup/",
			"title": "정리",
			"tone": "mute",
			"desc": "backend·BYO·SandboxAgent·Substrate를 포함한 선택 삭제와 cluster 전체 삭제",
			"note": "실험의 blast radius를 끝까지 닫았는가"
		}
	]
};
