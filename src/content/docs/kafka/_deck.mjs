// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 900,
	"catalogOrder": 700,
	"label": "Kafka",
	"title": "Kafka",
	"icon": "random",
	"aliases": [
		"Apache Kafka",
		"이벤트 스트리밍"
	],
	"description": "서비스 사이의 결합을 시간 축에서 끊는 로그 — 도입하는 사람 관점의 모델과 운영.",
	"category": "infra",
	"tags": [
		"data",
		"onprem"
	],
	"termIntro": "required",
	"groups": [
		{
			"id": "intro",
			"label": "시작"
		},
		{
			"id": "log",
			"label": "핵심 모델"
		},
		{
			"id": "producer",
			"label": "읽고 쓰기"
		},
		{
			"id": "topic-design",
			"label": "설계"
		},
		{
			"id": "deploy",
			"label": "온프렘 배포와 운영"
		},
		{
			"id": "glossary",
			"label": "마무리"
		}
	],
	"map": [
		{
			"label": "0~1장",
			"href": "/kafka/00-intro/",
			"title": "왜 Kafka인가",
			"tone": "key",
			"desc": "범위 · 목적과 자리",
			"note": "서비스끼리 직접 부르면 되는데 왜 가운데 로그를 놓는가"
		},
		{
			"label": "2~3장",
			"href": "/kafka/02-log/",
			"title": "핵심 모델",
			"tone": "warn",
			"desc": "토픽 · 파티션 · 오프셋 · 복제",
			"note": "데이터는 어떤 모양으로 쌓이고, 브로커가 죽으면 어떻게 되는가"
		},
		{
			"label": "4~6장",
			"href": "/kafka/04-producer/",
			"title": "읽고 쓰기",
			"tone": "ok",
			"desc": "프로듀서 · 컨슈머 · 전달 보장",
			"note": "유실·중복·순서는 각각 어느 나사로 조이는가"
		},
		{
			"label": "7~8장",
			"href": "/kafka/07-topic-design/",
			"title": "설계",
			"tone": "key",
			"desc": "토픽 설계 · 생태계",
			"note": "파티션 수·보존은 어떻게 정하고, Connect·스키마는 언제 얹는가"
		},
		{
			"label": "9~11장",
			"href": "/kafka/09-deploy/",
			"title": "온프렘 쿠버네티스",
			"tone": "ok",
			"desc": "배포(Strimzi) · 운영 · 트러블슈팅",
			"note": "온프렘 k8s에서 Kafka 자체를 어떻게 돌리는가"
		},
		{
			"label": "12~13장",
			"href": "/kafka/12-glossary/",
			"title": "마무리",
			"tone": "mute",
			"desc": "용어 사전 · 마무리"
		}
	]
};
