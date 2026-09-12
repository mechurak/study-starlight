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
			"id": "architecture",
			"label": "기초"
		},
		{
			"id": "pods",
			"label": "Workloads와 스케줄링"
		},
		{
			"id": "basics",
			"label": "Workloads와 스케줄링 (개편 전)"
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
		},
		{
			"id": "rbac",
			"label": "Cluster Architecture"
		}
	],
	"map": [
		{
			"label": "1장",
			"title": "kubectl 기본 조작",
			"href": "/cka-udemy/01-basics/",
			"desc": "namespace · 명령형 생성기 · 도움말 · Vim",
			"items": [
				[
					"cka 3장",
					"/cka/03-kubectl/"
				]
			],
			"tone": "key"
		},
		{
			"label": "2장",
			"title": "JSONPath 추출과 정렬",
			"href": "/cka-udemy/jsonpath/",
			"desc": "필드 추출 · 조건 필터 · 정렬 · custom-columns · 파일 제출",
			"items": [
				[
					"cka 3장",
					"/cka/03-kubectl/"
				]
			],
			"tone": "key"
		},
		{
			"label": "3장",
			"title": "Pod 생성과 상태 확인",
			"href": "/cka-udemy/pods/",
			"desc": "Pod 생성 · 노드 · 컨테이너 상태 · Events · Ready",
			"items": [
				[
					"cka 4장",
					"/cka/04-pods/"
				]
			],
			"tone": "key"
		},
		{
			"label": "4장",
			"title": "Deployment rollout과 rollback",
			"href": "/cka-udemy/02-workloads/",
			"desc": "ReplicaSet · Deployment 생성 · rollout · 실패 진단 · rollback",
			"items": [
				[
					"cka 5장",
					"/cka/05-workloads/"
				]
			],
			"tone": "key"
		},
		{
			"label": "5장",
			"title": "Job 완료와 실패",
			"href": "/cka-udemy/jobs/",
			"desc": "terminal condition · 소유 Pod · 로그 · 실패 후 재실행",
			"items": [
				[
					"cka 5장",
					"/cka/05-workloads/"
				]
			],
			"tone": "key"
		},
		{
			"label": "6장",
			"title": "command와 args 수정",
			"href": "/cka-udemy/03-pod-config/",
			"desc": "Pod 소유자 · command/args · sh -c · 실행 결과",
			"items": [
				[
					"cka 4장",
					"/cka/04-pods/"
				]
			],
			"tone": "ok"
		},
		{
			"label": "7장",
			"title": "ConfigMap과 Secret 주입",
			"href": "/cka-udemy/configmap-secret/",
			"desc": "env · envFrom · volume · 변경 반영 · 읽기 전용 Secret",
			"items": [
				[
					"cka 6장",
					"/cka/06-config/"
				]
			],
			"tone": "ok"
		},
		{
			"label": "8장",
			"title": "init과 sidecar 구성",
			"href": "/cka-udemy/init-sidecar/",
			"desc": "공유 volume · Downward API · 네이티브 sidecar · init 복구",
			"items": [
				[
					"cka 4장",
					"/cka/04-pods/"
				]
			],
			"tone": "ok"
		},
		{
			"label": "9장",
			"title": "securityContext 실행 권한",
			"href": "/cka-udemy/security-context/",
			"desc": "runAsUser 우선순위 · 컨테이너 capability · 실행 검증",
			"items": [
				[
					"cka 4장",
					"/cka/04-pods/"
				]
			],
			"tone": "ok"
		},
		{
			"label": "개편 전 4장",
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
			"desc": "metrics-server · 로그 진입점 · control plane 명령·경로·마운트 복구 · 네트워크 트러블슈팅",
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
		},
		{
			"label": "11장",
			"title": "Helm",
			"href": "/cka-udemy/11-helm/",
			"desc": "설치 확인 · repo/search · chart 버전 upgrade · history/rollback · 이미지 함정",
			"items": [
				[
					"cka 16장",
					"/cka/16-helm-kustomize/"
				]
			],
			"tone": "bad"
		},
		{
			"label": "31~34장",
			"title": "Kustomize",
			"href": "/cka-udemy/12-kustomize/",
			"desc": "환경별 적용·범위별 변환·특정 대상 patch와 선택 기능 보충",
			"items": [
				[
					"범위별 변환",
					"/cka-udemy/kustomize-transformers/"
				],
				[
					"특정 대상 수정·삭제",
					"/cka-udemy/kustomize-patches/"
				],
				[
					"선택 기능 (학습 보충)",
					"/cka-udemy/kustomize-components/"
				],
				[
					"cka 16장",
					"/cka/16-helm-kustomize/"
				]
			],
			"tone": "bad"
		}
	]
};
