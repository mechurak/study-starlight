// 덱 단위 metadata와 구조. 페이지 소속·순서는 sidebar 배열에 있다.
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
		"Helm 설치",
		"Docker Compose 준비",
		"로컬 CA 등록"
	],
	"description": "여러 덱에서 다시 쓰는 kind·kubectl·Helm·Docker Compose 환경 준비와 정리 — 운영체제별 설치부터 브라우저 확인·cleanup까지.",
	"category": "infra",
	"tags": [
		"k8s"
	],
	"termIntro": "required",
	"sidebar": [
		{
			"label": "Kubernetes",
			"pages": [
				"01-kind",
				"02-helm"
			]
		},
		{
			"label": "Docker Compose",
			"pages": [
				"docker-compose",
				"local-https-browser"
			]
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
		},
		{
			"label": "Compose",
			"href": "/lab-environment/docker-compose/",
			"title": "Docker Compose 실습 환경",
			"tone": "ok",
			"desc": "Compose·buildx plugin 확인 · 회사 프록시의 pull/build 구분 · build 전용 CA trust",
			"note": "kind 없는 실습이 공통으로 요구하는 runtime 준비는 무엇인가"
		},
		{
			"label": "브라우저",
			"href": "/lab-environment/local-https-browser/",
			"title": "로컬 HTTPS 실습을 브라우저로 보기",
			"tone": "key",
			"desc": "hosts 항목 · 브라우저 프록시 예외 · 로컬 CA 등록과 제거",
			"note": "실습 화면이 안 열릴 때 이름·프록시·인증서 중 어디를 보나"
		}
	]
};
