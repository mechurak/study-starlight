// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 1600,
	"catalogOrder": 1500,
	"label": "Databricks",
	"title": "Databricks on AWS",
	"icon": "seti:db",
	"aliases": [
		"AWS Databricks",
		"데이터브릭스",
		"Lakehouse",
		"CX망 Databricks",
		"레이크하우스"
	],
	"description": "사내 데이터를 AWS lakehouse로 가져온다 — CX/DX, VPC, S3, Unity Catalog와 운영 경계.",
	"category": "ai",
	"tags": [
		"data",
		"cloud"
	],
	"termIntro": "required",
	"groups": [
		{
			"id": "position",
			"label": "시작"
		},
		{
			"id": "cx-vpc",
			"label": "네트워크와 데이터"
		},
		{
			"id": "consumption",
			"label": "소비와 통제"
		},
		{
			"id": "adoption",
			"label": "도입"
		}
	],
	"map": [
		{
			"label": "0장",
			"href": "/databricks/00-position/",
			"title": "자리를 먼저 잡기",
			"tone": "key",
			"desc": "AWS 서비스와 Databricks가 각각 맡는 일 · lakehouse의 큰 그림",
			"note": "데이터를 어디에 두고 무엇을 Databricks라고 부르는가"
		},
		{
			"label": "1장",
			"href": "/databricks/01-architecture/",
			"title": "세 plane과 두 compute",
			"tone": "zone",
			"desc": "control plane · classic compute · serverless compute · S3의 경계",
			"note": "우리 AWS 계정에서 실제로 도는 것은 무엇인가"
		},
		{
			"label": "2장",
			"href": "/databricks/02-cx-vpc/",
			"title": "CX/DX와 VPC",
			"tone": "warn",
			"desc": "사내망 → DX → TGW → VPC · user path와 data path · PrivateLink",
			"note": "“우리 VPC에 있으면 되는가”에 정확히 답한다"
		},
		{
			"label": "3~4장",
			"href": "/databricks/03-data-foundation/",
			"title": "데이터를 담고 흐르게 하기",
			"tone": "ok",
			"desc": "S3 · Delta · Unity Catalog · bronze/silver/gold · batch/stream",
			"note": "원본에서 분석 가능한 table까지 어떻게 이동하는가"
		},
		{
			"label": "5장",
			"href": "/databricks/05-consumption/",
			"title": "분석과 AI",
			"tone": "key",
			"desc": "SQL · notebook · BI · MLflow · model serving의 소비 경로",
			"note": "정제된 데이터를 누가 어떤 도구로 쓰는가"
		},
		{
			"label": "6~7장",
			"href": "/databricks/06-security/",
			"title": "통제하고 운영하기",
			"tone": "bad",
			"desc": "identity · catalog 권한 · 암호화 · 감사 · compute 정책 · 비용",
			"note": "연결된 플랫폼을 안전하고 감당 가능하게 유지하는가"
		},
		{
			"label": "8장",
			"href": "/databricks/08-adoption/",
			"title": "PoC에서 운영으로",
			"tone": "mute",
			"desc": "결정 질문 · 단계별 도입 · 합격 기준 · 최종 체크리스트"
		}
	]
};
