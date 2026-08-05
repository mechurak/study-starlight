# cka 덱의 기준 시점과 서술 원칙

`cka` 덱의 **배점·도메인·버전 표기·"이 기능은 없다"류 판단**을 고치기 전에 이 문서를 읽는다.
다른 덱에는 해당하지 않는다.

## 기준 시점과 출처

장 구성과 배점은 **CKA 커리큘럼 v1.35**를, 명령·API 버전은 **시험 환경 Kubernetes v1.35**를
기준으로 쓰여 있다. 2026-08-05에 아래 출처를 직접 조회해 확인했다.

- 커리큘럼 PDF: `github.com/cncf/curriculum` → `CKA_Curriculum_v1.35.pdf`
- 시험 환경/형식: `docs.linuxfoundation.org/tc-docs/certification/tips-cka-and-ckad`
- 열람 허용 사이트: `docs.linuxfoundation.org/tc-docs/certification/certification-resources-allowed`

**커리큘럼은 분기마다, 시험 환경 버전은 k8s 릴리스 후 4~8주 안에 바뀐다.**
배점·도메인·버전 표기를 고칠 때는 반드시 위 출처를 다시 조회할 것.
**"이 기능은 없다"는 판단도 kubernetes.io/docs를 직접 조회한 뒤에 내릴 것.**

## 현재 값과 쓰면 안 되는 옛 정보

| 항목 | 현재 | 옛 정보 (쓰면 안 됨) |
|---|---|---|
| 도메인 5종 | Troubleshooting 30% / Cluster Arch 25% / **Servicing and Networking** 20% / Workloads 15% / Storage 10% | 비중이 다른 옛 개정판 |
| 시험 형식 | **2시간, 15~20문항, 66%**, 노드는 `ssh <name>` + `sudo -i` | — |
| 시험 환경 | **Kubernetes v1.35**, `k` alias·bash 자동완성·`yq` 사전 설치 | 1.29/1.30 등 |
| 열람 허용 | kubernetes.io/docs · /blog · **helm.sh/docs** · **gateway-api.sigs.k8s.io** | GitHub·블로그(금지) |
| 커리큘럼 신규 항목 | **Gateway API로 Ingress 트래픽 관리**, Helm·Kustomize로 컴포넌트 설치, CRD·오퍼레이터, 워크로드 오토스케일링 | 이 항목들이 빠진 옛 자료 |
| 사이드카 | **네이티브 사이드카**(`initContainers` + `restartPolicy: Always`) v1.33 GA | `containers`에 나란히 두는 방식만 |
| Pod 리소스 변경 | **in-place resize v1.35 GA** (`--subresource=resize`, `resizePolicy`) | 재생성만 가능 |
| 컨테이너 런타임 | **containerd + `crictl`** | Docker / `docker` 명령 (v1.24에서 제거) |
| Pod 보안 | **Pod Security Admission**(네임스페이스 라벨) | PodSecurityPolicy (v1.25에서 제거) |
| 엔드포인트 | **EndpointSlice**가 실제 데이터 소스 | `Endpoints`만 |
| Gateway API | CRD 별도 설치. Standard 채널에 GatewayClass·Gateway·HTTPRoute·**GRPCRoute**(v1.4~), TCP/UDPRoute는 v1.6에서 GA | Ingress만 다루는 자료 |
| SA 토큰 | **TokenRequest 기반 수명 있는 projected 토큰**, `kubectl create token` | SA 생성 시 자동 생성되는 무기한 Secret |

## 유지할 서술 원칙

- 덱 전체의 축은 **"선언된 상태(spec)와 실제 상태(status)의 차이를 줄이는 루프"** — 0장과 20장이 이걸 감싼다
- 각 장이 **"실제로 무엇이 일어나는가" → 명령 → 함정** 순서로 간다
- 배점 순서와 학습 순서를 구분한다 — 트러블슈팅(30%)이 18장인 건 앞의 전부가 재료라서다
- 장 끝마다 요약 절. 19장은 치트시트, 20장은 장별 한 줄 요약 — **시험 직전에 이 둘만 봐도 되게** 유지한다
