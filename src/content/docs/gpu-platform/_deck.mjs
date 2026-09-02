// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 1500,
	"catalogOrder": 900,
	"label": "온프렘 GPU 플랫폼",
	"title": "온프렘 GPU 플랫폼",
	"icon": "server",
	"aliases": [
		"Kubernetes GPU 플랫폼",
		"KServe GPU 클러스터",
		"DGX Spark A100 B300"
	],
	"description": "DGX Spark·A100·B300을 추론 전용 운영 모델로 묶는다 — GPU Operator, KServe, LiteLLM과 단계적 전환.",
	"category": "ai",
	"tags": [
		"gpu",
		"llm",
		"k8s",
		"onprem"
	],
	"termIntro": "required",
	"groups": [
		{
			"id": "decision",
			"label": "시작"
		},
		{
			"id": "gpu-foundation",
			"label": "GPU 기반"
		},
		{
			"id": "kserve",
			"label": "추론 평면"
		},
		{
			"id": "data-network",
			"label": "데이터와 연결"
		},
		{
			"id": "migration",
			"label": "전환"
		},
		{
			"id": "wrapup",
			"label": "마무리"
		}
	],
	"map": [
		{
			"label": "0~1장",
			"href": "/gpu-platform/00-decision/",
			"title": "큰 그림과 자원 지도",
			"tone": "key",
			"desc": "추론 요청과 제어 흐름 · Spark·A100·B300을 서로 다른 resource island로 보는 법",
			"note": "각 제품이 어느 층에서 무슨 문제를 푸는가"
		},
		{
			"label": "2장",
			"href": "/gpu-platform/02-gpu-foundation/",
			"title": "GPU Operator",
			"tone": "warn",
			"desc": "driver·Container Toolkit·device plugin·GFD·MIG·DCGM이 이어지는 과정",
			"note": "GPU가 어떻게 Pod가 요청할 수 있는 자원이 되는가"
		},
		{
			"label": "3장",
			"href": "/gpu-platform/03-kserve/",
			"title": "KServe",
			"tone": "zone",
			"desc": "InferenceService·ServingRuntime·controller·Standard mode와 LLMInferenceService",
			"note": "한 줄의 선언이 어떻게 실행 중인 모델 서버가 되는가"
		},
		{
			"label": "4~5장",
			"href": "/gpu-platform/04-serving/",
			"title": "요청과 운영",
			"tone": "ok",
			"desc": "LiteLLM부터 model Pod까지 · streaming·SLO·용량·timeout·rollout",
			"note": "실제 요청이 어디를 지나고, 느릴 때 어디부터 보는가"
		},
		{
			"label": "6장",
			"href": "/gpu-platform/06-data-network/",
			"title": "데이터와 연결",
			"tone": "bad",
			"desc": "model artifact·local cache · Gateway·RDMA · 요청과 GPU 관측 연결",
			"note": "빠른 GPU를 다운로드와 network가 굶기지 않게 하는 법"
		},
		{
			"label": "7장",
			"href": "/gpu-platform/07-migration/",
			"title": "전환",
			"tone": "warn",
			"desc": "Spark PoC → B300 greenfield → A100 한 대씩 · traffic과 node rollback",
			"note": "현재 inference endpoint를 잃지 않고 어떻게 옮기는가"
		},
		{
			"label": "8장",
			"href": "/gpu-platform/08-wrapup/",
			"title": "운영 카드",
			"tone": "mute",
			"desc": "전체 지도 · 구성요소 선택표 · 도입 체크리스트 · 장애 확인 순서"
		}
	]
};
