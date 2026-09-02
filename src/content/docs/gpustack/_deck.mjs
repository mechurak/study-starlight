// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 1400,
	"catalogOrder": 800,
	"label": "GPUStack",
	"title": "GPUStack",
	"icon": "server",
	"aliases": [
		"GPU 클러스터 관리",
		"DGX Spark 모델 서빙"
	],
	"description": "DGX Spark 10대를 모델 서빙 풀로 묶는다 — LiteLLM 경계, vLLM, FastAPI, 2대 pair와 운영.",
	"category": "ai",
	"tags": [
		"gpu",
		"llm",
		"onprem"
	],
	"termIntro": "required",
	"groups": [
		{
			"id": "position",
			"label": "시작"
		},
		{
			"id": "architecture",
			"label": "관리 평면"
		},
		{
			"id": "vllm-embedding",
			"label": "워크로드"
		},
		{
			"id": "pairs-routing",
			"label": "배치와 라우팅"
		},
		{
			"id": "operations",
			"label": "운영과 선택"
		},
		{
			"id": "wrapup",
			"label": "마무리"
		}
	],
	"map": [
		{
			"label": "0장",
			"href": "/gpustack/00-position/",
			"title": "자리 정하기",
			"tone": "key",
			"desc": "GPUStack이 푸는 문제 · 하지 않는 일 · 이 환경에서의 결론",
			"note": "왜 Kubernetes보다 먼저 GPUStack을 시험하는가"
		},
		{
			"label": "1~2장",
			"href": "/gpustack/01-architecture/",
			"title": "관리 평면",
			"tone": "zone",
			"desc": "LiteLLM → GPUStack → worker 요청 경로 · 서버와 worker 설치",
			"note": "누가 정책을 맡고 누가 컨테이너를 살리는가"
		},
		{
			"label": "3~4장",
			"href": "/gpustack/03-vllm-embedding/",
			"title": "워크로드",
			"tone": "ok",
			"desc": "vLLM LLM·embedding · FastAPI classification·embedding custom backend",
			"note": "OpenAI 호환과 일반 API를 어디서 갈라야 하는가"
		},
		{
			"label": "5장",
			"href": "/gpustack/05-pairs-routing/",
			"title": "배치와 라우팅",
			"tone": "warn",
			"desc": "worker label · replica · 2대 pair · route weight와 fallback",
			"note": "독립 노드와 pair를 같은 풀에서 어떻게 섞는가"
		},
		{
			"label": "6~7장",
			"href": "/gpustack/06-operations/",
			"title": "운영과 선택",
			"tone": "bad",
			"desc": "메모리·모델 파일·업그레이드·장애 루틴 · KServe로 넘어갈 경계",
			"note": "PoC를 무엇으로 합격시키고 언제 다른 플랫폼을 택하는가"
		},
		{
			"label": "8장",
			"href": "/gpustack/08-wrapup/",
			"title": "마무리",
			"tone": "mute",
			"desc": "전체 지도 · 배포 패턴 · 도입 체크리스트 · 장애 대응 카드"
		}
	]
};
