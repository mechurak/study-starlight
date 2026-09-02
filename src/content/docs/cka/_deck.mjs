// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 0,
	"catalogOrder": 0,
	"label": "CKA",
	"title": "CKA — 관리자 시험",
	"icon": "open-book",
	"aliases": [
		"Certified Kubernetes Administrator",
		"쿠버네티스 관리자 시험"
	],
	"description": "커리큘럼 5개 도메인을 개념 → 명령 → 함정 순서로 관통하는 시험 대비 정리.",
	"category": "infra",
	"tags": [
		"k8s",
		"exam"
	],
	"termIntro": "legacy",
	"groups": [
		{
			"id": "intro",
			"label": "시험 소개"
		},
		{
			"id": "architecture",
			"label": "기초"
		},
		{
			"id": "pods",
			"label": "Workloads & Scheduling (15%)"
		},
		{
			"id": "services",
			"label": "Services & Networking (20%)"
		},
		{
			"id": "storage",
			"label": "Storage (10%)"
		},
		{
			"id": "rbac",
			"label": "Cluster Architecture (25%)"
		},
		{
			"id": "troubleshooting",
			"label": "Troubleshooting (30%)"
		},
		{
			"id": "exam-strategy",
			"label": "시험 대비"
		}
	],
	"map": [
		{
			"label": "0~1장",
			"href": "/cka/00-intro/",
			"title": "시험 소개",
			"tone": "mute",
			"desc": "이 덱을 읽는 법 · 시험 자체의 해부 (환경 · 채점 · 시간 배분)"
		},
		{
			"label": "2~3장",
			"href": "/cka/02-architecture/",
			"title": "기초",
			"tone": "key",
			"desc": "클러스터 아키텍처 · kubectl"
		},
		{
			"label": "4~8장",
			"href": "/cka/04-pods/",
			"title": "Workloads and Scheduling",
			"badge": "15%",
			"tone": "warn",
			"desc": "Pod · 워크로드 · 설정 · 스케줄링 · 오토스케일링"
		},
		{
			"label": "9~12장",
			"href": "/cka/09-services/",
			"title": "Services and Networking",
			"badge": "20%",
			"tone": "warn",
			"desc": "Service · DNS · Ingress/Gateway · NetworkPolicy"
		},
		{
			"label": "13장",
			"href": "/cka/13-storage/",
			"title": "Storage",
			"badge": "10%",
			"tone": "mute",
			"desc": "PV · PVC · StorageClass · 볼륨"
		},
		{
			"label": "14~17장",
			"href": "/cka/14-rbac/",
			"title": "Cluster Architecture",
			"badge": "25%",
			"tone": "bad",
			"desc": "RBAC · 클러스터 라이프사이클 · Helm/Kustomize · 확장"
		},
		{
			"label": "18장",
			"href": "/cka/18-troubleshooting/",
			"title": "Troubleshooting",
			"badge": "30%",
			"tone": "bad",
			"desc": "증상에서 원인으로 — 앞의 전부가 여기서 쓰인다"
		},
		{
			"label": "19~20장",
			"href": "/cka/19-exam-strategy/",
			"title": "시험 대비",
			"tone": "mute",
			"desc": "시험 전략 · 치트시트 · 마무리"
		}
	]
};
