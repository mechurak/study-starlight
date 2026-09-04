// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 100,
	"catalogOrder": 100,
	"label": "CKA 실습",
	"title": "CKA 실습",
	"icon": "pencil",
	"aliases": [
		"KodeKloud CKA Practice Test",
		"CKA 연습 문제",
		"CKA labs",
		"Kubernetes 관리자 실습"
	],
	"description": "KodeKloud 랩을 뼈대로 여러 실습의 실패 진단·완료 검증·복구 패턴을 모은 CKA 연습 덱.",
	"category": "infra",
	"tags": [
		"k8s",
		"exam",
		"hands-on"
	],
	"termIntro": "not-required",
	"groups": [
		{
			"id": "basics",
			"label": "워크로드와 스케줄링"
		},
		{
			"id": "services-dns",
			"label": "네트워킹"
		},
		{
			"id": "storage",
			"label": "스토리지와 보안"
		},
		{
			"id": "cluster-lifecycle",
			"label": "클러스터 운영"
		}
	],
	"map": [
		{
			"label": "1장",
			"title": "기본 조작",
			"href": "/cka-udemy/01-basics/",
			"desc": "Pod · 네임스페이스 · 명령형 커맨드 · JSONPath",
			"items": [
				[
					"cka 2장",
					"/cka/02-architecture/"
				],
				[
					"cka 3장",
					"/cka/03-kubectl/"
				],
				[
					"cka 4장",
					"/cka/04-pods/"
				]
			],
			"tone": "key"
		},
		{
			"label": "2장",
			"title": "워크로드",
			"href": "/cka-udemy/02-workloads/",
			"desc": "ReplicaSet · Deployment rollout/rollback · Job 완료·실패",
			"items": [
				[
					"cka 5장",
					"/cka/05-workloads/"
				]
			],
			"tone": "key"
		},
		{
			"label": "3장",
			"title": "Pod 설정",
			"href": "/cka-udemy/03-pod-config/",
			"desc": "command/args · ConfigMap 반영 · Secret · securityContext · 멀티 컨테이너 · init",
			"items": [
				[
					"cka 4장",
					"/cka/04-pods/"
				],
				[
					"cka 6장",
					"/cka/06-config/"
				]
			],
			"tone": "ok"
		},
		{
			"label": "4장",
			"title": "스케줄링",
			"href": "/cka-udemy/04-scheduling/",
			"desc": "수동 배치 · 라벨/taint · affinity · quota · DaemonSet 업데이트 · 스태틱 Pod",
			"items": [
				[
					"cka 7장",
					"/cka/07-scheduling/"
				]
			],
			"tone": "ok"
		},
		{
			"label": "5장",
			"title": "Service와 DNS",
			"href": "/cka-udemy/05-services-dns/",
			"desc": "EndpointSlice · Service · CoreDNS · Calico CNI 설치 · 계층별 검증",
			"items": [
				[
					"cka 9장",
					"/cka/09-services/"
				],
				[
					"cka 10장",
					"/cka/10-dns/"
				]
			],
			"tone": "warn"
		},
		{
			"label": "6장",
			"title": "Ingress와 NetworkPolicy",
			"href": "/cka-udemy/06-ingress-netpol/",
			"desc": "Ingress · Gateway API · 외부 요청 검증 · NetworkPolicy",
			"items": [
				[
					"cka 11장",
					"/cka/11-ingress-gateway/"
				],
				[
					"cka 12장",
					"/cka/12-networkpolicy/"
				]
			],
			"tone": "warn"
		},
		{
			"label": "7장",
			"title": "스토리지",
			"href": "/cka-udemy/07-storage/",
			"desc": "PV/PVC · StorageClass · 정적/동적 프로비저닝 · 스토리지 quota",
			"items": [
				[
					"cka 13장",
					"/cka/13-storage/"
				]
			],
			"tone": "zone"
		},
		{
			"label": "8장",
			"title": "인증서 · kubeconfig · RBAC",
			"href": "/cka-udemy/08-security/",
			"desc": "TLS · 인증서 · kubeconfig/API · RBAC · ServiceAccount · admission · 저장 확인",
			"items": [
				[
					"cka 14장",
					"/cka/14-rbac/"
				]
			],
			"tone": "zone"
		},
		{
			"label": "9장",
			"title": "클러스터 라이프사이클",
			"href": "/cka-udemy/09-cluster-lifecycle/",
			"desc": "kubeadm 설치 검증 · drain · 업그레이드 · etcd 백업/복구",
			"items": [
				[
					"cka 15장",
					"/cka/15-cluster-lifecycle/"
				]
			],
			"tone": "bad"
		},
		{
			"label": "10장",
			"title": "모니터링과 트러블슈팅",
			"href": "/cka-udemy/10-troubleshooting/",
			"desc": "metrics-server · 증상별 로그 진입점 · 네트워크 트러블슈팅",
			"items": [
				[
					"cka 8장",
					"/cka/08-autoscaling/"
				],
				[
					"cka 18장",
					"/cka/18-troubleshooting/"
				]
			],
			"tone": "bad"
		}
	]
};
