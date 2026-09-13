# 1. CKA 실습 덱을 작업 단위로 개편

> 완료된 개편의 실행 기록이다. 아래 번호 예약·브라우저 검증 절차와 결과는 당시 기록으로 보존한다.
> 새 작업은 [콘텐츠 작성 규칙](../content-authoring.md)의 번호 없는 명명과
> [검증 지침](../verification.md)의 최소 검증을 따른다. 이 기록을 새 작업의 필수 절차로 적용하지 않는다.

상태: M0~M8 완료
지금 위치: 39개 작업 페이지 개편·최종 감사 완료.
실행 범위: M0~M8의 편집·검증·기록·묶음별 커밋 완료.
실행 모델: M0·M1은 Astra 완료. 이번 M2~M8은 Sol Medium.
작성일: 2026-09-12

사용자는 `cka`와 `cka-udemy`를 함께 보며 시험을 준비한다. 실습 덱의 긴 설명과 한 페이지에 섞인
여러 주제 때문에 이해와 재탐색이 어렵다. 원하는 결과는 **필요한 개념을 이해하고, 어떤 명령으로
풀며, 막히면 어떤 공식 문서를 찾아야 하는지 바로 연결되는 실습 노트**다.

이 문서는 [coding-agents의 작업 계획 가이드](../../src/content/docs/coding-agents/01-development-process.mdx)를
따른다. M0·M1을 수행하는 Astra 세션과 M2~M8을 수행할 Sol Medium 세션이 같은 파일로 인계한다.
페이지 내용의 영구 규칙은 개편 과정에서 `cka-udemy/_baseline.md`에 반영한다.

## 목표와 완료 조건

- [x] `cka`와 큰 분류·학습 순서가 대응하고 각 실습 첫머리에서 관련 개념 장으로 이동할 수 있다.
- [x] 각 페이지는 하나의 작업 목표를 설명한다. 독자가 처음 두 문단에서 할 일과 필요한 배경을 이해한다.
- [x] 각 작업에 직접 익힐 명령, 문서에서 찾을 예제·필드, 수정 후 성공 판정이 있다.
- [x] 긴 랩별 풀이를 대표 사례로 합치되, 서로 다른 실패 원인·검증 기준·복구 조건은 보존한다.
- [x] 기존 12개 본문의 모든 주요 절에 유지·이동·통합·학습 보충 중 하나의 처리가 기록된다.
- [x] 공식 커리큘럼 항목별로 실습 페이지 또는 `cka`의 개념 설명이 연결되고, 실습 미작성 항목은 표시된다.
- [x] 변경된 내부 링크·앵커·사이드바·DeckMap이 정상이고 `pnpm check`가 통과한다.
- [x] 명령 실행 여부와 문서 대조 여부를 구분해 기록한다. 빌드 통과를 Kubernetes 실습 성공으로 쓰지 않는다.

## 현황과 결정 이유

2026-09-12 작업 트리 기준 본문 12개, 총 7,291줄, 평균 약 608줄이다. 코드·표를 포함한 줄 수이므로
그 자체가 품질 점수는 아니지만, 주제 혼합과 함께 분할 대상을 찾는 근거가 된다.

| 확인한 곳 | 문제 | 개편 방향 |
|---|---|---|
| `10-troubleshooting.mdx` — 985줄 | metrics·HPA/VPA·앱·control plane·worker·네트워크가 한 페이지 | 오토스케일링을 Workloads로 이동, 장애는 관찰 대상별로 분리 |
| `12-kustomize.mdx` — 864줄 | resources·변환·patch·components·CLI·문서 제약이 겹침 | 기본 적용·변환·patch·선택 기능으로 분리하고 대표 예제 공유 |
| `08-security.mdx` — 831줄 | TLS·kubeconfig·RBAC·SA·이미지·admission이 연결됨 | 인증·권한·워크로드 신원·admission의 작업 목표 분리 |
| `_deck.mjs` | RBAC은 스토리지와 같은 그룹, troubleshooting은 클러스터 운영 그룹 | `cka`의 도메인 구조에 대응 |
| 각 장 말미 | 명령·영문 검색어·공식 링크는 이미 있음 | 해당 작업 옆으로 옮기고 무엇을 바꿀지·무엇으로 검증할지 명확화 |
| `index.mdx` | 제외 목록에 Control Plane/Worker Node Failure가 있지만 본문에는 복구 절이 있음 | 실제 내용에 맞게 개요·범위 설명 갱신, 낡은 실습 개수 나열 축소 |

**목차는 그룹과 주제 순서를 맞춘다. 장 번호와 페이지 개수는 각각의 읽기 목적에 맞춘다.**
`cka`의 한 개념 장에 실습 두세 페이지가 대응할 수 있다. 개념을 다시 길게 쓰지 않되,
처음 보는 실습을 수행하는 데 필요한 배경 두세 문장은 이 덱 안에서도 제공한다.

## 범위와 공통 계약

- 주 편집 범위: `src/content/docs/cka-udemy/`와 이 계획 파일.
- 연관 범위: 다른 덱에서 이동한 페이지를 가리키는 링크·라벨의 수정. `cka` 본문의 전면 개편은 별도 작업이다.
- 사이트 설정·공용 컴포넌트·스타일 변경, 새 실습 인프라 구축, 강의 전체 재수강·전사는 포함하지 않는다.
- 특정 랩의 리소스명·경로·정답 숫자는 일반 규칙으로 바꿔 쓰지 않는다. 재현에 필요한 대표 사례 하나에 남긴다.
- 기존 출처·유효한 사실을 잃지 않는다. 중복 문장은 합치고, 특수 사례는 관련 페이지의 짧은 보충이나 별도 보충 페이지로 옮긴다.
- 한 페이지 본문은 대략 150~300줄을 편집 목표로 삼는다. 절대 제한은 아니며 350줄을 넘으면 두 번째 작업 목표가 섞였는지 검토한다.
- 주제를 잘게 나눈 뒤 각 페이지의 서론·주의·요약을 반복해서 전체 분량을 다시 늘리지 않는다.
- 사용자는 검증된 작업 묶음마다 `main`에 커밋하는 것을 승인했다. 콘텐츠와 해당 계획·검증 기록을 같은 커밋에 포함한다. 큰 마일스톤은 독립적으로 검토 가능한 하위 묶음으로 커밋한다.
- 커밋 전 diff와 상태를 확인하고 현재 작업 파일만 명시적으로 담는다. 기존 사용자 변경은 임의로 포함하거나 되돌리지 않는다. 푸시는 하지 않는다.
- 마일스톤은 검증·인계 단위다. 전체 실행 중에는 단계·커밋마다 재승인을 요구하지 않고 다음 작업을 계속한다. 사용자 결정이 필요한 범위 변경이나 미허용 외부 쓰기만 확인한다.

## 목표 목차와 이관 지도

기초 → Workloads & Scheduling → Services & Networking → Storage → Cluster Architecture →
Troubleshooting → 시험 대비 순서로 둔다. 시험 소개는 index에서 `cka` 시험 안내로 연결한다.
그룹 id는 순서대로 `architecture`, `pods`, `services`, `storage`, `rbac`, `troubleshooting`,
`exam-strategy`를 사용한다. 배점은 반복해서 수기로 복제하지 않고 `cka`와 공식 커리큘럼을 참조한다.

아래는 **분할할 작업 목표와 원본의 대응표**다. 원본 파일명은 모두 `src/content/docs/cka-udemy/` 기준.
M1에서 실제 slug·순서를 확정하고 이 표에 기록한다. 페이지 수를 늘리기 위한 빈 페이지는 만들지 않는다.

| 원본 | 목적 그룹 | 분할·통합할 작업 목표 | 연결할 `cka` 장 |
|---|---|---|---|
| `01-basics.mdx` | 기초·Workloads | kubectl·namespace·YAML·Vim 기본 조작 / JSONPath 추출·정렬 / Pod 생성·상태 확인 | 3·4 |
| `02-workloads.mdx` | Workloads | ReplicaSet·Deployment 생성과 rollout·rollback / Job 완료·실패 | 5 |
| `03-pod-config.mdx` | Workloads | command·args 수정 / ConfigMap·Secret 주입 / init·sidecar 구성 / securityContext로 실행 권한 설정 | 4·6 |
| `04-scheduling.mdx` | Workloads | `04-scheduling`의 nodeName·selector·taint·affinity 배치 / `resource-limits`의 requests·limits·quota / `daemonset-static-pod`의 DaemonSet·static Pod 관리 | 7·6·5·4 |
| `10-troubleshooting.mdx`의 오토스케일러 | Workloads | HPA 설정·검증. VPA는 설치된 CRD를 읽는 보충 사례로 분리 | 8·17 |
| `05-services-dns.mdx` | Networking | `05-services-dns`의 Service·EndpointSlice / `dns`의 DNS·CoreDNS / `network-environment`의 노드·Pod·Service 대역과 CNI 확인. CNI 설치는 M7의 kubeadm과 연결 | 9·10·15·17 |
| `06-ingress-netpol.mdx` | Networking | `06-ingress-netpol`의 Ingress·TLS / `gateway`의 Gateway·HTTPRoute / `network-policy`의 NetworkPolicy 허용·차단 | 11·12 |
| `07-storage.mdx` | Storage | `07-storage`의 볼륨·정적 PV/PVC 연결 / `storage-class`의 StorageClass·동적 프로비저닝·quota | 13 |
| `08-security.mdx` | Cluster Architecture | `08-security`의 TLS·CSR·kubeconfig / `rbac`의 Role·Binding·can-i / `service-account`의 ServiceAccount·imagePullSecrets / `admission`의 요청 검사 | 14 |
| `09-cluster-lifecycle.mdx` | Cluster Architecture | `09-cluster-lifecycle`의 kubeadm 설치·클러스터 확인 / `cluster-upgrade`의 drain·업그레이드 / `etcd-backup-restore`의 etcd 백업·복구. cri-docker 패키지 절은 랩 환경 보충으로 표시 | 15 |
| `11-helm.mdx` | Cluster Architecture | `11-helm`의 repo·install·upgrade·rollback release 관리 흐름. 이미지 이전 사례는 짧은 보충 | 16 |
| `12-kustomize.mdx` | Cluster Architecture | resources·base/overlay·적용 / 범위별 변환 / patch / components 보충 | 16 |
| `10-troubleshooting.mdx`의 나머지 | Troubleshooting | `10-troubleshooting`의 metrics·앱 상태·로그 / `control-plane-failure` / `worker-failure` / `network-failure`. Service·DNS 정상 구성은 Networking을 참조 | 18 |
| 기존 검색 표·명령 요약 | 시험 대비 | 작업 → 첫 명령 → 검색어 → 해당 실습 페이지의 짧은 색인 | 19 |

`cka`의 CRD·operator·HA 등과 공식 커리큘럼을 대조하는 일은 M0에 남긴다. 제목이 없다는 이유만으로
강의 밖 대형 실습을 추가하지 않는다. 기존 Calico·VPA 사례에서 재사용할 수 있는 범위와 미작성 항목을 먼저 기록한다.

### 링크와 순서 이관

1. 각 작업 시작 시 원본 h2/h3와 들어오는 `/cka-udemy/…` 링크를 확인한다. 이동표에 원본 절 → 목적 파일·제목을 적는다.
2. 기존 URL은 원래 주제의 대표 작업에 최대한 유지한다. 새 페이지는 주제 중심 slug를 사용하고 파일명 숫자를 맞추려고 전부 rename하지 않는다.
3. 이동한 앵커를 가리키는 `_deck.mjs`·index·본문·다른 덱의 링크와 라벨을 같은 작업에서 바꾼다.
4. 외부 북마크가 있을 수 있는 옛 페이지를 없애야 한다면 이 계획에 사유와 호환 방식을 먼저 기록한다. 기본은 기존 페이지 유지다.
5. `sidebar.order`는 덱 전체에서 유일하게 예약한다. 제목의 표시 번호는 학습 순서에 맞추고 `cka` 번호는 개념 링크에 적는다.
6. 페이지를 추가할 때마다 index는 실제 존재하는 페이지만 연결한다. 계획된 미래 페이지로 링크를 만들지 않는다.

## 페이지 작성 계약

매번 큰 양식을 채우느라 장황해지지 않게 아래 요소를 짧게 유지한다. 단순 조회 페이지에 불필요한 YAML·복구 절을 만들지 않는다.

| 위치 | 독자가 얻을 것 | 편집 기준 |
|---|---|---|
| 첫머리 | `<Thesis>` 한 문장, 큰 그림·작업 목표, 관련 `cka` 링크 | 한 페이지가 답할 질문 하나 |
| 상황과 판단 | 문제 요구와 선택할 리소스·수정 위치 | 왜 그 방법인지 필요한 배경만 2~4문장 |
| 손으로 익힐 명령 | 자주 칠 명령과 핵심 옵션 | 주 명령 3~6개를 목표로, 긴 절차는 단계별로 설명 |
| 문서에서 찾을 것 | 검색 위치·영문 검색어·공식 페이지·페이지 내 검색어 | 작업 바로 옆에 1~3행. 가져올 블록과 바꿀 필드를 구체화 |
| 대표 실습 | 관찰 → 최소 수정 → 검증 | 대표 사례 하나, 다르게 판단해야 하는 변형만 추가 |
| 완료 판정 | 명령과 기대 출력·상태 | 오브젝트 존재와 실제 기능 성공을 구분 |
| 막혔을 때 | 증거에 따른 실패 분기·필요한 복구 | 흔한 원인 2~3개. 랩 특수 사정은 짧은 보충 |

처음부터 모든 YAML을 외우게 하지 않는다. `kubectl … --help`로 옵션을 확인할 것,
`kubectl explain …`으로 필드 위치를 찾을 것, 공식 예제에서 가져올 것을 명시한다.
명령 예제는 실행 위치·namespace·리소스명·파일 경로의 전제가 드러나야 한다.
불완전한 YAML은 “기존 파일의 해당 부분”이라고 표시하고 바로 apply할 완성본처럼 쓰지 않는다.

### 구체적인 작성 예: NetworkPolicy

목표: 같은 namespace의 `role=frontend` Pod에서 `role=db` Pod의 TCP 6379로만 접근하게 한다.
실제 페이지에서는 기존 정책·대상 라벨·CNI 지원을 먼저 확인하는 전제를 붙인다.

| 구분 | 남길 내용 |
|---|---|
| 익힐 명령 | `kubectl -n app get pods --show-labels`, `kubectl -n app get networkpolicy`, `kubectl explain networkpolicy.spec`, `kubectl apply -f policy.yaml` |
| 검색 위치·검색어 | Kubernetes 문서 내 검색에서 `Network Policies` |
| 열 문서·절 | [Network Policies — The NetworkPolicy resource](https://kubernetes.io/docs/concepts/services-networking/network-policies/#the-networkpolicy-resource) |
| 예제에서 수정 | namespace, 대상 `podSelector`, `policyTypes`, 허용 출발지 `ingress.from`, 포트. 예제의 불필요한 egress·ipBlock은 요구에 맞춰 제거 |
| 검증 | 테스트 도구가 있는 허용 Pod와 비허용 Pod에서 대상 TCP 포트로 각각 접속. 허용 성공·비허용 차단을 모두 확인하고 정책 전의 서비스 정상 동작과 비교 |

정책 오브젝트 생성만으로 통신 제어 성공을 판정하지 않는다. 지원하는 네트워크 플러그인이 필요하고,
기존 정책의 허용 규칙도 함께 작용한다는 조건을 [공식 문서](https://kubernetes.io/docs/concepts/services-networking/network-policies/)와 대조한다.
위 예시는 편집 형식을 보여 주는 설계 예이며 클러스터에서 실행한 검증 기록은 아니다.

### 시험 문서와 학습 자료 구분

2026-09-12 조회한 [LF 허용 자료 규정](https://docs.linuxfoundation.org/tc-docs/certification/certification-resources-allowed)에
따라 시험 VM에서 Kubernetes docs·blog, Helm docs, CKA의 Gateway API docs 및 문제별 Quick Reference를 사용할 수 있다.
Kubernetes 문서 내 검색은 가능하지만 외부 검색 결과를 열면 안 된다. 검색 안내는 일반 검색 엔진 사용을 전제하지 않는다.

- 시험용 표: 허용 사이트의 페이지를 직접 열어 제목·절·예제가 실제로 있는지 확인한다. 본문 예제를 사용하고 raw GitHub 링크를 일반 열람 경로로 안내하지 않는다.
- 학습용 출처: KodeKloud·GitHub·CNI 제품 문서 등을 따로 표시한다. 공식 프로젝트 자료여도 시험 일반 허용 목록에 자동 포함되는 것은 아니다.
- Quick Reference: 문제에서 제공할 때만 사용할 수 있는 경로로 설명한다. 특정 제품의 문서가 반드시 제공된다고 예측하지 않는다.
- 문서에 없는 표기: 찾을 수 있다고 꾸미지 않고 기억할 최소 문법·설치된 도구의 도움말·제공 자료 중 실제 가능한 대안을 쓴다.
- Kustomize의 별도 CLI, components, `$patch: delete`, `apiVersion`·`kind` 찾기 제약은 기존 설명의 유용한 구분을 보존한다.

[LF 시험 환경 안내](https://docs.linuxfoundation.org/tc-docs/certification/tips-cka-and-ckad)는 조회 당시 v1.35를 명시했다.
각 구현 세션에서 버전 민감한 API·도구 동작은 그때의 시험 환경과 공식 문서를 다시 대조한다.
기존 `cka/_baseline.md`의 모든 기능·버전 주장을 이번 계획 작성에서 재검증한 것은 아니다.

## 세션과 모델 분담

이번 실행은 Astra로 M0·M1을 완료한다. M1 뒤에는 멈추고 대표 페이지와 인계를 보고한다.
이후 사용자가 시작할 Sol Medium 세션이 M2~M8을 수행한다. 모델을 자동 전환하거나 M2를 시작하지 않는다.

| 역할 | 작업 |
|---|---|
| Astra 실행 세션 | M0 이관 계약·커버리지·번호 예약, M1 Kustomize 기준 예제, 검증·오류 수정·묶음별 커밋 |
| Sol Medium 후속 세션 | 완성된 M1과 baseline을 기준으로 M2~M8 편집·검증·오류 수정·묶음별 커밋 |
| 사용자 | 대표 페이지를 읽고 이해도·분량 피드백, 지정 랩에서 실제 출력 제공 |

사용자 피드백이 오면 반영하되, 각 단계에서 별도 검토 세션이나 사용자 응답을 기다리는 것을 기본 절차로 삼지 않는다.
병렬 에이전트는 기본 절차에 넣지 않는다. 공통 목차와 이동 링크를 함께 고치는 작업이 많아 순차 세션이 단순하다.

## 마일스톤

아래 각 하위 항목을 **검증·커밋의 기본 작업 묶음**으로 삼는다. 새 본문 1~3개가 적당하고,
더 많아지면 같은 마일스톤 안에서 묶음을 나눈다. 각 묶음을 편집 → 검증 → 오류 수정 → 기록 → 커밋한 뒤
다음 묶음을 계속한다. 세션이 중단되면 계획과 diff를 읽고 미완료 지점부터 재개한다.

### M0. 이관 계약 확정 — Astra

- [x] 공식 v1.35 PDF 본문 2쪽의 27항목과 두 덱을 대조했다. [커버리지·이관 계약](01-cka-udemy-migration.md)에 부분 실습·미작성 항목을 구분했다.
- [x] 같은 이관 계약에 39개 목적 파일·표시 번호·order와 원본 h2/h3 227개의 목적지를 기록했다.
- [x] `_baseline.md`에 작성 계약·시험용/학습용 출처와 분할·축약·보존 기준을 반영했다.
- 검증: 모든 기존 주요 절의 목적지가 있고, 미작성 커리큘럼 항목과 보충 항목이 구분되어 있다.

### M1. Kustomize 시범 개편

- 선행: M0의 이관 계약을 확정한다. M1 시범 결과로 조정이 필요하면 계약과 예약표를 함께 갱신한다.
- 원본: `12-kustomize.mdx` 전체, `cka/16-helm-kustomize.mdx`의 Kustomize 절.
- [x] M1a: 기존 `12-kustomize.mdx`에는 resources·base/overlay·미리보기·적용을 남긴다. `kustomize-transformers.mdx`로 범위별 이름·라벨·이미지 변환을, `kustomize-patches.mdx`로 특정 대상 수정·삭제를 옮긴다.
- [x] M1b: `kustomize-components.mdx`에 선택 기능 사례를 옮긴다. 해당 주제의 학습 보충임을 표시하고 필수 시험 출제라고 단정하지 않는다.
- [x] 예제의 디렉터리·리소스 이름을 되도록 공유하고, 동일한 미리보기 설명은 한 번 설명한 뒤 필요한 차이만 쓴다.
- [x] 공식 페이지에 실제 있는 예제와 별도로 익힐 문법을 구분한다. 기존 랩의 kind 채점 관찰을 일반 CKA 채점 규칙으로 확대하지 않는다.
- 검증: 기본 묶기·이미지 변경·patch·components 선택/미선택의 기존 정보가 보존된다. 문서만으로 파일 경로와 바꿀 필드를 판단할 수 있다. 공통 검증을 수행한다.
- 종료 조건: Astra가 분량·이해도·정보 보존을 검토하고 계약을 보정한다. M1 완료 후 대표 페이지와 Sol 인계를 보고하고 종료한다. M2는 후속 Sol Medium 실행에서 시작한다.

### M2. 기초와 Workloads

- [x] M2a: `01-basics`의 기본 조작·출력 추출·Pod 작업을 분리한다. Vim·도움말·YAML 생성으로 오는 `cka` 앵커 링크도 갱신한다.
- [x] M2b: `02-workloads`, `03-pod-config`를 목차 표대로 작업별로 이관한다. Deployment template 수정과 독립 Pod 재생성의 전제를 남긴다. 분량에 따라 검증·커밋 묶음을 나눈다.
- [x] M2c: `04-scheduling`을 배치·리소스·노드별 워크로드로 나눈다. 조건과 결과를 연결한다.
- [x] M2d: `10-troubleshooting`의 HPA/VPA를 이관한다. metrics 사전 조건과 기대 replica·상태를 남긴다.
- 검증: 생성 성공과 Ready·rollout·Job 완료·배치 결과가 구분된다. 네이티브 sidecar 등 버전 민감한 예제는 공식 문서 대조 기록을 남긴다.

### M3. Networking

- [x] M3a: `05-services-dns`에서 Service·DNS·네트워크 환경을 분리한다. CNI 설치와 M7의 연결 위치를 기록한다.
- [x] M3b: `06-ingress-netpol`을 Ingress·Gateway·NetworkPolicy로 분리한다.
- 검증: Service selector와 EndpointSlice, DNS 해석, 외부 HTTP 요청, NetworkPolicy 허용·차단 등 작업별 성공 증거가 있다. CNI·컨트롤러 설치 전제를 숨기지 않는다.

### M4. Storage

- [x] `07-storage`를 볼륨·정적 연결 / 동적 프로비저닝·quota로 나누고 이름만 다른 예제는 통합한다.
- 검증: PVC Bound와 Pod의 실제 마운트·읽기/쓰기를 구분한다. 바인딩 대기 조건·reclaimPolicy·quota에 따라 달라지는 판단을 보존한다.

### M5. 접근 제어

- [x] M5a: `08-security`에서 TLS·CSR·kubeconfig / RBAC을 분리한다. CSR 발급에서 권한 검증까지의 통합 사례는 중복 없이 한쪽에 둔다.
- [x] M5b: ServiceAccount·imagePullSecrets / admission을 분리한다. admission 특수 사례는 보충으로 분명히 표시한다.
- 검증: 인증 성공과 인가 성공을 구분하고 `can-i`의 허용·거부 양쪽을 설명한다. impersonation으로 확인한 범위를 실제 인증서 로그인 검증과 혼동하지 않는다.

### M6. Troubleshooting

- [x] M6a: `10-troubleshooting`의 남은 내용을 앱·metrics·로그 / control plane / worker로 분리한다.
- [x] M6b: 네트워크 장애를 별도 작업으로 정리한다. MySQL 이름·targetPort 사례는 Service 정상 구성과 중복을 줄인다.
- 검증: 증상 → 첫 관찰 → 증거별 수정 → 원래 워크로드 재검증이 이어진다. API 장애 시 노드·런타임 진입과 static Pod 복구의 파일·마운트 대조를 보존한다.

### M7. 클러스터 운영과 Helm

- [x] M7a: `09-cluster-lifecycle`을 설치 / drain·업그레이드 / etcd로 나눈다. `05-services-dns`의 CNI 설치 설명과 중복을 정리한다.
- [x] M7b: `11-helm`을 release 관리 흐름으로 축약하고 repo/chart/release/app 버전의 차이를 필요한 지점에 설명한다.
- 검증: kubeadm·etcd는 실행 세션이 버전·실행 노드·백업·복구 후 성공 조건을 직접 검토한다. Helm은 release 상태와 실제 workload 정상 동작을 모두 확인하도록 쓴다.

### M8. 전체 탐색·누락 검토와 마감

- [x] 실제 결과로 `_deck.mjs`·index의 설명·DeckMap을 정리하고 시험 대비의 짧은 작업 색인을 만든다.
- [x] M0의 커리큘럼·기존 절 이관표와 최종 페이지를 대조한다. 미작성 실습은 명시하고 완료했다고 숨기지 않는다.
- [x] 중복 설명·불필요한 보충·낡은 제외 목록·옛 장 번호·깨진 앵커를 검토한다.
- [x] 각 도메인의 대표 페이지 하나에서 “목표 파악 → 명령 선택 → 공식 예제 찾기 → 성공 판정”이 가능한지 확인한다.
- 검증: 마지막 변경에 대한 공통 검증. 이미 통과한 검사를 근거 없이 반복하지 않는다.
- 마감: `_baseline.md`에는 지속할 규칙, index에는 최종 읽는 법, 이 계획에는 결정·증거·남은 작업을 남긴다.

## 각 실행 세션의 검증과 인계

1. `AGENTS.md`, `docs/content-authoring.md`, `docs/verification.md`, 두 CKA baseline, 이 문서의 머리와 현재 묶음을 읽는다. 이미 읽은 파일은 범위·내용이 바뀔 때 다시 읽는다.
2. `git status --short`와 관련 diff를 보고 미완료 변경을 이어받는다. 현재 원본과 연결된 `cka` 절만 집중해서 읽는다.
3. 현재 묶음의 원본 절 → 목적 파일·제목 → 유지할 검증 조건을 적은 뒤 편집한다. 출처가 모호한 부분은 추측해 삭제하거나 새 사실을 만들지 않는다.
4. `pnpm check`로 콘텐츠 규칙·빌드·렌더된 내부 링크를 검사한다. 새 페이지·순서는 `pnpm preview`에서 사이드바·DeckMap을 확인하고, 추가한 표·컴포넌트는 390px 넘침을 확인한다. D2를 고치면 전용 지침과 검증을 적용한다.
5. 실습 검증은 사용 가능한 지정 랩에서만 수행한다. 연결된 임의 클러스터에 적용하지 않는다. 랩이 없으면 공식 문서 대조까지 진행하고 실제 실행 미검증을 기록한다.
6. 결과에 따라 체크박스와 아래 인계 기록·머리의 지금 위치를 갱신한다. 실패한 검사는 현재 변경에서 수정하고 재검증한다. 검증된 묶음과 기록을 함께 커밋하고 다음 묶음으로 이어간다.

복사해서 쓸 다음 세션 요청:

```text
/goal docs/plans/01-cka-udemy-rework.md의 남은 M2~M8을 Sol Medium으로 완료해 줘.
M0·M1은 완료되어 있으니 이관 계약과 baseline, Kustomize 시범을 먼저 읽어.

각 작업 묶음을 편집 → 검증 → 오류 수정 → 계획 기록 → 커밋한 뒤 다음 묶음으로 계속해.
M1 시범의 분할·축약·정보 보존 기준을 적용하고 사용자 피드백이 있으면 반영해.
단계나 커밋마다 승인을 다시 묻지 말고, 사용자 결정이 필요한 범위 변경만 확인해.

쉬운 설명과 하나의 작업 목표를 우선하고, 익힐 명령·공식 문서 검색 경로·완료 판정을 연결해.
중복은 줄이되 유용한 실패 판단과 검증 조건은 보존해.
계획의 완료 조건, pnpm check, 변경별 브라우저 검증을 충족해.
랩이 없으면 가능한 검증을 진행하고 실제 클러스터 실행 미검증은 명시해.

검증된 작업과 해당 계획 기록을 main에 묶음별로 커밋하고, 기존 사용자 변경은 보존해.
푸시는 하지 마. 중단되면 계획과 diff에서 재개할 수 있도록 현재 위치와 증거를 계속 갱신해.
M8까지 완료한 뒤 최종 결과와 남은 한계를 보고해.
```

검토 세션 요청:

```text
docs/plans/01-cka-udemy-rework.md의 현재 완료 묶음과 diff를 검토해 줘.
하나의 작업 목표, 쉬운 설명, 시험에서 찾을 수 있는 문서 경로, 명령의 전제와
완료 판정, 원본의 유용한 정보 보존을 확인해. 범위 안의 오류는 수정·검증하고
다음 작업 묶음과 남은 불확실성을 같은 계획에 기록해 줘.
```

## 진행·결정·검증 기록

| 날짜·묶음 | 변경·결정 | 검증 증거·미검증 | 다음 작업 |
|---|---|---|---|
| 2026-09-12 계획 | 기존 12개 본문 구조와 대표 절, 두 덱 metadata·baseline, coding-agents 계획 양식 확인. 이 계획 문서만 작성 | LF 허용 자료·시험 환경, OpenAI 모델 안내, NetworkPolicy 공식 문서 조회. 전체 기술 내용·커리큘럼 PDF 본문·클러스터 실행은 미검증. 저장소 검사 결과는 아래에 기록 | M1a 시범 개편 |
| 2026-09-12 실행 방침 확정 | 사용자 선택은 Sol Medium. 다음 세션에서 M0~M8 전체를 순차 실행하며 검증된 묶음마다 main에 커밋, 푸시는 하지 않음. 시범만 수행하는 옛 프롬프트와 모델 교체 제안을 대체 | 계획 문서만 변경. 저장소 검사 후 계획을 먼저 커밋 | 다음 세션에서 M0 시작 |

최종 검증 결과는 맨 아래 M8 기록을 따른다. 앞선 계획·M0~M7 검증은 각 묶음의 당시 기록이다.
영구 정본으로 승격한 내용: baseline의 페이지 작성·출처·분할·축약·보존·검증 구분 규칙.
남은 follow-up: 지정 랩에서의 실제 적용·앱 동작 검증은 별도다. 문서 개편 범위의 미완료 작업은 없다.


### M0 확정 근거와 M1 편집 판단

[이관 계약](01-cka-udemy-migration.md)이 원본 절과 번호의 정본이다. 파일명은 유지하고
완성 페이지의 order를 1010~1390에 예약해 미개편 페이지의 기존 order와 충돌하지 않게 했다.
분할 기준은 줄 수보다 작업 대상·입력·성공 판정의 차이다. 반복 명령·요약은 합치되 서로 다른
실패 원인·선택 범위·복구 조건·학습용 출처는 보존한다. 영구 규칙은 baseline에 함께 반영했다.

M0 문서 대조: 공식 PDF 본문 27항목, LF 시험 환경 v1.35·허용 자료를 2026-09-12 재조회했다.
원본 12개 본문 h2/h3 227개의 목적지가 있으며, HA·CSI 드라이버·operator 종합 실습 등은
개념 연결과 부분 사례로 구분했다. 새 대형 실습은 추가하지 않는다. 클러스터 실행은 하지 않았다.

M0 저장소 검증: `pnpm check` exit 0 — 371페이지 빌드·31,796개 내부 링크 통과.
`git diff --check` 통과. 계획·baseline만 변경하여 브라우저 검증은 해당하지 않는다.
M0 묶음은 이 기록과 함께 커밋한다. 다음 작업은 M1a다.


### M1a — 기본 적용·변환·patch (2026-09-13)

기존 URL은 기본 적용에 유지했다. 31~33장/order 1310~1330을 활성화하고 index·DeckMap을
실제 세 페이지로 연결했다. Components는 다음 M1b까지 기존 URL에 유지하므로 현재 기본 페이지는
411줄이며, 선택 기능을 옮긴 뒤 한 작업 목표로 줄인다. 변환 208줄·patch 248줄이다.

- 원본 단일 파일 목록과 하위 설정 참조의 차이를 보존했다. 공통 base의 api-deployment를 제공해
  QA patch와 다음 components가 같은 이름·경로를 사용한다. mongo 라벨 삭제는 별도 랩 전제를 명시했다.
- 공식 Kustomize·patch·diff·LF 문서와 Components·기본값 소스를 대조했다. Kubernetes 본문에
  apiVersion/kind·`$patch: delete`가 없고 `Json6902`·`includeSelectors` 예제가 있음을 확인했다.
- 로컬 kubectl v1.36.4 / 내장 Kustomize v5.8.1로 본문 YAML 블록을 추출해 렌더했다.
  base 1개, staging MySQL 추가·prod 비변경, caddy 교체, memcached만 삭제, Pod template org만 삭제,
  newName의 기존 태그 유지·nginx만 newTag·namespace·annotation 범위·selector 라벨을 확인했다.
  `commonLabels` deprecation 경고는 기존 랩 형식을 확인한 것으로 예상된 결과다.
- `pnpm check` exit 0: 373페이지·31,920개 내부 링크 통과. preview + Playwright에서 세 페이지의
  사이드바·DeckMap 링크와 390px main/문서 넘침 없음 확인. `git diff --check` 통과.
- 지정 랩 없음: 클러스터 diff·apply·get·rollout 및 실제 앱 동작은 실행하지 않았다.

다음 묶음은 M1b 선택 기능 이동과 시범 전체 검토·Sol 인계다.


### M1b — 선택 기능·시범 최종 검토 (2026-09-13)

Components를 학습 보충으로 옮기고 34장/order 1340을 활성화했다. M1 네 페이지의
공통 base·경로를 연결하고 반복 설명을 줄였다. 최종 252 / 174 / 223 / 174줄(총 823줄)이며
원본 864줄보다 41줄 줄었다. 완전한 공통 Deployment 입력을 추가한 분량도 포함한다.
정보 보존 판단은 [이관 계약의 M1 검토](01-cka-udemy-migration.md)에, 영구 기준은 baseline에 남겼다.

개념 원본 `cka/16-helm-kustomize`의 Kustomize 절도 대조했다. generator가 갱신하는 것은
Deployment 자체 이름이 아니라 내부 ConfigMap 참조 이름임을 바로잡고 기본 적용·patch 링크를 추가했다.
개념 덱의 나머지 본문·D2·구조는 이번 개편 대상이 아니다.

로컬 렌더는 M1a 항목에 더해 dev·staging의 Component/ConfigMap/환경변수 참조,
prod 미포함, 선택 해제 후 생성 YAML에서 리소스·참조 제거, `labels` 기본 selector 비변경과
`includeSelectors: true` 반영을 확인했다. 원본 외부 출처 URL 누락은 0개다.
로컬 도구는 kubectl v1.36.4 / Kustomize v5.8.1이며 시험 v1.35 클러스터에서의 실행 결과가 아니다.
실제 ConfigMap 삭제·rollout·앱 로그 변화는 실행하지 않았다.

### Sol Medium 인계 — M2부터 시작

1. `AGENTS.md`, 이 계획의 머리·M2, 두 baseline과 [이관 계약](01-cka-udemy-migration.md)을 읽는다.
   M0·M1을 다시 수행하지 않는다. 모델은 후속 사용자 선택인 **Sol Medium**이다.
2. 대표 기준은 `12-kustomize`의 공통 입력·완료 검증, `kustomize-patches`의 수정·삭제 조건,
   `kustomize-components`의 선택·미선택·해제 판정이다. 먼저 두 문단으로 할 일이 드러나는지 읽는다.
3. M2a에서 `01-basics`를 기본 조작·JSONPath·Pod로 나눈다. 기존 `/01-basics/` URL을 유지하고
   cka에서 들어오는 Vim·도움말·YAML 앵커를 같은 묶음에서 고친다. 예약 order 1010·1020·1030을 사용한다.
4. 그룹은 첫 소속 페이지가 생길 때 활성화한다. 현재 새 `rbac` 그룹에는 Kustomize 31~34장만 있다.
   기존 그룹은 그 묶음의 이관 때 정리한다. 지금의 번호 공백과 개편 전 그룹 혼재는 중간 상태다.
5. 이관표는 39개 최종 페이지를 예약했지만 비어 있는 미래 페이지를 만들지 않는다.
   범위·작업 목표가 달라 예약을 조정하면 표·본문·링크를 함께 고친다. 350줄을 넘으면 목표 혼합을 검토한다.
6. HA 전체 구축·독립 operator 종합 실습 등의 공백은 표시하고 개념을 연결한다.
   Calico·VPA 부분 사례를 전체 실습 커버리지로 부풀리거나 새 대형 랩을 추가하지 않는다.
7. `pnpm check`와 변경별 브라우저 검증을 통과한 묶음마다 계획과 함께 main에 커밋한다.
   지정 랩이 없으면 로컬 렌더·문서 대조와 실제 클러스터 실행 미검증을 구분한다. 푸시는 하지 않는다.

사용자 읽기 순서: 기본 적용 → patch를 먼저 읽고, 선택 기능을 구분한 방식은 components에서 확인한다.
이번 실행은 M1에서 종료한다. 위에 준비한 다음 세션 요청으로 M2~M8을 시작할 수 있다.

M1b 최종 검증: `pnpm check` exit 0 — 374페이지 빌드·31,994개 내부 페이지/앵커 링크 통과.
preview + Playwright로 네 페이지의 사이드바 31→32→33→34 순서·현재 페이지 표시,
DeckMap의 네 링크를 확인했다. 390px에서 네 페이지 모두 main scrollWidth/clientWidth와 문서 폭이
390/390으로 가로 넘침이 없었다. 이번 변경은 D2·스타일을 고치지 않아 그 전용 검증은 해당하지 않는다.
`git diff --check` 통과. 원본 커밋과 대조한 최종 감사에서 h2/h3 227개 누락 0,
39개 order 예약 중복 0, M1 네 페이지의 번호·group·order 일치, 외부 출처 19개 누락 0을 확인했다.
로컬 렌더 17개 판정 통과. 계획·baseline·콘텐츠·검증 기록을 M1b 묶음으로 커밋하며 푸시는 하지 않는다.


### M2a — kubectl 기본 조작·JSONPath·Pod (2026-09-13)

기존 `01-basics` URL에는 namespace·명령형 생성·도움말·dry-run·Vim을 남기고,
`jsonpath`와 `pods`를 새로 활성화했다. 예약한 1~3장/order 1010~1030과
`architecture`·`pods` 그룹을 적용하고 index·DeckMap·`cka` 3·4장의 손 연습 링크를 갱신했다.
미개편 2~4장은 M2b·M2c까지 기존 `basics` 그룹에 두므로 과도기 그룹을 명시했다.

- 분할 뒤 196 / 315 / 96줄이다. JSONPath의 목록 시작점·필터·정렬·열·파일 제출과
  VPA CRD 변형, Pod의 Ready·상태·Events·독립 Pod/소유 controller 조건을 보존했다.
- Kubernetes 공식 JSONPath·kubectl 출력·Pods·Pod lifecycle·set image·delete 문서를 대조했다.
  강제 삭제 설명은 API 서버가 노드 종료 확인을 기다리지 않는 조건으로 바로잡았다.
- 로컬 kubectl v1.36.4에서 반복 `--image` Deployment 뼈대 생성을 확인했다.
  `kubectl run --dry-run=client`는 discovery 캐시가 없는 로컬 환경에서 `localhost:8080` 연결 실패했다.
  지정 랩이 없어 Pod 생성·상태·JSONPath 출력은 실제 클러스터에서 실행하지 않았다.
- `pnpm check` exit 0 — 376페이지 빌드·32,148개 내부 페이지/앵커 링크 통과.
  preview + Playwright에서 DeckMap의 1→2→3 링크, 세 페이지 현재 항목과 390px
  main/문서 폭 390/390, console error 0을 확인했다. `git diff --check`도 통과했다.

다음 묶음은 M2b의 Deployment·Job과 command/args·ConfigMap/Secret 이관이다.


### M2b-1 — Deployment·Job (2026-09-13)

기존 `02-workloads` URL에는 ReplicaSet·Deployment 생성과 rollout·rollback을 남기고,
`jobs`를 5장/order 1050으로 분리했다. Deployment의 template 변경과 독립 Pod 수정의 차이를
M2a에서 이어 설명하고, Job은 terminal condition·소유 Pod·로그를 한 작업 흐름으로 묶었다.

- 분할 뒤 244 / 88줄이다. ReplicaSet template 변경 시 기존 Pod 비교체, selector 불변,
  Recreate의 rollingUpdate 블록 제거, 지정된 apply 방식, 실패한 새 ReplicaSet 추적·rollback을 보존했다.
  Job은 `Complete`·`Failed`, `DeadlineExceeded`·`BackoffLimitExceeded`, restartPolicy별 로그,
  실패 증거 보존 후 삭제·재생성 조건을 보존했다. 원본 외부 출처 누락은 0개다.
- Kubernetes 공식 ReplicaSet·Deployment·Jobs 문서를 대조했다. 현재 문서에서도 ReplicaSet은
  template을 바꿔도 기존 Pod을 맞추지 않고, Deployment는 `ProgressDeadlineExceeded`를 보고만 하며,
  Job의 terminal condition은 `Complete`와 `Failed`임을 확인했다.
- 로컬 kubectl v1.36.4로 `kubectl create job ... --dry-run=client -o yaml` 골격의
  `batch/v1`·command·`restartPolicy: Never`를 확인했다. 지정 랩이 없어 rollout·Job 실행은
  실제 클러스터에서 검증하지 않았다.
- `pnpm check` exit 0 — 377페이지 빌드·32,228개 내부 페이지/앵커 링크 통과.
  preview + Playwright에서 4·5장 현재 항목과 390px main/문서 폭 390/390,
  console error 0을 확인했다. `git diff --check`도 통과했다.

다음 묶음은 M2b-2의 command/args·ConfigMap/Secret·init/sidecar·securityContext 이관이다.


### M2b-2 — Pod 설정 네 작업 (2026-09-13)

기존 `03-pod-config` URL에는 소유자 판단과 command/args 수정을 남기고,
`configmap-secret`·`init-sidecar`·`security-context`를 활성화했다. 예약한 6~9장/order
1060~1090을 적용하고 DeckMap·`cka` 4·6장·시험 전략의 이동 앵커를 새 페이지로 갱신했다.

- 분할 뒤 106 / 167 / 292 / 73줄이다. 독립 Pod의 수정본 준비 후 재생성, Deployment template
  수정과 rollout, ConfigMap의 env/volume/`subPath` 반영 차이, Secret read-only 마운트,
  공유 `emptyDir`·Downward API·컨테이너별 로그, init 오타 복구, securityContext 수준별
  우선순위와 capability 위치를 보존했다. 원본 외부 출처 누락은 0개다.
- Kubernetes 공식 command/args·ConfigMap 갱신·Secret·Sidecar Containers·Init Containers·
  Security Context 문서를 대조했다. 네이티브 sidecar는 v1.33 Stable이며
  `initContainers` + 컨테이너 수준 `restartPolicy: Always`인 현행 구조를 확인했다.
- 완성 YAML 세 개를 로컬 YAML 파서로 읽어 Secret 이름, 세 컨테이너 이름,
  sidecar `restartPolicy`와 volume을 확인했다. 로컬 kubectl OpenAPI 검증은 discovery 대상
  클러스터가 없어 `localhost:8080` 연결 실패했다. 지정 랩이 없어 생성·rollout·로그·권한은
  실제 클러스터에서 검증하지 않았다.
- 첫 `pnpm check`는 옮긴 `cka` 앵커 두 개를 잘못 가리켜 실패했고 실제 제목으로 고쳤다.
  최종 `pnpm check` exit 0 — 380페이지 빌드·32,479개 내부 페이지/앵커 링크 통과.
  preview + Playwright에서 6~9장 현재 항목과 390px main/문서 폭 390/390,
  console error 0을 확인했다. `git diff --check`도 통과했다.

다음 묶음은 M2c의 Pod 배치·리소스 제한·DaemonSet과 static Pod 이관이다.


### M2c — 배치·리소스·노드별 워크로드 (2026-09-13)

기존 `04-scheduling` URL에는 nodeName·selector·taint·toleration·nodeAffinity 배치를 남기고,
`resource-limits`와 `daemonset-static-pod`를 11·12장/order 1110·1120으로 분리했다. 예약한
`pods` 그룹으로 모두 옮겨 과도기 `basics` 그룹을 제거하고 DeckMap·`cka` 7장·트러블슈팅의
DaemonSet 전략 링크를 갱신했다.

- 분할 뒤 183 / 155 / 152줄이다. nodeName의 스케줄러 우회·재생성, 라벨 후보와 taint 허용
  후보의 교집합, Pending Events, requests/limits와 OOMKilled, LimitRange의 새 Pod 주입,
  ResourceQuota의 ReplicaSet 거부, DaemonSet의 RollingUpdate·OnDelete 복구, static Pod의
  노드별 파일 원본·mirror Pod·kubelet 재시작 조건을 보존했다. 원본 외부 출처 누락은 0개다.
- Kubernetes 공식 Pod 배치·taint/toleration·LimitRange·ResourceQuota·DaemonSet 업데이트·
  static Pod 문서를 대조했다. toleration은 배치를 보장하지 않고, LimitRange는 admission 시점에
  적용되며, OnDelete는 템플릿 변경 뒤 기존 Pod을 자동 교체하지 않는다는 경계를 확인했다.
- YAML 코드 블록 여섯 개를 로컬 YAML 파서로 읽었고, kubectl v1.36.4로 DaemonSet에 쓸
  Deployment 골격의 kind·image를 확인했다. static Pod용 `kubectl run --dry-run=client`는 discovery
  대상 클러스터가 없어 `localhost:8080` 연결 실패했다. 지정 랩이 없어 배치·quota·rollout·
  static Pod 파일 감시는 실제 클러스터에서 실행하지 않았다.
- 첫 `pnpm check`는 새 페이지의 Thesis import 경로 오타로 실패했고 기존 덱 경로로 고쳤다.
  최종 `pnpm check` exit 0 — 382페이지 빌드·32,659개 내부 페이지/앵커 링크 통과.
  preview + Playwright에서 DeckMap의 10~12장 링크, 각 페이지 현재 항목과 390px
  main/문서 폭 390/390, console error 0을 확인했다. `git diff --check`도 통과했다.

다음 묶음은 M2d의 HPA 설정·검증과 VPA 보충 사례 이관이다.


### M2d — HPA 설정·VPA CRD 보충 (2026-09-13)

`10-troubleshooting`에는 metrics-server 설치와 `kubectl top`을 남기고, 오토스케일러 절을
`autoscaling` 13장/order 1130과 `vpa` 14장/order 1140으로 옮겼다. DeckMap과 `cka` 8장의
손 연습 링크를 분리하고, metrics 페이지에서 HPA 실습으로 이어지는 링크를 추가했다.

- 새 페이지는 150 / 153줄이고 기존 트러블슈팅 페이지는 855줄로 줄었다. HPA의 CPU·memory
  Utilization, min/max, 축소 안정화, `<unknown>` 실패 분기와 target/current/desired replica 판정을
  보존했다. VPA는 별도 CRD·컨트롤러가 필요한 학습 보충으로 표시하고 targetRef·Recreate·
  recommendation과 실제 새 Pod request, `RequestsOnly` 조건을 구분했다. 원본 외부 출처 누락은 0개다.
- Kubernetes 공식 HPA 개념·v2 API·resource metrics pipeline·VPA 문서를 대조했다. resource
  Utilization에는 해당 request가 필요하고, 안정화 창은 단순 지연 타이머가 아니며, VPA는 기본
  Kubernetes API가 아니라 별도 설치하는 CRD임을 확인했다. 최신 VPA mode를 시험 환경에 있다고
  가정하지 않고 설치된 CRD의 `kubectl explain`을 우선하도록 했다.
- HPA·VPA YAML 네 블록을 로컬 YAML 파서로 읽었다. 클러스터가 없어 API discovery·server-side
  dry-run, metrics 수집, replica 변경, VPA recommendation·Pod 재생성은 실행하지 않았다.
- `pnpm check` exit 0 — 384페이지 빌드·32,857개 내부 페이지/앵커 링크 통과.
  preview + Playwright에서 DeckMap의 13·14장 링크, 두 페이지 현재 항목과 390px
  main/문서 폭 390/390, console error 0을 확인했다. `git diff --check`도 통과했다.

M2의 1~14장과 order 1010~1140을 모두 활성화했다. 다음 묶음은 M3a의 Service·DNS·네트워크
환경 분리이며, CNI 설치는 M7 kubeadm과 연결하되 독립 전체 설치 실습으로 확대하지 않는다.


### M3a — Service·DNS·네트워크 환경 (2026-09-13)

기존 `05-services-dns` URL에는 Service 생성·selector·port·EndpointSlice 검증을 남기고,
`dns` 16장/order 1160과 `network-environment` 17장/order 1170을 만들었다. 새 `services`
그룹을 활성화하고 미개편 Ingress 페이지를 위한 `services-dns` 그룹은 과도기로 표시했다.
DeckMap·index·`cka` 9·10·15장과 트러블슈팅의 이동 앵커를 갱신했다.

- 분할 뒤 168 / 242 / 291줄이다. Service의 Pod 라벨·selector·targetPort·EndpointSlice와
  NodePort 실제 응답, Corefile의 ConfigMap→volume→mount·argument 사슬, namespace/FQDN·출력
  리다이렉트·Pod DNS와 실제 reachability 차이, 노드·Pod·Service CIDR의 설정 원본,
  runtime endpoint·CNI 설정/바이너리 경로, Calico의 문제 지정 버전·CIDR과 완료 판정을 보존했다.
  원본의 중복 문장 두 줄은 하나로 합쳤고 외부 출처 누락은 0개다.
- Kubernetes 공식 Service·EndpointSlice·DNS·DNS 디버깅·CNI·kubelet 파일 문서와 Calico 3.31
  operator 가이드를 대조했다. Endpoints 대신 EndpointSlice를 판정 원본으로 두고, CNI 바이너리
  설치와 실제 conflist 선택을 구분하며, Calico는 문제의 Quick Reference가 지정한 버전·CIDR을
  따르는 부분 랩임을 유지했다.
- Service YAML 블록을 로컬 YAML 파서로 읽었다. 지정 클러스터가 없어 expose·EndpointSlice·DNS
  조회, IP 대역·CNI 파일 확인, Calico 설치와 외부 HTTP 요청은 실행하지 않았다.
- `pnpm check` exit 0 — 386페이지 빌드·33,049개 내부 페이지/앵커 링크 통과.
  preview + Playwright에서 DeckMap의 15~17장 링크, 세 페이지 현재 항목과 390px
  main/문서 폭 390/390, console error 0을 확인했다. `git diff --check`도 통과했다.

다음 묶음은 M3b의 Ingress·TLS, Gateway·HTTPRoute, NetworkPolicy 허용·차단 분리다.


### M3b — Ingress·Gateway·NetworkPolicy (2026-09-13)

기존 `06-ingress-netpol` URL에는 Ingress 규칙·컨트롤러·TLS와 외부 요청 검증을 남기고,
`gateway` 19장/order 1190과 `network-policy` 20장/order 1200을 만들었다. 모든 페이지를
`services` 그룹으로 옮겨 과도기 `services-dns` 그룹을 제거하고 DeckMap·`cka` 11·12장 링크를
작업별 페이지로 갱신했다.

- 분할 뒤 302 / 204 / 196줄이다. Ingress 리소스와 컨트롤러 구분·default backend·TLS Secret·
  실제 Host/path 요청, Gateway API CRD와 구현체 구분·listener·parentRefs·attachment 조건,
  NetworkPolicy의 선택 방향·additive 허용·빈 규칙·DNS UDP/TCP 53과 허용/차단 요청을 보존했다.
  원본 외부 출처 누락은 0개다.
- Kubernetes 공식 Ingress·Gateway API·NetworkPolicy 문서와 Gateway API 가이드를 대조했다.
  Ingress는 컨트롤러가 필요하고, Gateway API는 add-on CRD와 구현체가 모두 필요하며,
  NetworkPolicy는 구현 CNI가 있어야 효력이 나고 source egress와 destination ingress가 모두
  허용해야 연결된다는 전제를 완료 판정에 반영했다.
- Ingress·Gateway·NetworkPolicy YAML 여섯 블록을 로컬 YAML 파서로 읽었다. 지정 클러스터가 없어
  API/구현체 discovery, server-side dry-run, TLS·Gateway·허용/차단 실제 요청은 실행하지 않았다.
- `pnpm check` exit 0 — 388페이지 빌드·33,247개 내부 페이지/앵커 링크 통과.
  preview + Playwright에서 DeckMap의 18~20장 링크, 세 페이지 현재 항목과 390px
  main/문서 폭 390/390, console error 0을 확인했다. `git diff --check`도 통과했다.

M3의 15~20장과 `services` 그룹을 모두 활성화했다. 다음 묶음은 M4의 볼륨·정적 PV/PVC와
StorageClass·동적 프로비저닝·quota 분리다.


### M4 — 볼륨·정적/동적 스토리지 (2026-09-13)

기존 `07-storage` URL에는 hostPath와 정적 PV/PVC 연결을 남기고, `storage-class`를
22장/order 1220으로 분리했다. DeckMap·`cka` 13장·시험 전략의 기본 StorageClass 앵커를
갱신하고 NetworkPolicy 다음 이동과 보안 페이지 연결을 21→22→23 순서로 맞췄다.

- 분할 뒤 360 / 267줄이다. 정적 페이지는 hostPath와 PV/PVC라는 두 입력이지만 모두 “준비된
  저장소를 Pod에 실제 mount해 읽고 쓰기”라는 하나의 완료 목표라 함께 유지했다. 350줄을 넘어서
  h2/h3와 반복을 재검토했으며, 서로 다른 hostPath 권한·NFS·access mode·reclaim·alpha-mysql
  실패 조건을 삭제하지 않는 편이 정보 보존에 유리하다고 판단했다.
- StorageClass 페이지에는 기존 class 요청·WaitForFirstConsumer 소비 Pod·no-provisioner class·
  기본 class/확장 허용, 동적 provisioner 추적과 storage quota를 묶었다. Bound와 실제 mount,
  정적/동적 생성 주체, 정상 Pending과 provisioner 실패를 분리했다. 원본 외부 출처 누락은 0개다.
- Kubernetes 공식 Persistent Volumes·Storage Classes·dynamic provisioning·ResourceQuota 문서를
  대조했다. `no-provisioner`는 PV를 만들지 않고, WaitForFirstConsumer에서 `nodeName`으로
  스케줄러를 우회하면 PVC가 Pending이며, quota는 실제 파일 사용량이 아니라 PVC 요청량을 센다는
  경계를 확인했다.
- YAML 열한 블록을 로컬 YAML 파서로 읽었다. 지정 클러스터와 스토리지 백엔드가 없어 PV/PVC
  바인딩·NFS helper·동적 provisioner·mount 읽기/쓰기·quota 거부는 실행하지 않았다.
- `pnpm check` exit 0 — 389페이지 빌드·33,348개 내부 페이지/앵커 링크 통과.
  preview + Playwright에서 DeckMap의 21·22장 링크, 두 페이지 현재 항목과 390px
  main/문서 폭 390/390, console error 0을 확인했다. `git diff --check`도 통과했다.

다음 묶음은 M5의 TLS·CSR·kubeconfig, Role·Binding, ServiceAccount·imagePullSecrets,
admission 요청 검사 분리다.


### M5 — TLS·RBAC·워크로드 신원·admission (2026-09-13)

기존 `08-security` URL에는 인증서 역할·CSR·kubeconfig와 TLS부터 저장까지의 요청 경계를
남기고, `rbac`·`service-account`·`admission`을 24~26장/order 1240~1260으로 분리했다.
`storage` 그룹 이름에서 보안을 제거하고 네 페이지를 `rbac` 그룹에 연결했으며 DeckMap과
`cka` 14·19장의 이동 앵커를 갱신했다.

- 분할 뒤 360 / 307 / 148 / 146줄이다. 인증서의 서버·클라이언트·CA 역할, CSR 승인과 발급,
  kubeconfig의 CA 검증과 실제 요청, Role·ClusterRole 범위, ServiceAccount projected token,
  imagePullSecret, 내장 플러그인과 webhook의 거부·변형 판정을 보존했다. 원본 외부 출처 누락은 0개다.
- john-developer 통합 사례는 RBAC 페이지 한 곳에만 두었다. 관리자의 `--as=john`은 인가 결정
  검사일 뿐 인증서 로그인이 아님을 명시하고, 발급 인증서를 넣은 전용 kubeconfig의
  `auth whoami`와 허용·거부 `can-i`를 별도 완료 증거로 추가했다.
- 2025 admission 두 랩은 일반 리소스 작성법이 아닌 보충 사례로 표시했다. Kubernetes 공식
  PKI·CSR·kubeconfig·RBAC·ServiceAccount·private registry·admission·dynamic webhook 문서를
  대조했고 webhook Service 인증서 이름, `caBundle`, rules와 실패 분기를 완료 기준에 반영했다.
- 지정 클러스터가 없어 CSR 승인·인증서 로그인·인가 판정·토큰 발급·image pull·API 서버 재시작·
  webhook 거부/변형은 실행하지 않았다. `pnpm check` exit 0 — 392페이지 빌드·33,672개 내부
  페이지/앵커 링크 통과. dev + Playwright에서 DeckMap의 23~26장 링크, 네 페이지 현재 항목과
  390px main/문서 폭 390/390을 확인했다. `git diff --check`도 통과했다.

다음 묶음은 M6a의 앱·metrics·로그, control plane, worker 트러블슈팅 분리다.


### M6 — 관찰 대상별 트러블슈팅 (2026-09-13)

기존 `10-troubleshooting` URL에는 metrics-server·`top`·애플리케이션 로그와 상태별 진입점을
남기고, `control-plane-failure`·`worker-failure`·`network-failure`을 36~38장/order
1360~1380으로 분리했다. `troubleshooting` 그룹을 활성화하고 DeckMap·`cka` 18장과
MySQL 이동 앵커를 새 목적지로 갱신했다.

- 분할 뒤 178 / 250 / 233 / 302줄이다. Pod 생성·노드 배정 경계, static Pod 명령·kubeconfig·
  hostPath 오류, kubelet 중지·CA·API 서버 주소 오류, Service 이름·targetPort, CNI 초기화와
  kube-proxy ConfigMap 경로 오류를 각각 “첫 증거 → 최소 수정 → 원래 기능” 흐름으로 보존했다.
  원본 외부 출처 누락은 0개다.
- Service 정상 구성과 DNS 계층 검증은 15·16장을 참조하게 하고 38장에는 실패 판정만 남겼다.
  CNI 누락만으로 Flannel을 선택하지 않고 문제 지시나 기존 설치 근거가 필요하다는 조건,
  컴포넌트 Running이 아니라 처음 실패한 앱 요청까지 복구해야 한다는 완료 기준을 유지했다.
- Kubernetes 공식 resource metrics pipeline·logging·Pod/Service debug·cluster troubleshooting·
  crictl·static Pod·kubelet config 문서를 대조했다. 지정 클러스터가 없어 metrics 수집,
  static Pod·kubelet 수정, Service/EndpointSlice·CNI·kube-proxy와 앱 연결은 실행하지 않았다.
- `pnpm check` exit 0 — 395페이지 빌드·34,016개 내부 페이지/앵커 링크 통과. 첫 dev 확인은
  새 topic을 반영하지 못한 장기 실행 서버 캐시 때문에 세 새 slug가 실패했고, 서버 재시작 뒤
  Playwright에서 DeckMap의 35~38장 링크, 네 페이지 현재 항목과 390px main/문서 폭 390/390을
  확인했다. `git diff --check`도 통과했다.

다음 묶음은 M7a의 kubeadm 설치·확인, drain·업그레이드, etcd 백업·복구 분리다.


### M7 — 클러스터 운영과 Helm (2026-09-13)

기존 `09-cluster-lifecycle` URL에는 노드 사전 조건·kubeadm init/join·CNI와 end-to-end 설치
검증을 남기고, `cluster-upgrade`·`etcd-backup-restore`를 28·29장으로 분리했다.
`11-helm`은 30장으로 갱신하고 네 페이지를 `rbac` 그룹에 연결해 과도기
`cluster-lifecycle` 그룹을 제거했다. DeckMap과 `cka` 15장 링크도 27~30장 순서로 맞췄다.

- 분할·축약 뒤 289 / 211 / 266 / 315줄이다. kubeadm의 커널·런타임·패키지·init/join,
  CNI CIDR과 NodePort 요청, drain의 DaemonSet·단독 Pod, control plane `upgrade apply`와
  worker `upgrade node`, 패키지/Node 버전, etcd endpoint·TLS·snapshot status·stacked/external
  전환과 복구 후 리소스 검증을 보존했다. 원본 외부 출처 누락은 0개다.
- cri-dockerd 설치는 제공된 deb를 쓰는 랩 환경 보충으로 표시했다. CNI 설치는 27장의
  pod CIDR·Ready·통신 완료에만 두고, 런타임 endpoint와 CNI 경로 탐색은 17장을 연결했다.
  Helm의 Bitnami 이미지 이전은 당시 랩 환경 보충으로 줄이고 repo/chart/release,
  CHART VERSION/APP VERSION, release/workload 두 검증 층을 본 흐름에 남겼다.
- 현재 공식 kubeadm v1.35 업그레이드·etcd 운영 문서와 Helm 명령 레퍼런스를 대조했다.
  etcd 복원은 현행 `etcdutl --data-dir … snapshot restore …` 형태로 맞췄다. 지정 클러스터와
  Helm 랩이 없어 init/join/CNI·업그레이드·snapshot/restore·release 동작은 실행하지 않았다.
- `pnpm check` exit 0 — 397페이지 빌드·34,259개 내부 페이지/앵커 링크 통과. dev 서버를
  새 topic 기준으로 재시작한 뒤 Playwright에서 DeckMap의 27~30장 링크, 네 페이지 현재 항목과
  390px main/문서 폭 390/390을 확인했다. `git diff --check`도 통과했다.

다음 묶음은 M8의 작업별 시험 검색 색인, index·baseline·이관 계약 감사와 전체 최종 검증이다.


### M8 — 작업 색인·이관 감사·마감 (2026-09-13)

`exam-search`를 39장/order 1390으로 추가해 앞의 38개 실습을 작업·첫 관찰 명령·공식 문서
검색어로 연결했다. index에는 처음 읽기와 문제 중 찾기의 두 경로, 네 단계 사용법,
원본 풀이에서 직접 쓰지 않은 문서와 독립 실습이 없는 커리큘럼 범위를 분리해 기록했다.
`_baseline.md`에는 인증/인가, 오브젝트/기능, 컴포넌트/원래 요청의 완료 경계와
최종 번호·색인 유지 규칙을 승격했다.

- 원본 기준 커밋 `a125ab6`의 12개 본문 h2/h3 227개와 이관 계약을 대조했고 모든 절에
  유지·이동·통합·학습 보충 처리가 있다. 원본 외부 URL 271개와 최종 덱을 집합 비교해 누락 0개를
  확인했다. 최종 39개 페이지는 번호 1~39, order 1010~1390이 연속·유일하고 모두 Thesis와
  DeckMap 목적지를 가진다.
- Workloads의 Deployment, Networking의 Service, Storage의 StorageClass, Cluster Architecture의
  RBAC, Troubleshooting의 control plane 대표 페이지를 감사했다. 모두 첫머리 목표, 관찰·수정 명령,
  공식 문서 절, 실제 기능 완료 판정이 이어진다.
- HA control plane 전체 구축, CSI 드라이버 설치, 독립 operator 종합 설치, probes 전용 실습,
  LoadBalancer 외부 IP, Helm/Kustomize 기반 클러스터 컴포넌트 설치는 개념 연결만 있고 독립
  end-to-end 실습은 없음을 index와 이관 계약에 남겼다.
- 최종 `pnpm check` exit 0 — 398페이지 빌드·34,435개 내부 페이지/앵커 링크 통과.
  dev 서버를 새 topic 기준으로 재시작하고 Playwright로 index의 두 진입 링크, DeckMap의 39장,
  색인의 38개 작업 행·현재 사이드바 항목을 확인했다. 390px에서 index와 색인 모두
  main/문서 폭 390/390으로 넘침이 없었다. `git diff --check`도 통과했다.
- 지정 Kubernetes·Helm 랩은 제공되지 않아 M2~M8의 실제 생성·수정·복구·앱 요청은 실행하지
  않았다. 각 묶음 기록에서 로컬 YAML·kubectl/Kustomize 렌더, 공식 문서 대조와 클러스터
  미검증을 분리했다.

M0~M8 문서 개편 범위는 완료됐다. 후속 작업은 지정 랩이 있을 때의 실제 실행 검증뿐이다.
