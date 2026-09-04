// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 1250,
	"catalogOrder": 1450,
	"label": "MLflow",
	"title": "MLflow",
	"icon": "notes",
	"aliases": [
		"실험 추적",
		"Experiment Tracking",
		"MLOps",
		"Model Registry"
	],
	"description": "백테스트와 walk-forward 연구가 남긴 숫자를 실험 단위로 기록하고, 어떤 조건이 왜 나았는지 다시 찾을 수 있게 만든다.",
	"category": "ai",
	"tags": [
		"data"
	],
	"termIntro": "required",
	"groups": [
		{
			"id": "position",
			"label": "시작"
		},
		{
			"id": "logging",
			"label": "기록"
		},
		{
			"id": "compare",
			"label": "비교"
		},
		{
			"id": "model",
			"label": "모델"
		},
		{
			"id": "operations",
			"label": "운영"
		},
		{
			"id": "wrapup",
			"label": "마무리"
		}
	],
	"map": [
		{
			"label": "0~1장",
			"href": "/mlflow/00-position/",
			"title": "자리와 데이터 모델",
			"tone": "key",
			"desc": "폴더 산출물의 한계 · experiment · run · param · metric · tag · artifact",
			"note": "연구 결과를 어떤 단위로 잘라야 나중에 다시 찾을 수 있는가"
		},
		{
			"label": "2~4장",
			"href": "/mlflow/02-storage/",
			"title": "기록",
			"tone": "zone",
			"desc": "tracking URI와 두 저장소 · 로깅 API와 값 규칙 · artifact 설계",
			"note": "무엇을 param으로 두고 무엇을 metric·artifact로 남길 것인가"
		},
		{
			"label": "5~7장",
			"href": "/mlflow/05-ui/",
			"title": "비교",
			"tone": "ok",
			"desc": "UI로 런 비교 · search_runs 필터 · Optuna trial을 parent/child로",
			"note": "런이 수백 개로 늘어도 좋은 조건을 골라낼 수 있는가"
		},
		{
			"label": "8~9장",
			"href": "/mlflow/08-models/",
			"title": "모델",
			"tone": "warn",
			"desc": "MLflow Model 형식 · signature · autolog의 함정 · Model Registry alias",
			"note": "연구가 고른 모델을 실거래가 이름으로 집어 오게 만들려면"
		},
		{
			"label": "10~11장",
			"href": "/mlflow/10-reproducibility/",
			"title": "운영",
			"tone": "bad",
			"desc": "git commit·dataset digest·seed · DB와 artifact 관리 · 서버 전환",
			"note": "6개월 뒤 이 런을 그대로 다시 만들 수 있는가"
		},
		{
			"label": "12~13장",
			"href": "/mlflow/12-glossary/",
			"title": "마무리",
			"tone": "mute",
			"desc": "용어 사전 · 지금 레포에 적용할 순서"
		}
	]
};
