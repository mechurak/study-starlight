// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 200,
	"catalogOrder": 200,
	"label": "실습 환경",
	"title": "실습 환경",
	"icon": "setting",
	"aliases": [
		"Lab environment",
		"로컬 실습",
		"개발 환경 준비",
		"kind 설치",
		"Helm 설치"
	],
	"description": "여러 덱에서 다시 쓰는 kind·kubectl·Helm 환경 준비와 정리 — 운영체제별 설치부터 cleanup까지.",
	"category": "infra",
	"tags": [
		"k8s",
		"hands-on"
	],
	"termIntro": "required",
	"groups": [
		{
			"id": "kind",
			"label": "Kubernetes"
		}
	],
	"map": [
		{
			"label": "1장",
			"href": "/lab-environment/01-kind/",
			"title": "kind 실습 환경",
			"tone": "key",
			"desc": "Docker · Colima(macOS) · kubectl 자동완성 · kind 생성 · 중단 · 삭제",
			"note": "운영체제별 차이와 공통 kind 사용법을 한 흐름에서 어떻게 준비하나"
		},
		{
			"label": "2장",
			"href": "/lab-environment/02-helm/",
			"title": "Helm CLI 준비",
			"tone": "warn",
			"desc": "운영체제별 공식 설치 페이지 · version · context 연결",
			"note": "여러 Kubernetes 실습이 공유하는 chart client를 어떻게 준비하나"
		}
	]
};
