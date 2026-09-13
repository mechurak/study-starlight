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
			"id": "services",
			"label": "네트워킹"
		},
		{
			"id": "storage",
			"label": "스토리지"
		},
		{
			"id": "rbac",
			"label": "Cluster Architecture"
		},
		{
			"id": "troubleshooting",
			"label": "Troubleshooting"
		},
		{
			"id": "exam-strategy",
			"label": "시험 대비"
		}
	],
	"map": [
		{
			"label": "기초",
			"title": "kubectl 기본 조작",
			"href": "/cka-udemy/basics/",
			"desc": "namespace · 명령형 생성기 · 도움말 · Vim",
			"items": [
				[
					"CKA kubectl — 손 속도가 점수다",
					"/cka/kubectl/"
				]
			],
			"tone": "key"
		},
		{
			"label": "기초",
			"title": "JSONPath 추출과 정렬",
			"href": "/cka-udemy/jsonpath/",
			"desc": "필드 추출 · 조건 필터 · 정렬 · custom-columns · 파일 제출",
			"items": [
				[
					"CKA kubectl — 손 속도가 점수다",
					"/cka/kubectl/"
				]
			],
			"tone": "key"
		},
		{
			"label": "Workloads와 스케줄링",
			"title": "Pod 생성과 상태 확인",
			"href": "/cka-udemy/pods/",
			"desc": "Pod 생성 · 노드 · 컨테이너 상태 · Events · Ready",
			"items": [
				[
					"CKA Pod — 배포의 최소 단위",
					"/cka/pods/"
				]
			],
			"tone": "key"
		},
		{
			"label": "Workloads와 스케줄링",
			"title": "Deployment rollout과 rollback",
			"href": "/cka-udemy/workloads/",
			"desc": "ReplicaSet · Deployment 생성 · rollout · 실패 진단 · rollback",
			"items": [
				[
					"CKA 워크로드 컨트롤러",
					"/cka/workloads/"
				]
			],
			"tone": "key"
		},
		{
			"label": "Workloads와 스케줄링",
			"title": "Job 완료와 실패",
			"href": "/cka-udemy/jobs/",
			"desc": "terminal condition · 소유 Pod · 로그 · 실패 후 재실행",
			"items": [
				[
					"CKA 워크로드 컨트롤러",
					"/cka/workloads/"
				]
			],
			"tone": "key"
		},
		{
			"label": "Workloads와 스케줄링",
			"title": "command와 args 수정",
			"href": "/cka-udemy/pod-config/",
			"desc": "Pod 소유자 · command/args · sh -c · 실행 결과",
			"items": [
				[
					"CKA Pod — 배포의 최소 단위",
					"/cka/pods/"
				]
			],
			"tone": "ok"
		},
		{
			"label": "Workloads와 스케줄링",
			"title": "ConfigMap과 Secret 주입",
			"href": "/cka-udemy/configmap-secret/",
			"desc": "env · envFrom · volume · 변경 반영 · 읽기 전용 Secret",
			"items": [
				[
					"CKA 설정과 리소스",
					"/cka/config/"
				]
			],
			"tone": "ok"
		},
		{
			"label": "Workloads와 스케줄링",
			"title": "init과 sidecar 구성",
			"href": "/cka-udemy/init-sidecar/",
			"desc": "공유 volume · Downward API · 네이티브 sidecar · init 복구",
			"items": [
				[
					"CKA Pod — 배포의 최소 단위",
					"/cka/pods/"
				]
			],
			"tone": "ok"
		},
		{
			"label": "Workloads와 스케줄링",
			"title": "securityContext 실행 권한",
			"href": "/cka-udemy/security-context/",
			"desc": "runAsUser 우선순위 · 컨테이너 capability · 실행 검증",
			"items": [
				[
					"CKA Pod — 배포의 최소 단위",
					"/cka/pods/"
				]
			],
			"tone": "ok"
		},
		{
			"label": "Workloads와 스케줄링",
			"title": "Pod 배치 조건",
			"href": "/cka-udemy/scheduling/",
			"desc": "nodeName · selector · taint/toleration · nodeAffinity · Pending Events",
			"items": [
				[
					"CKA 스케줄링",
					"/cka/scheduling/"
				]
			],
			"tone": "ok"
		},
		{
			"label": "Workloads와 스케줄링",
			"title": "리소스 제한과 quota",
			"href": "/cka-udemy/resource-limits/",
			"desc": "requests/limits · OOMKilled · LimitRange · ResourceQuota",
			"items": [
				[
					"CKA 설정과 리소스",
					"/cka/config/"
				]
			],
			"tone": "ok"
		},
		{
			"label": "Workloads와 스케줄링",
			"title": "DaemonSet과 static Pod",
			"href": "/cka-udemy/daemonset-static-pod/",
			"desc": "노드별 Pod · updateStrategy · rollback · staticPodPath · mirror Pod",
			"items": [
				[
					"CKA 워크로드 컨트롤러",
					"/cka/workloads/"
				],
				[
					"CKA Pod — 배포의 최소 단위",
					"/cka/pods/"
				]
			],
			"tone": "ok"
		},
		{
			"label": "Workloads와 스케줄링",
			"title": "HPA 설정과 검증",
			"href": "/cka-udemy/autoscaling/",
			"desc": "metrics API · resource requests · CPU/memory Utilization · replica 판정",
			"items": [
				[
					"CKA 오토스케일링",
					"/cka/autoscaling/"
				]
			],
			"tone": "ok"
		},
		{
			"label": "Workloads와 스케줄링",
			"title": "VPA CRD 읽기",
			"href": "/cka-udemy/vpa/",
			"desc": "별도 CRD · targetRef · Recreate · recommendation · RequestsOnly",
			"items": [
				[
					"CKA 오토스케일링",
					"/cka/autoscaling/"
				],
				[
					"CKA 확장 인터페이스 — CRI·CNI·CSI",
					"/cka/extensions/"
				]
			],
			"tone": "ok"
		},
		{
			"label": "네트워킹",
			"title": "Service와 EndpointSlice",
			"href": "/cka-udemy/services-dns/",
			"desc": "selector · port/targetPort · EndpointSlice · ClusterIP · NodePort",
			"items": [
				[
					"CKA Service",
					"/cka/services/"
				]
			],
			"tone": "warn"
		},
		{
			"label": "네트워킹",
			"title": "DNS와 CoreDNS",
			"href": "/cka-udemy/dns/",
			"desc": "kube-dns · Corefile · FQDN · namespace · nslookup · 실제 연결",
			"items": [
				[
					"CKA 클러스터 DNS",
					"/cka/dns/"
				]
			],
			"tone": "warn"
		},
		{
			"label": "네트워킹",
			"title": "네트워크 환경과 CNI 확인",
			"href": "/cka-udemy/network-environment/",
			"desc": "인터페이스 · 세 IP 대역 · 런타임 socket · CNI 경로 · Calico 설치",
			"items": [
				[
					"CKA kubeadm — 클러스터 설치와 노드 조인",
					"/cka/cluster-setup/"
				],
				[
					"CKA 확장 인터페이스 — CRI·CNI·CSI",
					"/cka/extensions/"
				]
			],
			"tone": "warn"
		},
		{
			"label": "네트워킹",
			"title": "Ingress와 TLS",
			"href": "/cka-udemy/ingress-netpol/",
			"desc": "IngressClass · host/path · controller · TLS · 외부 HTTP/HTTPS",
			"items": [
				[
					"CKA Ingress와 Gateway API",
					"/cka/ingress-gateway/"
				]
			],
			"tone": "warn"
		},
		{
			"label": "네트워킹",
			"title": "Gateway와 HTTPRoute",
			"href": "/cka-udemy/gateway/",
			"desc": "CRD와 구현체 · listener · parentRefs · attachment 조건 · 실제 요청",
			"items": [
				[
					"CKA Ingress와 Gateway API",
					"/cka/ingress-gateway/"
				]
			],
			"tone": "warn"
		},
		{
			"label": "네트워킹",
			"title": "NetworkPolicy 허용과 차단",
			"href": "/cka-udemy/network-policy/",
			"desc": "pod/namespace selector · ingress/egress · DNS · 허용/차단 검증",
			"items": [
				[
					"CKA NetworkPolicy와 CNI",
					"/cka/networkpolicy/"
				]
			],
			"tone": "warn"
		},
		{
			"label": "스토리지",
			"title": "볼륨과 정적 PV/PVC",
			"href": "/cka-udemy/storage/",
			"desc": "hostPath · PV/PVC 바인딩 · reclaimPolicy · 실제 mount·읽기/쓰기",
			"items": [
				[
					"CKA 스토리지",
					"/cka/storage/"
				]
			],
			"tone": "zone"
		},
		{
			"label": "스토리지",
			"title": "StorageClass와 동적 프로비저닝",
			"href": "/cka-udemy/storage-class/",
			"desc": "provisioner · WaitForFirstConsumer · 기본 class · 동적 PV · quota",
			"items": [
				[
					"CKA 스토리지",
					"/cka/storage/"
				]
			],
			"tone": "zone"
		},
		{
			"label": "Cluster Architecture",
			"title": "TLS·CSR·kubeconfig",
			"href": "/cka-udemy/security/",
			"desc": "인증서 역할 · CSR 승인·발급 · kubeconfig · 실제 인증 · API 요청 흐름",
			"items": [
				[
					"CKA API 요청 처리 흐름",
					"/cka/api-access/"
				]
			],
			"tone": "zone"
		},
		{
			"label": "Cluster Architecture",
			"title": "RBAC 권한 부여와 검증",
			"href": "/cka-udemy/rbac/",
			"desc": "Role·ClusterRole · Binding · can-i 허용·거부 · 인증과 인가 구분",
			"items": [
				[
					"CKA API 요청 처리 흐름",
					"/cka/api-access/"
				]
			],
			"tone": "zone"
		},
		{
			"label": "Cluster Architecture",
			"title": "ServiceAccount와 imagePullSecrets",
			"href": "/cka-udemy/service-account/",
			"desc": "Pod 신원 · projected token · 레지스트리 Secret · 실제 image pull",
			"items": [
				[
					"CKA API 요청 처리 흐름",
					"/cka/api-access/"
				]
			],
			"tone": "zone"
		},
		{
			"label": "Cluster Architecture",
			"title": "Admission 요청 검사",
			"href": "/cka-udemy/admission/",
			"desc": "내장 플러그인 · validating/mutating webhook · 거부·변형 검증",
			"items": [
				[
					"CKA API 요청 처리 흐름",
					"/cka/api-access/"
				]
			],
			"tone": "zone"
		},
		{
			"label": "Cluster Architecture",
			"title": "kubeadm 설치와 CNI",
			"href": "/cka-udemy/cluster-lifecycle/",
			"desc": "노드 사전 조건 · init/join · CNI·CoreDNS · Service·NodePort 검증",
			"items": [
				[
					"CKA kubeadm — 클러스터 설치와 노드 조인",
					"/cka/cluster-setup/"
				]
			],
			"tone": "bad"
		},
		{
			"label": "Cluster Architecture",
			"title": "노드 drain과 클러스터 업그레이드",
			"href": "/cka-udemy/cluster-upgrade/",
			"desc": "drain·uncordon · 패키지 버전 · upgrade apply/node · Ready·schedulable",
			"items": [
				[
					"CKA kubeadm — 클러스터 설치와 노드 조인",
					"/cka/cluster-setup/"
				]
			],
			"tone": "bad"
		},
		{
			"label": "Cluster Architecture",
			"title": "etcd 백업과 복구",
			"href": "/cka-udemy/etcd-backup-restore/",
			"desc": "endpoint·인증서 · snapshot status · 새 data-dir · stacked/external 전환",
			"items": [
				[
					"CKA kubeadm — 클러스터 설치와 노드 조인",
					"/cka/cluster-setup/"
				]
			],
			"tone": "bad"
		},
		{
			"label": "Cluster Architecture",
			"title": "Helm release 관리",
			"href": "/cka-udemy/helm/",
			"desc": "repo·search · chart/app 버전 · install/upgrade · history/rollback · 두 층 검증",
			"items": [
				[
					"CKA Helm — 패키지 설치와 릴리스 관리",
					"/cka/helm/"
				]
			],
			"tone": "bad"
		},
		{
			"label": "Cluster Architecture",
			"title": "Kustomize",
			"href": "/cka-udemy/kustomize/",
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
					"CKA Helm — 패키지 설치와 릴리스 관리",
					"/cka/helm/"
				]
			],
			"tone": "bad"
		},
		{
			"label": "Troubleshooting",
			"title": "metrics와 애플리케이션 로그",
			"href": "/cka-udemy/troubleshooting/",
			"desc": "metrics-server · top 단위 · Pod 상태 · Events · 현재/이전 로그",
			"items": [
				[
					"CKA 오토스케일링",
					"/cka/autoscaling/"
				],
				[
					"CKA 트러블슈팅",
					"/cka/troubleshooting/"
				]
			],
			"tone": "bad"
		},
		{
			"label": "Troubleshooting",
			"title": "컨트롤 플레인 복구",
			"href": "/cka-udemy/control-plane-failure/",
			"desc": "Pod 생성·배정 · static Pod 명령·kubeconfig·hostPath · 원래 workload",
			"items": [
				[
					"CKA 트러블슈팅",
					"/cka/troubleshooting/"
				]
			],
			"tone": "bad"
		},
		{
			"label": "Troubleshooting",
			"title": "워커 노드 복구",
			"href": "/cka-udemy/worker-failure/",
			"desc": "kubelet 서비스 · config/kubeconfig · CA · API 서버 주소 · Node Ready",
			"items": [
				[
					"CKA 트러블슈팅",
					"/cka/troubleshooting/"
				]
			],
			"tone": "bad"
		},
		{
			"label": "Troubleshooting",
			"title": "Service와 네트워크 장애",
			"href": "/cka-udemy/network-failure/",
			"desc": "Service·EndpointSlice · CNI 초기화 · kube-proxy 설정 · 실제 앱 요청",
			"items": [
				[
					"CKA Service",
					"/cka/services/"
				],
				[
					"CKA 트러블슈팅",
					"/cka/troubleshooting/"
				]
			],
			"tone": "bad"
		},
		{
			"label": "시험 대비",
			"title": "작업별 명령·문서 검색 색인",
			"href": "/cka-udemy/exam-search/",
			"desc": "작업 → 첫 관찰 명령 → 공식 문서 검색어 → 완료 판정",
			"items": [
				[
					"CKA 시험 전략과 치트시트",
					"/cka/exam-strategy/"
				]
			],
			"tone": "key"
		}
	]
};
