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
			"id": "cluster-lifecycle",
			"label": "클러스터 운영"
		},
		{
			"id": "troubleshooting",
			"label": "Troubleshooting"
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
			"label": "10장",
			"title": "Pod 배치 조건",
			"href": "/cka-udemy/04-scheduling/",
			"desc": "nodeName · selector · taint/toleration · nodeAffinity · Pending Events",
			"items": [
				[
					"cka 7장",
					"/cka/07-scheduling/"
				]
			],
			"tone": "ok"
		},
		{
			"label": "11장",
			"title": "리소스 제한과 quota",
			"href": "/cka-udemy/resource-limits/",
			"desc": "requests/limits · OOMKilled · LimitRange · ResourceQuota",
			"items": [
				[
					"cka 6장",
					"/cka/06-config/"
				]
			],
			"tone": "ok"
		},
		{
			"label": "12장",
			"title": "DaemonSet과 static Pod",
			"href": "/cka-udemy/daemonset-static-pod/",
			"desc": "노드별 Pod · updateStrategy · rollback · staticPodPath · mirror Pod",
			"items": [
				[
					"cka 5장",
					"/cka/05-workloads/"
				],
				[
					"cka 4장",
					"/cka/04-pods/"
				]
			],
			"tone": "ok"
		},
		{
			"label": "13장",
			"title": "HPA 설정과 검증",
			"href": "/cka-udemy/autoscaling/",
			"desc": "metrics API · resource requests · CPU/memory Utilization · replica 판정",
			"items": [
				[
					"cka 8장",
					"/cka/08-autoscaling/"
				]
			],
			"tone": "ok"
		},
		{
			"label": "14장",
			"title": "VPA CRD 읽기",
			"href": "/cka-udemy/vpa/",
			"desc": "별도 CRD · targetRef · Recreate · recommendation · RequestsOnly",
			"items": [
				[
					"cka 8장",
					"/cka/08-autoscaling/"
				],
				[
					"cka 17장",
					"/cka/17-extensions/"
				]
			],
			"tone": "ok"
		},
		{
			"label": "15장",
			"title": "Service와 EndpointSlice",
			"href": "/cka-udemy/05-services-dns/",
			"desc": "selector · port/targetPort · EndpointSlice · ClusterIP · NodePort",
			"items": [
				[
					"cka 9장",
					"/cka/09-services/"
				]
			],
			"tone": "warn"
		},
		{
			"label": "16장",
			"title": "DNS와 CoreDNS",
			"href": "/cka-udemy/dns/",
			"desc": "kube-dns · Corefile · FQDN · namespace · nslookup · 실제 연결",
			"items": [
				[
					"cka 10장",
					"/cka/10-dns/"
				]
			],
			"tone": "warn"
		},
		{
			"label": "17장",
			"title": "네트워크 환경과 CNI 확인",
			"href": "/cka-udemy/network-environment/",
			"desc": "인터페이스 · 세 IP 대역 · 런타임 socket · CNI 경로 · Calico 설치",
			"items": [
				[
					"cka 15장",
					"/cka/15-cluster-lifecycle/"
				],
				[
					"cka 17장",
					"/cka/17-extensions/"
				]
			],
			"tone": "warn"
		},
		{
			"label": "18장",
			"title": "Ingress와 TLS",
			"href": "/cka-udemy/06-ingress-netpol/",
			"desc": "IngressClass · host/path · controller · TLS · 외부 HTTP/HTTPS",
			"items": [
				[
					"cka 11장",
					"/cka/11-ingress-gateway/"
				]
			],
			"tone": "warn"
		},
		{
			"label": "19장",
			"title": "Gateway와 HTTPRoute",
			"href": "/cka-udemy/gateway/",
			"desc": "CRD와 구현체 · listener · parentRefs · attachment 조건 · 실제 요청",
			"items": [
				[
					"cka 11장",
					"/cka/11-ingress-gateway/"
				]
			],
			"tone": "warn"
		},
		{
			"label": "20장",
			"title": "NetworkPolicy 허용과 차단",
			"href": "/cka-udemy/network-policy/",
			"desc": "pod/namespace selector · ingress/egress · DNS · 허용/차단 검증",
			"items": [
				[
					"cka 12장",
					"/cka/12-networkpolicy/"
				]
			],
			"tone": "warn"
		},
		{
			"label": "21장",
			"title": "볼륨과 정적 PV/PVC",
			"href": "/cka-udemy/07-storage/",
			"desc": "hostPath · PV/PVC 바인딩 · reclaimPolicy · 실제 mount·읽기/쓰기",
			"items": [
				[
					"cka 13장",
					"/cka/13-storage/"
				]
			],
			"tone": "zone"
		},
		{
			"label": "22장",
			"title": "StorageClass와 동적 프로비저닝",
			"href": "/cka-udemy/storage-class/",
			"desc": "provisioner · WaitForFirstConsumer · 기본 class · 동적 PV · quota",
			"items": [
				[
					"cka 13장",
					"/cka/13-storage/"
				]
			],
			"tone": "zone"
		},
		{
			"label": "23장",
			"title": "TLS·CSR·kubeconfig",
			"href": "/cka-udemy/08-security/",
			"desc": "인증서 역할 · CSR 승인·발급 · kubeconfig · 실제 인증 · API 요청 흐름",
			"items": [
				[
					"cka 14장",
					"/cka/14-rbac/"
				]
			],
			"tone": "zone"
		},
		{
			"label": "24장",
			"title": "RBAC 권한 부여와 검증",
			"href": "/cka-udemy/rbac/",
			"desc": "Role·ClusterRole · Binding · can-i 허용·거부 · 인증과 인가 구분",
			"items": [
				[
					"cka 14장",
					"/cka/14-rbac/"
				]
			],
			"tone": "zone"
		},
		{
			"label": "25장",
			"title": "ServiceAccount와 imagePullSecrets",
			"href": "/cka-udemy/service-account/",
			"desc": "Pod 신원 · projected token · 레지스트리 Secret · 실제 image pull",
			"items": [
				[
					"cka 14장",
					"/cka/14-rbac/"
				]
			],
			"tone": "zone"
		},
		{
			"label": "26장",
			"title": "Admission 요청 검사",
			"href": "/cka-udemy/admission/",
			"desc": "내장 플러그인 · validating/mutating webhook · 거부·변형 검증",
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
		},
		{
			"label": "35장",
			"title": "metrics와 애플리케이션 로그",
			"href": "/cka-udemy/10-troubleshooting/",
			"desc": "metrics-server · top 단위 · Pod 상태 · Events · 현재/이전 로그",
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
			"label": "36장",
			"title": "컨트롤 플레인 복구",
			"href": "/cka-udemy/control-plane-failure/",
			"desc": "Pod 생성·배정 · static Pod 명령·kubeconfig·hostPath · 원래 workload",
			"items": [
				[
					"cka 18장",
					"/cka/18-troubleshooting/"
				]
			],
			"tone": "bad"
		},
		{
			"label": "37장",
			"title": "워커 노드 복구",
			"href": "/cka-udemy/worker-failure/",
			"desc": "kubelet 서비스 · config/kubeconfig · CA · API 서버 주소 · Node Ready",
			"items": [
				[
					"cka 18장",
					"/cka/18-troubleshooting/"
				]
			],
			"tone": "bad"
		},
		{
			"label": "38장",
			"title": "Service와 네트워크 장애",
			"href": "/cka-udemy/network-failure/",
			"desc": "Service·EndpointSlice · CNI 초기화 · kube-proxy 설정 · 실제 앱 요청",
			"items": [
				[
					"cka 9장",
					"/cka/09-services/"
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
