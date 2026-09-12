# CKA 실습 개편 이관 계약 — M0

2026-09-12 원본 커밋 `32c1012` 기준. [실행 계획](01-cka-udemy-rework.md)의 M0 산출물이다.

## 파일·표시 번호·order 예약

파일명은 `.mdx`를 생략했다. 표시 번호는 최종 학습 순서이며 order는 `1000 + 번호 × 10`이다.
기존 10~120과 충돌하지 않게 예약했다. 각 묶음을 이관할 때 해당 값만 활성화한다.
M1의 31~34장이 먼저 보이는 과도기는 허용한다. M2~M8에서 나머지 번호를 채운다.
새 그룹은 첫 소속 페이지가 생길 때 선언하고 기존 페이지 소속은 해당 묶음에서 옮긴다. 미래 slug는 사이트 링크로 만들지 않는다.

| 번호 | 파일 | group | order | 작업 목표 |
|---|---|---|---|---|
| 1 | `01-basics` | `architecture` | 1010 | kubectl·namespace·YAML·Vim 기본 조작 |
| 2 | `jsonpath` | `architecture` | 1020 | JSONPath 추출·정렬 |
| 3 | `pods` | `pods` | 1030 | Pod 생성·상태 확인 |
| 4 | `02-workloads` | `pods` | 1040 | Deployment 생성·rollout·rollback |
| 5 | `jobs` | `pods` | 1050 | Job 완료·실패 |
| 6 | `03-pod-config` | `pods` | 1060 | command·args 수정 |
| 7 | `configmap-secret` | `pods` | 1070 | ConfigMap·Secret 주입 |
| 8 | `init-sidecar` | `pods` | 1080 | init·sidecar 구성 |
| 9 | `security-context` | `pods` | 1090 | 컨테이너 실행 권한 |
| 10 | `04-scheduling` | `pods` | 1100 | 노드 배치 |
| 11 | `resource-limits` | `pods` | 1110 | requests·limits·quota |
| 12 | `daemonset-static-pod` | `pods` | 1120 | 노드별 워크로드 관리 |
| 13 | `autoscaling` | `pods` | 1130 | HPA 설정·검증 |
| 14 | `vpa` | `pods` | 1140 | VPA CRD 읽기 — 학습 보충 |
| 15 | `05-services-dns` | `services` | 1150 | Service·EndpointSlice 연결 |
| 16 | `dns` | `services` | 1160 | DNS·CoreDNS 확인 |
| 17 | `network-environment` | `services` | 1170 | 노드·Pod 대역과 CNI 확인 |
| 18 | `06-ingress-netpol` | `services` | 1180 | Ingress·TLS 연결 |
| 19 | `gateway` | `services` | 1190 | Gateway·HTTPRoute 연결 |
| 20 | `network-policy` | `services` | 1200 | NetworkPolicy 허용·차단 |
| 21 | `07-storage` | `storage` | 1210 | 볼륨·정적 PV/PVC 연결 |
| 22 | `storage-class` | `storage` | 1220 | 동적 프로비저닝·quota |
| 23 | `08-security` | `rbac` | 1230 | TLS·CSR·kubeconfig |
| 24 | `rbac` | `rbac` | 1240 | Role·Binding·can-i |
| 25 | `service-account` | `rbac` | 1250 | ServiceAccount·imagePullSecrets |
| 26 | `admission` | `rbac` | 1260 | Admission 요청 검사 |
| 27 | `09-cluster-lifecycle` | `rbac` | 1270 | kubeadm 설치·확인 |
| 28 | `cluster-upgrade` | `rbac` | 1280 | drain·업그레이드 |
| 29 | `etcd-backup-restore` | `rbac` | 1290 | etcd 백업·복구 |
| 30 | `11-helm` | `rbac` | 1300 | Helm release 관리 |
| 31 | `12-kustomize` | `rbac` | 1310 | Kustomize 묶기·환경별 적용 |
| 32 | `kustomize-transformers` | `rbac` | 1320 | Kustomize 범위별 변환 |
| 33 | `kustomize-patches` | `rbac` | 1330 | Kustomize 특정 대상 수정·삭제 |
| 34 | `kustomize-components` | `rbac` | 1340 | Kustomize 선택 기능 — 학습 보충 |
| 35 | `10-troubleshooting` | `troubleshooting` | 1350 | metrics·앱 상태·로그 |
| 36 | `control-plane-failure` | `troubleshooting` | 1360 | 컨트롤 플레인 복구 |
| 37 | `worker-failure` | `troubleshooting` | 1370 | 워커 복구 |
| 38 | `network-failure` | `troubleshooting` | 1380 | Service·네트워크 장애 |
| 39 | `exam-search` | `exam-strategy` | 1390 | 작업별 명령·문서 색인 |

## 원본 주요 절 → 목적지

h2와 h3를 모두 기록한다. 목적 제목은 원제목을 기본으로 하며 편집 때 쉬운 작업 제목으로 바꾸고 이 표에 차이를 남긴다.
하위 절은 부모와 함께 이동한다. 검색 표·말미 요약은 각 목적 페이지의 해당 작업 옆으로 통합하고 `exam-search`에는 짧은 색인만 둔다.
“이동”은 이관 계약이지 본문 편집 완료 표시가 아니다. 완료 여부는 실행 계획 M0~M8 체크박스로 관리한다.

### 01-basics.mdx

| 원본 절 | 처리 | 목적 파일·절 |
|---|---|---|
| Pod 기초 — Practice Test: PODs | 이동 | `pods` — Pod 기초 — Practice Test: PODs |
| 네임스페이스 — Practice Test: Namespaces | 유지 | `01-basics` — 네임스페이스 — Practice Test: Namespaces |
| 명령형 커맨드 — Practice Test: Imperative Commands | 유지 | `01-basics` — 명령형 커맨드 — Practice Test: Imperative Commands |
| ↳ 도움말 → YAML 뼈대 → 필요한 필드만 수정 | 유지 | `01-basics` — 도움말 → YAML 뼈대 → 필요한 필드만 수정 |
| JSONPath와 정렬 — Practice Test: Advanced Kubectl Commands | 이동 | `jsonpath` — JSONPath와 정렬 — Practice Test: Advanced Kubectl Commands |
| ↳ 도움말에서 문법 찾기 | 이동 | `jsonpath` — 도움말에서 문법 찾기 |
| ↳ 노드 이름과 OS 이미지 추출 | 이동 | `jsonpath` — 해당 작업의 노드 이름과 OS 이미지 추출 |
| ↳ kubeconfig 사용자 이름 추출 | 이동 | `jsonpath` — 해당 작업의 kubeconfig 사용자 이름 추출 |
| ↳ PV 용량순 정렬 | 이동 | `jsonpath` — 해당 작업의 PV 용량순 정렬 |
| ↳ 정렬을 유지하면서 NAME·CAPACITY 두 열만 출력 | 이동 | `jsonpath` — 해당 작업의 정렬을 유지하면서 NAME·CAPACITY 두 열만 출력 |
| ↳ Deployment 목록 — 지정 열·이름순·파일 저장 | 이동 | `jsonpath` — 해당 작업의 Deployment 목록 — 지정 열·이름순·파일 저장 |
| ↳ aws-user가 사용하는 컨텍스트 이름 필터링 | 이동 | `jsonpath` — 해당 작업의 aws-user가 사용하는 컨텍스트 이름 필터링 |
| ↳ VPA 관련 CRD 이름을 파일로 제출하기 | 이동 | `jsonpath` — 해당 작업의 VPA 관련 CRD 이름을 파일로 제출하기 |
| ↳ 제출 파일 확인과 실수 복구 | 이동 | `jsonpath` — 해당 작업의 제출 파일 확인과 실수 복구 |
| 시험장에서 공식 문서 찾기 | 통합 | `pods / 01-basics / jsonpath / exam-search` — 해당 작업의 문서 검색·완료 판정 |
| ↳ 시험 중 찾을 곳과 학습용 링크 구분 | 이동 | `01-basics / exam-search` — 시험 중 찾을 곳과 학습용 링크 구분 |
| ↳ Vim으로 YAML을 고치는 짧은 연습 | 유지 | `01-basics` — Vim으로 YAML을 고치는 짧은 연습 |
| 이 장에서 남길 것 | 통합 | `pods / 01-basics / jsonpath / exam-search` — 해당 작업의 문서 검색·완료 판정 |

### 02-workloads.mdx

| 원본 절 | 처리 | 목적 파일·절 |
|---|---|---|
| ReplicaSet — Practice Test: ReplicaSets | 유지 | `02-workloads` — ReplicaSet — Practice Test: ReplicaSets |
| Deployment — Practice Test: Deployments | 유지 | `02-workloads` — Deployment — Practice Test: Deployments |
| ↳ hr-web-app — 이미지와 복제본 수만 지정된 생성 | 유지 | `02-workloads` — 해당 작업의 hr-web-app — 이미지와 복제본 수만 지정된 생성 |
| 롤링 업데이트와 롤백 — Practice Test: Rolling Updates and Rollbacks | 유지 | `02-workloads` — 롤링 업데이트와 롤백 — Practice Test: Rolling Updates and Rollbacks |
| ↳ nginx 이미지 변경과 변경 사유 기록 | 유지 | `02-workloads` — 해당 작업의 nginx 이미지 변경과 변경 사유 기록 |
| ↳ nginx-deploy — apply로 생성과 rolling update를 모두 수행 | 유지 | `02-workloads` — 해당 작업의 nginx-deploy — apply로 생성과 rolling update를 모두 수행 |
| ↳ 실패한 롤아웃은 새 ReplicaSet부터 내려간다 | 유지 | `02-workloads` — 해당 작업의 실패한 롤아웃은 새 ReplicaSet부터 내려간다 |
| Job — 완료·실패·재실행 진단 | 이동 | `jobs` — Job — 완료·실패·재실행 진단 |
| 시험장에서 공식 문서 찾기 | 통합 | `02-workloads / jobs / exam-search` — 해당 작업의 문서 검색·완료 판정 |
| 이 장에서 남길 것 | 통합 | `02-workloads / jobs / exam-search` — 해당 작업의 문서 검색·완료 판정 |

### 03-pod-config.mdx

| 원본 절 | 처리 | 목적 파일·절 |
|---|---|---|
| command와 args — Practice Test: Commands and Arguments | 유지 | `03-pod-config` — command와 args — Practice Test: Commands and Arguments |
| ↳ BusyBox — args 한 줄과 sh -c의 경계 | 유지 | `03-pod-config` — 해당 작업의 BusyBox — args 한 줄과 sh -c의 경계 |
| 환경 변수와 ConfigMap — Practice Test: Env Variables | 이동 | `configmap-secret` — 환경 변수와 ConfigMap — Practice Test: Env Variables |
| ↳ ConfigMap 변경 반영을 판정하는 루프 | 이동 | `configmap-secret` — 해당 작업의 ConfigMap 변경 반영을 판정하는 루프 |
| Secret — Practice Test: Secrets | 이동 | `configmap-secret` — Secret — Practice Test: Secrets |
| ↳ 기존 Secret을 읽기 전용 파일로 마운트 — secret-1401 | 이동 | `configmap-secret` — 해당 작업의 기존 Secret을 읽기 전용 파일로 마운트 — secret-1401 |
| securityContext — Practice Test: Security Contexts | 이동 | `security-context` — securityContext — Practice Test: Security Contexts |
| 멀티 컨테이너 — Practice Test: Multi-Container Pods | 이동 | `init-sidecar` — 멀티 컨테이너 — Practice Test: Multi-Container Pods |
| ↳ mc-pod — 노드 이름 주입과 파일 로그 공유 | 이동 | `init-sidecar` — 해당 작업의 mc-pod — 노드 이름 주입과 파일 로그 공유 |
| ↳ logging-deployment — 네이티브 로그 사이드카 | 이동 | `init-sidecar` — 해당 작업의 logging-deployment — 네이티브 로그 사이드카 |
| init 컨테이너 — Practice Test: Init-Containers | 이동 | `init-sidecar` — init 컨테이너 — Practice Test: Init-Containers |
| ↳ orange — init command 오타의 진단·수정·복구 | 이동 | `init-sidecar` — 해당 작업의 orange — init command 오타의 진단·수정·복구 |
| 시험장에서 공식 문서 찾기 | 통합 | `03-pod-config / configmap-secret / security-context / init-sidecar / exam-search` — 해당 작업의 문서 검색·완료 판정 |
| 이 장에서 남길 것 | 통합 | `03-pod-config / configmap-secret / security-context / init-sidecar / exam-search` — 해당 작업의 문서 검색·완료 판정 |

### 04-scheduling.mdx

| 원본 절 | 처리 | 목적 파일·절 |
|---|---|---|
| 수동 배치 — Practice Test: Manual Scheduling | 유지 | `04-scheduling` — 해당 작업의 수동 배치 — Practice Test: Manual Scheduling |
| 라벨과 셀렉터 — Practice Test: Labels and Selectors | 유지 | `04-scheduling` — 해당 작업의 라벨과 셀렉터 — Practice Test: Labels and Selectors |
| taint와 toleration — Practice Test: Taints and Tolerations | 유지 | `04-scheduling` — 해당 작업의 taint와 toleration — Practice Test: Taints and Tolerations |
| ↳ 라벨과 taint는 교집합으로 판정한다 | 유지 | `04-scheduling` — 해당 작업의 라벨과 taint는 교집합으로 판정한다 |
| nodeAffinity — Practice Test: Node Affinity | 유지 | `04-scheduling` — 해당 작업의 nodeAffinity — Practice Test: Node Affinity |
| 리소스 요청과 제한 — Practice Test: Resource Limits | 이동 | `resource-limits` — 해당 작업의 리소스 요청과 제한 — Practice Test: Resource Limits |
| ↳ 네임스페이스 제한은 새 Pod과 Used/Hard로 증명한다 | 이동 | `resource-limits` — 해당 작업의 네임스페이스 제한은 새 Pod과 Used/Hard로 증명한다 |
| DaemonSet — Practice Test: DaemonSets | 이동 | `daemonset-static-pod` — 해당 작업의 DaemonSet — Practice Test: DaemonSets |
| ↳ 업데이트와 롤백은 전략까지 확인한다 | 이동 | `daemonset-static-pod` — 해당 작업의 업데이트와 롤백은 전략까지 확인한다 |
| 스태틱 Pod — Practice Test: Static Pods | 이동 | `daemonset-static-pod` — 해당 작업의 스태틱 Pod — Practice Test: Static Pods |
| ↳ nginx-critical — 대상 노드의 경로부터 확인한다 | 이동 | `daemonset-static-pod` — 해당 작업의 nginx-critical — 대상 노드의 경로부터 확인한다 |
| 시험장에서 공식 문서 찾기 | 통합 | `04-scheduling / resource-limits / daemonset-static-pod / exam-search` — 해당 작업의 문서 검색·완료 판정 |
| 이 장에서 남길 것 | 통합 | `04-scheduling / resource-limits / daemonset-static-pod / exam-search` — 해당 작업의 문서 검색·완료 판정 |

### 05-services-dns.mdx

| 원본 절 | 처리 | 목적 파일·절 |
|---|---|---|
| Service 기초 — Practice Test: Services | 유지 | `05-services-dns` — 해당 작업의 Service 기초 — Practice Test: Services |
| ↳ 첫 조회 — Pod 라벨과 Service selector를 나란히 본다 | 유지 | `05-services-dns` — 해당 작업의 첫 조회 — Pod 라벨과 Service selector를 나란히 본다 |
| ↳ 명령형 생성 — expose의 이름과 selector를 구분한다 | 유지 | `05-services-dns` — 해당 작업의 명령형 생성 — expose의 이름과 selector를 구분한다 |
| ↳ messaging — 클러스터 내부에 6379 공개 | 유지 | `05-services-dns` — 해당 작업의 messaging — 클러스터 내부에 6379 공개 |
| ↳ hr-web-app — 골격에 nodePort 30082 추가 | 유지 | `05-services-dns` — 해당 작업의 hr-web-app — 골격에 nodePort 30082 추가 |
| 환경 탐색 — Practice Test: Explore Environment | 이동 | `network-environment` — 해당 작업의 환경 탐색 — Practice Test: Explore Environment |
| 런타임과 CNI 확인 — Practice Test: Explore CNI | 이동 | `network-environment` — 해당 작업의 런타임과 CNI 확인 — Practice Test: Explore CNI |
| ↳ 경로 두 개로 환원한다 | 이동 | `network-environment` — 해당 작업의 경로 두 개로 환원한다 |
| Calico 설치 — Lab: Install Calico CNI (2025 신규) | 이동 | `network-environment` — 해당 작업의 Calico 설치 — Lab: Install Calico CNI (2025 신규) |
| 서비스 네트워킹 — Practice Test: Service Networking | 유지 | `05-services-dns` — 해당 작업의 서비스 네트워킹 — Practice Test: Service Networking |
| CoreDNS — Practice Test: CoreDNS in Kubernetes | 이동 | `dns` — 해당 작업의 CoreDNS — Practice Test: CoreDNS in Kubernetes |
| ↳ Corefile 전달 경로 — 고리 세 개를 잇는다 | 이동 | `dns` — 해당 작업의 Corefile 전달 경로 — 고리 세 개를 잇는다 |
| ↳ 짧은 이름이 되는 범위 — search 도메인은 통째로 붙는다 | 이동 | `dns` — 해당 작업의 짧은 이름이 되는 범위 — search 도메인은 통째로 붙는다 |
| ↳ nginx-resolver — Service DNS와 Pod IP를 따로 증명한다 | 이동 | `dns` — 해당 작업의 nginx-resolver — Service DNS와 Pod IP를 따로 증명한다 |
| Service → DNS → 외부 경로를 한 겹씩 검증하기 | 이동 | `dns` — 해당 작업의 Service → DNS → 외부 경로를 한 겹씩 검증하기 |
| 시험장에서 공식 문서 찾기 | 통합 | `05-services-dns / network-environment / dns / exam-search` — 해당 작업의 문서 검색·완료 판정 |
| 이 장에서 남길 것 | 통합 | `05-services-dns / network-environment / dns / exam-search` — 해당 작업의 문서 검색·완료 판정 |

### 06-ingress-netpol.mdx

| 원본 절 | 처리 | 목적 파일·절 |
|---|---|---|
| Ingress 리소스 — Practice Test: CKA Ingress 1 | 유지 | `06-ingress-netpol` — 해당 작업의 Ingress 리소스 — Practice Test: CKA Ingress 1 |
| ↳ webapp-ingress — host·Prefix·IngressClass를 한 명령으로 | 유지 | `06-ingress-netpol` — 해당 작업의 webapp-ingress — host·Prefix·IngressClass를 한 명령으로 |
| ↳ 규칙에 안 맞는 요청 — 기본 백엔드는 두 층에서 정해진다 | 유지 | `06-ingress-netpol` — 해당 작업의 규칙에 안 맞는 요청 — 기본 백엔드는 두 층에서 정해진다 |
| Ingress 컨트롤러 배포 — Practice Test: CKA Ingress 2 | 유지 | `06-ingress-netpol` — 해당 작업의 Ingress 컨트롤러 배포 — Practice Test: CKA Ingress 2 |
| Ingress TLS — 기존 리소스에 얹기 | 유지 | `06-ingress-netpol` — 해당 작업의 Ingress TLS — 기존 리소스에 얹기 |
| ↳ HTTP→HTTPS 리다이렉트 — 기본값의 방향을 안다 | 유지 | `06-ingress-netpol` — 해당 작업의 HTTP→HTTPS 리다이렉트 — 기본값의 방향을 안다 |
| Ingress — 컨트롤러부터 외부 요청까지 증명하기 | 유지 | `06-ingress-netpol` — 해당 작업의 Ingress — 컨트롤러부터 외부 요청까지 증명하기 |
| Gateway API — 만들기와 진단 | 이동 | `gateway` — 해당 작업의 Gateway API — 만들기와 진단 |
| ↳ Gateway 만들기 — 명령형이 없으니 스키마와 가이드에서 뽑는다 | 이동 | `gateway` — 해당 작업의 Gateway 만들기 — 명령형이 없으니 스키마와 가이드에서 뽑는다 |
| ↳ web-gateway — HTTP 80 리스너만 요구하는 생성 | 이동 | `gateway` — 해당 작업의 web-gateway — HTTP 80 리스너만 요구하는 생성 |
| ↳ 기존 Gateway를 HTTPS 443 리스너로 고친다 | 이동 | `gateway` — 해당 작업의 기존 Gateway를 HTTPS 443 리스너로 고친다 |
| ↳ HTTPRoute의 parentRefs — 세 값을 클러스터에서 캐낸다 | 이동 | `gateway` — 해당 작업의 HTTPRoute의 parentRefs — 세 값을 클러스터에서 캐낸다 |
| ↳ 배포를 진단하기 — API 설치와 구현체를 분리한다 | 이동 | `gateway` — 해당 작업의 배포를 진단하기 — API 설치와 구현체를 분리한다 |
| NetworkPolicy — Practice Test: Network Policies | 이동 | `network-policy` — 해당 작업의 NetworkPolicy — Practice Test: Network Policies |
| ↳ 문제를 셀렉터와 방향으로 번역하기 | 이동 | `network-policy` — 해당 작업의 문제를 셀렉터와 방향으로 번역하기 |
| ↳ 랩 정답 — 업무 트래픽은 제한하고 UI ingress는 열기 | 이동 | `network-policy` — 해당 작업의 랩 정답 — 업무 트래픽은 제한하고 UI ingress는 열기 |
| ↳ 후보 세 개 중 가장 좁은 허용 정책을 고른다 | 이동 | `network-policy` — 해당 작업의 후보 세 개 중 가장 좁은 허용 정책을 고른다 |
| ↳ 적용 결과를 세 방향으로 증명하기 | 이동 | `network-policy` — 해당 작업의 적용 결과를 세 방향으로 증명하기 |
| 시험장에서 공식 문서 찾기 | 통합 | `06-ingress-netpol / gateway / network-policy / exam-search` — 해당 작업의 문서 검색·완료 판정 |
| 이 장에서 남길 것 | 통합 | `06-ingress-netpol / gateway / network-policy / exam-search` — 해당 작업의 문서 검색·완료 판정 |

### 07-storage.mdx

| 원본 절 | 처리 | 목적 파일·절 |
|---|---|---|
| hostPath 로그 볼륨 — webapp | 유지 | `07-storage` — 해당 작업의 hostPath 로그 볼륨 — webapp |
| PV와 PVC — Practice Test: Persistent Volume Claims | 유지 | `07-storage` — 해당 작업의 PV와 PVC — Practice Test: Persistent Volume Claims |
| ↳ 시험장에서 뼈대와 필드 찾기 | 통합 | `07-storage` — 해당 작업의 문서 검색·완료 판정 |
| ↳ 1. PV 생성 — 관리자 쪽 저장 공간 | 유지 | `07-storage` — 해당 작업의 1. PV 생성 — 관리자 쪽 저장 공간 |
| ↳ pv-analytics — PV만 요구하는 문제의 완료 기준 | 유지 | `07-storage` — 해당 작업의 pv-analytics — PV만 요구하는 문제의 완료 기준 |
| ↳ 2. PVC 생성 — 앱의 요청 | 유지 | `07-storage` — 해당 작업의 2. PVC 생성 — 앱의 요청 |
| ↳ 3. mode를 맞춘 뒤 Pod에서 사용 | 유지 | `07-storage` — 해당 작업의 3. mode를 맞춘 뒤 Pod에서 사용 |
| ↳ alpha-mysql — PV를 고치지 않고 누락된 PVC 생성 | 유지 | `07-storage` — 해당 작업의 alpha-mysql — PV를 고치지 않고 누락된 PVC 생성 |
| StorageClass — Practice Test: Storage Class | 이동 | `storage-class` — 해당 작업의 StorageClass — Practice Test: Storage Class |
| ↳ 1. 기존 클래스 요청 — local-pvc | 이동 | `storage-class` — 해당 작업의 1. 기존 클래스 요청 — local-pvc |
| ↳ 2. 소비 Pod 생성 — nginx | 이동 | `storage-class` — 해당 작업의 2. 소비 Pod 생성 — nginx |
| ↳ 3. 로컬 PV용 클래스 생성 — delayed-volume-sc | 이동 | `storage-class` — 해당 작업의 3. 로컬 PV용 클래스 생성 — delayed-volume-sc |
| ↳ local-sc — 기본 클래스와 확장 허용까지 설정 | 이동 | `storage-class` — 해당 작업의 local-sc — 기본 클래스와 확장 허용까지 설정 |
| 정적·동적 프로비저닝 완료 판정 | 이동 | `07-storage / storage-class` — 해당 작업의 정적·동적 프로비저닝 완료 판정 |
| ↳ 정적 PV — Bound 뒤에 실제 마운트까지 | 유지 | `07-storage` — 해당 작업의 정적 PV — Bound 뒤에 실제 마운트까지 |
| ↳ 동적 프로비저닝 — 생성 주체까지 추적 | 이동 | `storage-class` — 해당 작업의 동적 프로비저닝 — 생성 주체까지 추적 |
| 스토리지 quota 검증 | 이동 | `storage-class` — 해당 작업의 스토리지 quota 검증 |
| 시험장에서 공식 문서 찾기 | 통합 | `07-storage / storage-class / exam-search` — 해당 작업의 문서 검색·완료 판정 |
| 이 장에서 남길 것 | 통합 | `07-storage / storage-class / exam-search` — 해당 작업의 문서 검색·완료 판정 |

### 08-security.mdx

| 원본 절 | 처리 | 목적 파일·절 |
|---|---|---|
| 인증서와 kubeconfig | 유지 | `08-security` — 해당 작업의 인증서와 kubeconfig |
| ↳ 인증서 읽기 — Practice Test: View Certificate Details | 유지 | `08-security` — 해당 작업의 인증서 읽기 — Practice Test: View Certificate Details |
| ↳ CSR 승인 — Practice Test: Certificates API | 유지 | `08-security` — 해당 작업의 CSR 승인 — Practice Test: Certificates API |
| ↳ kubeconfig — Practice Test: KubeConfig | 유지 | `08-security` — 해당 작업의 kubeconfig — Practice Test: KubeConfig |
| ↳ 지정 kubeconfig의 API 서버 포트 수정 — admin.kubeconfig | 유지 | `08-security` — 해당 작업의 지정 kubeconfig의 API 서버 포트 수정 — admin.kubeconfig |
| ↳ kubeconfig 재료로 API 요청 검증 | 유지 | `08-security` — 해당 작업의 kubeconfig 재료로 API 요청 검증 |
| RBAC으로 권한 주기 | 이동 | `rbac` — 해당 작업의 RBAC으로 권한 주기 |
| ↳ Role과 RoleBinding — Practice Test: RBAC | 이동 | `rbac` — 해당 작업의 Role과 RoleBinding — Practice Test: RBAC |
| ↳ john-developer — 제공된 CSR로 인증서 발급과 Pod 권한 연결 | 이동 | `rbac` — 해당 작업의 john-developer — 제공된 CSR로 인증서 발급과 Pod 권한 연결 |
| ↳ ClusterRole — Practice Test: Cluster Roles | 이동 | `rbac` — 해당 작업의 ClusterRole — Practice Test: Cluster Roles |
| 워크로드 신원과 이미지 접근 | 이동 | `service-account` — 해당 작업의 워크로드 신원과 이미지 접근 |
| ↳ ServiceAccount — Practice Test: Service Accounts | 이동 | `service-account` — 해당 작업의 ServiceAccount — Practice Test: Service Accounts |
| ↳ 프라이빗 레지스트리 — Practice Test: Image Security | 이동 | `service-account` — 해당 작업의 프라이빗 레지스트리 — Practice Test: Image Security |
| Admission으로 요청 내용 검사 | 이동 | `admission` — 해당 작업의 Admission으로 요청 내용 검사 |
| ↳ admission 플러그인 켜고 끄기 — Lab: Admission Controllers (2025 신규) | 이동 | `admission` — 해당 작업의 admission 플러그인 켜고 끄기 — Lab: Admission Controllers (2025 신규) |
| ↳ admission webhook 등록 — Lab: Validating and Mutating Admission Controllers (2025 신규) | 이동 | `admission` — 해당 작업의 admission webhook 등록 — Lab: Validating and Mutating Admission Controllers (2025 신규) |
| TLS부터 저장까지 한 요청으로 검증하기 | 유지 | `08-security` — 해당 작업의 TLS부터 저장까지 한 요청으로 검증하기 |
| 시험장에서 공식 문서 찾기 | 통합 | `08-security / rbac / service-account / admission / exam-search` — 해당 작업의 문서 검색·완료 판정 |
| 이 장에서 남길 것 | 통합 | `08-security / rbac / service-account / admission / exam-search` — 해당 작업의 문서 검색·완료 판정 |

### 09-cluster-lifecycle.mdx

| 원본 절 | 처리 | 목적 파일·절 |
|---|---|---|
| 로컬 런타임 패키지 설치 — cri-docker | 학습 보충 | `09-cluster-lifecycle` — 해당 작업의 로컬 런타임 패키지 설치 — cri-docker |
| ↳ node01 접속과 패키지 설치 | 유지 | `09-cluster-lifecycle` — 해당 작업의 node01 접속과 패키지 설치 |
| ↳ 실행과 부팅 시 자동 시작은 별도 조건 | 유지 | `09-cluster-lifecycle` — 해당 작업의 실행과 부팅 시 자동 시작은 별도 조건 |
| kubeadm 설치 — Practice Test: Deploy a Cluster using Kubeadm | 유지 | `09-cluster-lifecycle` — 해당 작업의 kubeadm 설치 — Practice Test: Deploy a Cluster using Kubeadm |
| 설치 완료 증명 — Ready에서 외부 접근까지 | 유지 | `09-cluster-lifecycle` — 해당 작업의 설치 완료 증명 — Ready에서 외부 접근까지 |
| 노드 비우기 — Practice Test: OS Upgrades | 이동 | `cluster-upgrade` — 해당 작업의 노드 비우기 — Practice Test: OS Upgrades |
| ↳ 왜 `--ignore-daemonsets`가 필요한가 | 이동 | `cluster-upgrade` — 해당 작업의 왜 `--ignore-daemonsets`가 필요한가 |
| ↳ `cordon`과 `uncordon`은 무슨 뜻인가 | 이동 | `cluster-upgrade` — 해당 작업의 `cordon`과 `uncordon`은 무슨 뜻인가 |
| 버전 업그레이드 — Practice Test: Cluster Upgrade Process | 이동 | `cluster-upgrade` — 해당 작업의 버전 업그레이드 — Practice Test: Cluster Upgrade Process |
| ↳ APT에서 설치할 버전 찾기 | 이동 | `cluster-upgrade` — 해당 작업의 APT에서 설치할 버전 찾기 |
| ↳ 업그레이드 완료 증명 | 이동 | `cluster-upgrade` — 해당 작업의 업그레이드 완료 증명 |
| etcd 백업과 복구 — Practice Test: Backup and Restore Methods | 이동 | `etcd-backup-restore` — 해당 작업의 etcd 백업과 복구 — Practice Test: Backup and Restore Methods |
| ↳ 문제 문구에서 읽어야 할 것 | 이동 | `etcd-backup-restore` — 해당 작업의 문제 문구에서 읽어야 할 것 |
| ↳ 서버 매니페스트와 `etcdctl`의 인증서 플래그 | 이동 | `etcd-backup-restore` — 해당 작업의 서버 매니페스트와 `etcdctl`의 인증서 플래그 |
| ↳ `ETCDCTL_API=3`이 필요한 버전 | 이동 | `etcd-backup-restore` — 해당 작업의 `ETCDCTL_API=3`이 필요한 버전 |
| ↳ 백업만 요구할 때 — 저장 노드·경로·파일 검증 | 이동 | `etcd-backup-restore` — 해당 작업의 백업만 요구할 때 — 저장 노드·경로·파일 검증 |
| ↳ 복구 절차 — 쓰기를 멈추고 새 data-dir로 전환 | 이동 | `etcd-backup-restore` — 해당 작업의 복구 절차 — 쓰기를 멈추고 새 data-dir로 전환 |
| 스택 vs 외부 etcd — Practice Test: Backup and Restore Methods 2 | 이동 | `etcd-backup-restore` — 해당 작업의 스택 vs 외부 etcd — Practice Test: Backup and Restore Methods 2 |
| 시험장에서 공식 문서 찾기 | 통합 | `09-cluster-lifecycle / cluster-upgrade / etcd-backup-restore / exam-search` — 해당 작업의 문서 검색·완료 판정 |
| 이 장에서 남길 것 | 통합 | `09-cluster-lifecycle / cluster-upgrade / etcd-backup-restore / exam-search` — 해당 작업의 문서 검색·완료 판정 |

### 10-troubleshooting.mdx

| 원본 절 | 처리 | 목적 파일·절 |
|---|---|---|
| metrics-server — Practice Test: Monitor Cluster Components | 유지 | `10-troubleshooting` — 해당 작업의 metrics-server — Practice Test: Monitor Cluster Components |
| ↳ `kubectl top` 출력 읽기 | 유지 | `10-troubleshooting` — 해당 작업의 `kubectl top` 출력 읽기 |
| 오토스케일러 — 제공된 파일과 CRD 스키마 활용 | 이동 | `autoscaling / vpa` — 해당 작업의 오토스케일러 — 제공된 파일과 CRD 스키마 활용 |
| ↳ webapp-hpa — CPU 50%와 축소 안정화 300초 | 이동 | `autoscaling` — 해당 작업의 webapp-hpa — CPU 50%와 축소 안정화 300초 |
| ↳ backend-hpa — memory utilization 65%로 바꾼다 | 이동 | `autoscaling` — 해당 작업의 backend-hpa — memory utilization 65%로 바꾼다 |
| ↳ analytics-vpa — Recreate 모드로 요청량 조정 | 학습 보충 | `vpa` — 해당 작업의 analytics-vpa — Recreate 모드로 요청량 조정 |
| 애플리케이션 로그 — Practice Test: Managing Application Logs | 유지 | `10-troubleshooting` — 해당 작업의 애플리케이션 로그 — Practice Test: Managing Application Logs |
| 증상에 맞는 로그 진입점을 고른다 | 유지 | `10-troubleshooting` — 해당 작업의 증상에 맞는 로그 진입점을 고른다 |
| 컨트롤 플레인 장애 — Control Plane Failure | 이동 | `control-plane-failure` — 해당 작업의 컨트롤 플레인 장애 — Control Plane Failure |
| ↳ Deployment에서 시작해 담당 컴포넌트를 좁힌다 | 이동 | `control-plane-failure` — 해당 작업의 Deployment에서 시작해 담당 컴포넌트를 좁힌다 |
| ↳ scheduler — 실행 파일 이름 오타는 Events에서 찾는다 | 이동 | `control-plane-failure` — 해당 작업의 scheduler — 실행 파일 이름 오타는 Events에서 찾는다 |
| ↳ controller-manager — kubeconfig 경로 오타는 로그에서 찾는다 | 이동 | `control-plane-failure` — 해당 작업의 controller-manager — kubeconfig 경로 오타는 로그에서 찾는다 |
| ↳ controller-manager — 파일 없음에서 hostPath 오류까지 추적한다 | 이동 | `control-plane-failure` — 해당 작업의 controller-manager — 파일 없음에서 hostPath 오류까지 추적한다 |
| ↳ static Pod 수정과 원래 워크로드 복구를 검증한다 | 이동 | `control-plane-failure` — 해당 작업의 static Pod 수정과 원래 워크로드 복구를 검증한다 |
| 워커 노드 장애 — Worker Node Failure | 이동 | `worker-failure` — 해당 작업의 워커 노드 장애 — Worker Node Failure |
| ↳ 공통 진입점 — 서비스 상태와 최근 로그를 함께 읽는다 | 이동 | `worker-failure` — 해당 작업의 공통 진입점 — 서비스 상태와 최근 로그를 함께 읽는다 |
| ↳ kubelet 중지 — inactive를 확인하고 시작한다 | 이동 | `worker-failure` — 해당 작업의 kubelet 중지 — inactive를 확인하고 시작한다 |
| ↳ 설정 경로 찾기 — config와 kubeconfig를 구분한다 | 이동 | `worker-failure` — 해당 작업의 설정 경로 찾기 — config와 kubeconfig를 구분한다 |
| ↳ CA 경로 오류 — 로그의 파일명과 실제 파일을 대조한다 | 이동 | `worker-failure` — 해당 작업의 CA 경로 오류 — 로그의 파일명과 실제 파일을 대조한다 |
| ↳ API 서버 포트 오류 — kubelet.conf의 server를 고친다 | 이동 | `worker-failure` — 해당 작업의 API 서버 포트 오류 — kubelet.conf의 server를 고친다 |
| ↳ 공통 완료 검증 — 서비스 실행과 노드 Ready를 모두 확인한다 | 이동 | `worker-failure` — 해당 작업의 공통 완료 검증 — 서비스 실행과 노드 Ready를 모두 확인한다 |
| 애플리케이션 연결 실패 — MySQL Service 진단 | 이동 | `network-failure` — 해당 작업의 애플리케이션 연결 실패 — MySQL Service 진단 |
| ↳ 이름 오류 — alpha의 mysql을 mysql-service로 교체한다 | 이동 | `network-failure` — 해당 작업의 이름 오류 — alpha의 mysql을 mysql-service로 교체한다 |
| ↳ targetPort 오류 — beta의 기존 Service를 edit으로 수정한다 | 이동 | `network-failure` — 해당 작업의 targetPort 오류 — beta의 기존 Service를 edit으로 수정한다 |
| 네트워크 장애 — Practice Test: Troubleshoot Network | 이동 | `network-failure` — 해당 작업의 네트워크 장애 — Practice Test: Troubleshoot Network |
| ↳ Test 1 — Pending에서 CNI 초기화 실패까지 추적한다 | 이동 | `network-failure` — 해당 작업의 Test 1 — Pending에서 CNI 초기화 실패까지 추적한다 |
| ↳ CNI 누락 진단과 Flannel 선택은 별도의 판단이다 | 이동 | `network-failure` — 해당 작업의 CNI 누락 진단과 Flannel 선택은 별도의 판단이다 |
| ↳ Test 2 — kube-proxy 로그에서 누락된 설정 파일을 찾는다 | 이동 | `network-failure` — 해당 작업의 Test 2 — kube-proxy 로그에서 누락된 설정 파일을 찾는다 |
| ↳ 실행 옵션과 ConfigMap의 파일 경로를 대조한다 | 이동 | `network-failure` — 해당 작업의 실행 옵션과 ConfigMap의 파일 경로를 대조한다 |
| ↳ DaemonSet의 틀린 인자만 수정하고 앱까지 검증한다 | 이동 | `network-failure` — 해당 작업의 DaemonSet의 틀린 인자만 수정하고 앱까지 검증한다 |
| 시험장에서 공식 문서 찾기 | 통합 | `10-troubleshooting / autoscaling / vpa / control-plane-failure / worker-failure / network-failure / exam-search` — 해당 작업의 문서 검색·완료 판정 |
| 이 장에서 남길 것 | 통합 | `10-troubleshooting / autoscaling / vpa / control-plane-failure / worker-failure / network-failure / exam-search` — 해당 작업의 문서 검색·완료 판정 |

### 11-helm.mdx

| 원본 절 | 처리 | 목적 파일·절 |
|---|---|---|
| helm 설치 — 랩 전용 준비 단계 | 유지 | `11-helm` — 해당 작업의 helm 설치 — 랩 전용 준비 단계 |
| 차트 찾기 — hub와 repo, 그리고 두 버전 컬럼 | 유지 | `11-helm` — 해당 작업의 차트 찾기 — hub와 repo, 그리고 두 버전 컬럼 |
| repo 등록 — add 뒤 update까지가 한 동작 | 유지 | `11-helm` — 해당 작업의 repo 등록 — add 뒤 update까지가 한 동작 |
| 설치와 검증 — release 층과 워크로드 층 | 유지 | `11-helm` — 해당 작업의 설치와 검증 — release 층과 워크로드 층 |
| ↳ 취약 이미지에서 release를 역추적해 제거한다 | 유지 | `11-helm` — 해당 작업의 취약 이미지에서 release를 역추적해 제거한다 |
| 차트 버전 업그레이드 — `--version`은 CHART VERSION | 유지 | `11-helm` — 해당 작업의 차트 버전 업그레이드 — `--version`은 CHART VERSION |
| ↳ kk-mock1 — podinfo 차트 6.11.2로 업그레이드 | 유지 | `11-helm` — 해당 작업의 kk-mock1 — podinfo 차트 6.11.2로 업그레이드 |
| 리비전 확인과 롤백 — history에서 정상 번호를 고른다 | 유지 | `11-helm` — 해당 작업의 리비전 확인과 롤백 — history에서 정상 번호를 고른다 |
| 실패 분기 — 이미지가 안 당겨질 때 | 유지 | `11-helm` — 해당 작업의 실패 분기 — 이미지가 안 당겨질 때 |
| 시험장에서 공식 문서 찾기 | 통합 | `11-helm / exam-search` — 해당 작업의 문서 검색·완료 판정 |
| 이 장에서 남길 것 | 통합 | `11-helm / exam-search` — 해당 작업의 문서 검색·완료 판정 |

### 12-kustomize.mdx

| 원본 절 | 처리 | 목적 파일·절 |
|---|---|---|
| 여러 폴더의 리소스를 하나로 묶기 | 유지 | `12-kustomize` — resources로 파일을 모으기 |
| ↳ staging에만 MySQL Deployment 추가 | 유지 | `12-kustomize` — staging에만 MySQL Deployment 추가 |
| Transformer는 적용 범위부터 고른다 | 이동 | `kustomize-transformers` — Transformer는 적용 범위부터 고른다 |
| ↳ 전체 라벨 — commonLabels 읽기 | 이동 | `kustomize-transformers` — 전체 라벨 — commonLabels 읽기 |
| ↳ db 이름의 접두사 — namePrefix | 이동 | `kustomize-transformers` — db 이름의 접두사 — namePrefix |
| ↳ monitoring 네임스페이스 — namespace | 이동 | `kustomize-transformers` — monitoring 네임스페이스 — namespace |
| ↳ 두 그룹에만 annotation — commonAnnotations | 이동 | `kustomize-transformers` — 두 그룹에만 annotation — commonAnnotations |
| 이미지 변환 — newName과 newTag 구분하기 | 이동 | `kustomize-transformers` — 이미지 변환 — newName과 newTag 구분하기 |
| ↳ 전체 postgres를 mysql로 교체 | 이동 | `kustomize-transformers` — 전체 postgres를 mysql로 교체 |
| ↳ nginx 폴더의 nginx 태그만 변경 | 이동 | `kustomize-transformers` — nginx 폴더의 nginx 태그만 변경 |
| ↳ 하위 결과와 전체 결과를 모두 확인 | 이동 | `kustomize-transformers` — 하위 결과와 전체 결과를 모두 확인 |
| Patch로 특정 필드·항목 수정하기 | 이동 | `kustomize-patches` — Patch로 특정 필드·항목 수정하기 |
| ↳ resources와 patches의 path는 파일 역할이 다르다 | 이동 | `kustomize-patches` — resources와 patches의 path는 파일 역할이 다르다 |
| ↳ QA에서 inline JSON6902로 API 이미지 교체 | 이동 | `kustomize-patches` — QA에서 inline JSON6902로 API 이미지 교체 |
| ↳ Strategic merge — memcached 컨테이너 삭제 | 이동 | `kustomize-patches` — Strategic merge — memcached 컨테이너 삭제 |
| ↳ Inline JSON6902 — Pod template의 org 라벨 삭제 | 이동 | `kustomize-patches` — Inline JSON6902 — Pod template의 org 라벨 삭제 |
| ↳ patch 뒤의 \|-는 여러 줄 문자열 | 이동 | `kustomize-patches` — patch 뒤의 \|-는 여러 줄 문자열 |
| ↳ 삭제 결과와 실패 지점 확인 | 이동 | `kustomize-patches` — 삭제 결과와 실패 지점 확인 |
| Components — 선택한 환경에만 기능 묶음 추가하기 | 학습 보충 | `kustomize-components` — 기능 묶음 만들기 |
| ↳ Component 파일 만들기 | 학습 보충 | `kustomize-components` — 기능 묶음 만들기 |
| ↳ Overlay에서 components로 선택하기 | 학습 보충 | `kustomize-components` — 필요한 환경에서만 선택하기 |
| ↳ 선택·미선택 환경 함께 검증하기 | 학습 보충 | `kustomize-components` — 선택·미선택 결과 비교하기 |
| ↳ 실패하면 선언·참조·패치 대상을 확인하기 | 학습 보충 | `kustomize-components` — 실패와 기능 해제 |
| 미리보기와 완료 검증 구분하기 | 유지 | `12-kustomize` — 미리보기와 완료 검증 구분하기 |
| ↳ 현재 디렉터리와 overlay 경로 구분 | 유지 | `12-kustomize` — 현재 디렉터리와 overlay 경로 구분 |
| ↳ 별도 CLI의 결과를 적용하기 | 유지 | `12-kustomize` — 현재 디렉터리와 overlay 경로 구분 |
| ↳ 실패하면 경로와 입력 형식부터 확인하기 | 유지 | `12-kustomize` — 경로·입력 형식과 복구 |
| kind와 apiVersion이 기억나지 않을 때 | 유지 | `12-kustomize` — kind와 apiVersion이 기억나지 않을 때 |
| ↳ api-resources에 나오지 않는 이유 | 유지 | `12-kustomize` — kind와 apiVersion이 기억나지 않을 때 |
| ↳ 생략해도 실행되는 것과 채점 통과는 다르다 | 유지 | `12-kustomize` — kind와 apiVersion이 기억나지 않을 때 |
| ↳ 별도 CLI가 있으면 기본 파일 생성하기 | 유지 | `12-kustomize` — kind와 apiVersion이 기억나지 않을 때 |
| 시험장에서 공식 문서와 도구 확인하기 | 통합 | `12-kustomize / kustomize-transformers / kustomize-patches / kustomize-components` — 시험장에서 문서와 도구 확인하기 / 각 페이지 공식 예제 안내 |
| ↳ 이번 환경별 문제에서 문서를 활용하는 순서 | 이동 | `12-kustomize / kustomize-patches` — staging에만 MySQL Deployment 추가 / 공식 예제에서 가져올 것과 따로 익힐 것 |
| 이 장에서 남길 것 | 통합 | `12-kustomize / kustomize-transformers / kustomize-patches / kustomize-components` — 본문의 작업별 조건·검증에 통합 (말미 재요약 없음) |


## 경계와 반드시 남길 정보

- `network-environment`의 Calico 설치·CR 설정을 M7 kubeadm에서 참조한다. CNI·CRI 경로 조회와 특정 CNI 선택 조건을 구분한다.
- `vpa`는 제공된 CRD의 스키마·Recreate 동작을 읽는 보충이다. CRD 목록 추출은 `jsonpath`에 남긴다.
- `09-cluster-lifecycle`의 cri-docker 패키지 예제는 랩 환경 보충이며 일반 런타임 설치 표준으로 확대하지 않는다.
- TLS부터 저장까지의 요청 흐름은 `08-security`의 짧은 지도에 보존하고 권한·admission 세부 검증으로 연결한다.
- 정상 Service→DNS→외부 경로 확인은 `dns`에 남기되 각 계층 설명은 Service·Ingress를 참조한다. 실패 시 MySQL 이름·targetPort 및 CNI·kube-proxy 복구는 `network-failure`에 둔다.
- 원본의 서로 다른 실패 원인, 요구된 수정 방식, 성공·복구 조건과 출처는 각 목적지에서 보존한다. 같은 명령 반복과 문제 번호 나열은 통합한다.
- 원본 12개 본문의 h2/h3 **227개**를 대조했다. 이 표의 원문 제목으로 원본 커밋을 재조회할 수 있다.

## 커리큘럼 커버리지 — PDF 본문 대조

2026-09-12 [CNCF curriculum 저장소](https://github.com/cncf/curriculum)의
[CKA v1.35 PDF](https://github.com/cncf/curriculum/blob/master/CKA_Curriculum_v1.35.pdf)를 내려받아
본문 2쪽의 27개 항목을 읽고 두 덱의 실제 절과 대조했다. 아래는 원문 항목을 한국어로 요약한 것이다.
“기존”은 실행 검증 완료가 아니라 실습 본문 존재를 뜻한다. 목적 파일은 위 예약표의 `.mdx`다.

| 도메인 | 커리큘럼 항목 | cka 개념 근거 | 실습 원본 → 목적지·공백 |
|---|---|---|---|
| Cluster Architecture 25% | RBAC 관리 | `14-rbac` — Role·Binding·권한 확인 | 기존 `08-security` → `rbac` |
| Cluster Architecture | 설치 기반 인프라 준비 | `15-cluster-lifecycle` — 런타임·노드 준비 | 기존 `09-cluster-lifecycle` → 동일 파일. cri-docker는 랩 보충 |
| Cluster Architecture | kubeadm 클러스터 생성·관리 | `15-cluster-lifecycle` — init·join·설치 검증 | 기존 `09-cluster-lifecycle` → 동일 파일 |
| Cluster Architecture | 클러스터 수명 주기 | `15-cluster-lifecycle` — 업그레이드·etcd | 기존 `09-cluster-lifecycle` → `cluster-upgrade`, `etcd-backup-restore` |
| Cluster Architecture | HA 컨트롤 플레인 구성 | `15-cluster-lifecycle` — HA 컨트롤 플레인·두 토폴로지 | **전체 구축 실습 미작성**. 기존 etcd의 stacked/external 구분만 보존. M7에서 개념 링크와 공백 표시 |
| Cluster Architecture | Helm·Kustomize로 컴포넌트 설치 | `16-helm-kustomize` — release·overlay | 기존 `11-helm`, `12-kustomize` → Helm 및 Kustomize 4페이지. Kustomize는 매니페스트 적용 연습이며 별도 클러스터 컴포넌트 설치 랩 미작성 |
| Cluster Architecture | CNI·CSI·CRI 확장 인터페이스 이해 | `17-extensions` — 세 인터페이스, `13-storage` — CSI | 기존 `05-services-dns` CNI·CRI → `network-environment`; CSI 개념은 cka 참조, 독립 드라이버 설치 실습 미작성 |
| Cluster Architecture | CRD 이해·operator 설치 구성 | `17-extensions` — CRD 등록·operator 설치와 확인 | 기존 `05-services-dns` Calico 설치·CR, `10-troubleshooting` VPA CR → `network-environment`, `vpa`. **부분 실습**이며 독립 operator 종합 실습 미작성 |
| Workloads 15% | Deployment·rolling update·rollback | `05-workloads` — Deployment | 기존 `02-workloads` → 동일 파일 |
| Workloads | ConfigMap·Secret 앱 설정 | `06-config` — 환경변수·볼륨 주입 | 기존 `03-pod-config` → `configmap-secret` |
| Workloads | 워크로드 오토스케일링 | `08-autoscaling` — HPA·VPA | 기존 `10-troubleshooting` → `autoscaling`; `vpa`는 설치된 CRD 학습 보충 |
| Workloads | 견고한 자가 복구 앱의 기본 요소 | `04-pods` — probes·restartPolicy, `05-workloads` — controller | 기존 Pod 상태·ReplicaSet·Deployment → `pods`, `02-workloads`. probes 전용 실습은 미작성; M2에서 개념 연결 |
| Workloads | Pod admission·배치·limits·affinity | `06-config`, `07-scheduling`, `14-rbac` — admission | 기존 `04-scheduling`, `08-security` → `04-scheduling`, `resource-limits`, `admission` |
| Networking 20% | Pod 간 연결 | `09-services`, `17-extensions` — CNI | 기존 `05-services-dns` → `network-environment` |
| Networking | NetworkPolicy 정의·적용 | `12-networkpolicy` — selector·방향·가산 규칙 | 기존 `06-ingress-netpol` → `network-policy` |
| Networking | Service 타입·endpoints | `09-services` — ClusterIP·NodePort·LoadBalancer·EndpointSlice | 기존 `05-services-dns` → 동일 파일. LoadBalancer 실제 외부 IP 검증 랩은 미작성 |
| Networking | Gateway API로 Ingress 트래픽 관리 | `11-ingress-gateway` — Gateway·HTTPRoute | 기존 `06-ingress-netpol` → `gateway` |
| Networking | Ingress controller·resource 사용 | `11-ingress-gateway` — Ingress·TLS | 기존 `06-ingress-netpol` → 동일 파일 |
| Networking | CoreDNS 이해·사용 | `10-dns` — CoreDNS·조회 | 기존 `05-services-dns` → `dns` |
| Storage 10% | StorageClass·동적 프로비저닝 | `13-storage` — StorageClass·동적 생성 | 기존 `07-storage` → `storage-class` |
| Storage | 볼륨 종류·접근 모드·회수 정책 | `13-storage` — 볼륨·accessModes·reclaimPolicy | 기존 `07-storage` → 동일 파일 |
| Storage | PV·PVC 관리 | `13-storage` — 바인딩·마운트 | 기존 `07-storage` → 동일 파일 |
| Troubleshooting 30% | 클러스터·노드 장애 | `18-troubleshooting` — 노드·control plane | 기존 `10-troubleshooting` → `worker-failure`, `control-plane-failure` |
| Troubleshooting | 클러스터 컴포넌트 장애 | `18-troubleshooting` — 의존 사슬·컴포넌트 | 기존 `10-troubleshooting` → `control-plane-failure`, `network-failure` |
| Troubleshooting | 클러스터·앱 리소스 관찰 | `18-troubleshooting` — 리소스 사용량 | 기존 `10-troubleshooting` — metrics-server·top → 동일 파일 |
| Troubleshooting | 컨테이너 출력 스트림 관리·평가 | `18-troubleshooting` — logs | 기존 `10-troubleshooting` — 로그·진입점 → 동일 파일 |
| Troubleshooting | Service·네트워크 장애 | `18-troubleshooting` — 네트워킹 진단 | 기존 `10-troubleshooting` → `network-failure` |

위 공백은 누락을 숨기지 않기 위한 표시다. M2~M8은 기존 사례의 이관·개념 연결을 먼저 완료한다.
새 HA 클러스터나 대형 operator 랩을 만드는 것은 이번 범위에 포함하지 않는다.


## M1 정보 보존 검토 (2026-09-13)

기존 `12-kustomize` URL은 유지하고 들어오는 index·DeckMap을 새 페이지로 연결했다.
저장소 안에 이동된 옛 앵커를 가리키는 링크는 없었다. 외부 북마크의 모든 옛 앵커 호환은 보장하지 않는다.
위 12-kustomize 표는 실제 목적 제목으로 갱신했다. M2~M8 원본 표는 아직 예약 상태다.

| 판단 | 시범에서 확인한 결과 |
|---|---|
| 분할 | 기본 적용 252줄, 변환 174줄, patch 223줄, components 174줄. 각 페이지가 한 작업 목표를 맡음 |
| 축약 | 864 → 823줄. 반복 요약·apply 절차·표와 같은 답을 반복하는 YAML을 통합. 공통 base의 완전한 Deployment를 추가한 분량 포함 |
| 공유 | 기본 적용·QA patch·debug Component는 같은 base/api-depl.yaml·api-deployment·api를 사용. 변환의 그룹 구조와 mongo 라벨 삭제는 다른 랩 전제를 명시 |
| 보존 | 원본 외부 출처 URL 집합의 누락 0. resources 와일드카드·디렉터리 연결, 셸/설정 상대 경로, staging만 추가·기존 base 유지 조건 보존 |
| 변환 | commonLabels/labels selector 차이·불변성, 이름/namespace 변경 후 기존 리소스 잔존, newName 태그 유지·DB 마이그레이션 아님, 범위 밖 비변경 보존 |
| patch | 파일 path/필드 path, 방식/inline의 독립성, 배열 인덱스, name 병합·명시적 삭제, org 위치·selector 제약, JSON Pointer escape·블록 문자열 보존 |
| 선택 기능 | v1alpha1/Component, resources/components 구분, 부모 base 의존·중복 방지, 선택·미선택 비교, value/valueFrom 충돌, 해제 후 실제 ConfigMap 잔존·delete -k 금지 보존 |
| 문서 제약 | 내장/별도 CLI, create·api-resources·explain 한계, 문서에 없는 두 줄·삭제 지시자·components, 랩 채점 관찰의 한계와 시험/학습 출처 구분 보존 |
| 개념 덱 연결 | cka 16장의 base/overlay·변환·patch·실행·복구와 대조. generator·replicas·해시·Helm 비교는 개념 덱에 남겨 재복제하지 않음 |

단순 줄 수보다 명령의 전제·입력 파일·변경 범위와 완료 판정을 유지했는지를 우선한다.
각 페이지는 읽을 수 있는 본문이며, 전체를 하나의 실습 스크립트처럼 연속 적용하지 않는다.
