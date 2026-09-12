# 1. CKA 실습 덱을 작업 단위로 개편

상태: 실행 준비 완료
지금 위치: 계획과 실행 방침 확정. 다음 세션에서 M0부터 M8까지 순차 실행한다.
실행 범위: 전체 완료. 현재 세션은 계획 정리·커밋과 다음 세션 프롬프트 준비까지이며, 본문 개편은 다음 세션의 `/goal`로 시작한다.
실행 모델: 사용자가 선택한 Sol Medium.
작성일: 2026-09-12

사용자는 `cka`와 `cka-udemy`를 함께 보며 시험을 준비한다. 실습 덱의 긴 설명과 한 페이지에 섞인
여러 주제 때문에 이해와 재탐색이 어렵다. 원하는 결과는 **필요한 개념을 이해하고, 어떤 명령으로
풀며, 막히면 어떤 공식 문서를 찾아야 하는지 바로 연결되는 실습 노트**다.

이 문서는 [coding-agents의 작업 계획 가이드](../../src/content/docs/coding-agents/01-development-process.mdx)를
따른다. 계획을 세운 세션과 실제 편집·검토를 수행하는 Sol Medium 세션이 같은 파일로 인계한다.
페이지 내용의 영구 규칙은 개편 과정에서 `cka-udemy/_baseline.md`에 반영한다.

## 목표와 완료 조건

- [ ] `cka`와 큰 분류·학습 순서가 대응하고 각 실습 첫머리에서 관련 개념 장으로 이동할 수 있다.
- [ ] 각 페이지는 하나의 작업 목표를 설명한다. 독자가 처음 두 문단에서 할 일과 필요한 배경을 이해한다.
- [ ] 각 작업에 직접 익힐 명령, 문서에서 찾을 예제·필드, 수정 후 성공 판정이 있다.
- [ ] 긴 랩별 풀이를 대표 사례로 합치되, 서로 다른 실패 원인·검증 기준·복구 조건은 보존한다.
- [ ] 기존 12개 본문의 모든 주요 절에 유지·이동·통합·학습 보충 중 하나의 처리가 기록된다.
- [ ] 공식 커리큘럼 항목별로 실습 페이지 또는 `cka`의 개념 설명이 연결되고, 실습 미작성 항목은 표시된다.
- [ ] 변경된 내부 링크·앵커·사이드바·DeckMap이 정상이고 `pnpm check`가 통과한다.
- [ ] 명령 실행 여부와 문서 대조 여부를 구분해 기록한다. 빌드 통과를 Kubernetes 실습 성공으로 쓰지 않는다.

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
| `04-scheduling.mdx` | Workloads | nodeName·selector·taint·affinity 배치 / requests·limits·quota / DaemonSet·static Pod 관리 | 7·6 |
| `10-troubleshooting.mdx`의 오토스케일러 | Workloads | HPA 설정·검증. VPA는 설치된 CRD를 읽는 보충 사례로 분리 | 8·17 |
| `05-services-dns.mdx` | Networking | Service·EndpointSlice / DNS·CoreDNS / 노드·Pod·Service 대역과 CNI 확인. CNI 설치는 M7의 kubeadm과 연결 | 9·10·15 |
| `06-ingress-netpol.mdx` | Networking | Ingress·TLS / Gateway·HTTPRoute / NetworkPolicy 허용·차단 | 11·12 |
| `07-storage.mdx` | Storage | 볼륨·정적 PV/PVC 연결 / StorageClass·동적 프로비저닝·quota | 13 |
| `08-security.mdx` | Cluster Architecture | TLS·CSR·kubeconfig / Role·Binding·can-i / ServiceAccount·imagePullSecrets / admission | 14 |
| `09-cluster-lifecycle.mdx` | Cluster Architecture | kubeadm 설치·클러스터 확인 / drain·업그레이드 / etcd 백업·복구. cri-docker 패키지 절은 랩 환경 보충으로 표시 | 15 |
| `11-helm.mdx` | Cluster Architecture | repo·install·upgrade·rollback의 한 release 관리 흐름. 이미지 이전 사례는 짧은 보충 | 16 |
| `12-kustomize.mdx` | Cluster Architecture | resources·base/overlay·적용 / 범위별 변환 / patch / components 보충 | 16 |
| `10-troubleshooting.mdx`의 나머지 | Troubleshooting | metrics·앱 상태·로그 / control plane / worker / 네트워크 장애. Service·DNS 정상 구성은 Networking을 참조 | 18 |
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

사용자가 Sol Medium을 선택한 상태에서 전체 계획을 `/goal`로 실행한다.
편집과 단계별 검토를 같은 실행 세션에서 수행하고, 모델을 임의로 바꾸지 않는다.

| 역할 | 작업 |
|---|---|
| 계획 세션 | 현황 조사, 개편 방향·이관 지도·완료 조건 작성과 인계 |
| Sol Medium 실행 세션 | M0에서 목차·이관 계약 확정, M1~M8 편집·출처 확인·검증·오류 수정·커밋. 시범 결과와 버전 민감한 절차를 직접 검토 |
| 사용자 | 실제 학습에서 설명이 이해되는지, 문서 검색이 도움이 되는지 피드백. 랩에서 실행할 때 실제 출력 제공 |

사용자 피드백이 오면 반영하되, 각 단계에서 별도 검토 세션이나 사용자 응답을 기다리는 것을 기본 절차로 삼지 않는다.
병렬 에이전트는 기본 절차에 넣지 않는다. 공통 목차와 이동 링크를 함께 고치는 작업이 많아 순차 세션이 단순하다.

## 마일스톤

아래 각 하위 항목을 **검증·커밋의 기본 작업 묶음**으로 삼는다. 새 본문 1~3개가 적당하고,
더 많아지면 같은 마일스톤 안에서 묶음을 나눈다. 각 묶음을 편집 → 검증 → 오류 수정 → 기록 → 커밋한 뒤
다음 묶음을 계속한다. 세션이 중단되면 계획과 diff를 읽고 미완료 지점부터 재개한다.

### M0. 이관 계약 확정 — 계획·검토 모델

- [ ] [공식 커리큘럼](https://github.com/cncf/curriculum)의 현재 PDF 본문과 두 덱을 대조해 커버리지 표 작성. 이번 조회에서는 v1.35 PDF 파일 위치만 확인했고 PDF 본문은 확인하지 못했다.
- [ ] 위 목차의 파일명·표시 번호·order 예약표를 작성한다. 각 원본 주요 절의 목적지를 기록한다.
- [ ] 본문 개편을 시작할 때 `_baseline.md`에 페이지 작성 계약·시험용/학습용 출처 규칙을 반영한다.
- 검증: 모든 기존 주요 절의 목적지가 있고, 미작성 커리큘럼 항목과 보충 항목이 구분되어 있다.

### M1. Kustomize 시범 개편

- 선행: M0의 이관 계약을 확정한다. M1 시범 결과로 조정이 필요하면 계약과 예약표를 함께 갱신한다.
- 원본: `12-kustomize.mdx` 전체, `cka/16-helm-kustomize.mdx`의 Kustomize 절.
- [ ] M1a: 기존 `12-kustomize.mdx`에는 resources·base/overlay·미리보기·적용을 남긴다. `kustomize-transformers.mdx`로 범위별 이름·라벨·이미지 변환을, `kustomize-patches.mdx`로 특정 대상 수정·삭제를 옮긴다.
- [ ] M1b: `kustomize-components.mdx`에 선택 기능 사례를 옮긴다. 해당 주제의 학습 보충임을 표시하고 필수 시험 출제라고 단정하지 않는다.
- [ ] 예제의 디렉터리·리소스 이름을 되도록 공유하고, 동일한 미리보기 설명은 한 번 설명한 뒤 필요한 차이만 쓴다.
- [ ] 공식 페이지에 실제 있는 예제와 별도로 익힐 문법을 구분한다. 기존 랩의 kind 채점 관찰을 일반 CKA 채점 규칙으로 확대하지 않는다.
- 검증: 기본 묶기·이미지 변경·patch·components 선택/미선택의 기존 정보가 보존된다. 문서만으로 파일 경로와 바꿀 필드를 판단할 수 있다. 공통 검증을 수행한다.
- 다음 결정: Sol 실행 세션이 분량·이해도·기술적 누락을 검토하고 작성 계약을 조정한 뒤 M2로 이어간다. 사용자 피드백이 오면 반영한다.

### M2. 기초와 Workloads

- [ ] M2a: `01-basics`의 기본 조작·출력 추출·Pod 작업을 분리한다. Vim·도움말·YAML 생성으로 오는 `cka` 앵커 링크도 갱신한다.
- [ ] M2b: `02-workloads`, `03-pod-config`를 목차 표대로 작업별로 이관한다. Deployment template 수정과 독립 Pod 재생성의 전제를 남긴다. 분량에 따라 검증·커밋 묶음을 나눈다.
- [ ] M2c: `04-scheduling`을 배치·리소스·노드별 워크로드로 나눈다. 조건과 결과를 연결한다.
- [ ] M2d: `10-troubleshooting`의 HPA/VPA를 이관한다. metrics 사전 조건과 기대 replica·상태를 남긴다.
- 검증: 생성 성공과 Ready·rollout·Job 완료·배치 결과가 구분된다. 네이티브 sidecar 등 버전 민감한 예제는 공식 문서 대조 기록을 남긴다.

### M3. Networking

- [ ] M3a: `05-services-dns`에서 Service·DNS·네트워크 환경을 분리한다. CNI 설치와 M7의 연결 위치를 기록한다.
- [ ] M3b: `06-ingress-netpol`을 Ingress·Gateway·NetworkPolicy로 분리한다.
- 검증: Service selector와 EndpointSlice, DNS 해석, 외부 HTTP 요청, NetworkPolicy 허용·차단 등 작업별 성공 증거가 있다. CNI·컨트롤러 설치 전제를 숨기지 않는다.

### M4. Storage

- [ ] `07-storage`를 볼륨·정적 연결 / 동적 프로비저닝·quota로 나누고 이름만 다른 예제는 통합한다.
- 검증: PVC Bound와 Pod의 실제 마운트·읽기/쓰기를 구분한다. 바인딩 대기 조건·reclaimPolicy·quota에 따라 달라지는 판단을 보존한다.

### M5. 접근 제어

- [ ] M5a: `08-security`에서 TLS·CSR·kubeconfig / RBAC을 분리한다. CSR 발급에서 권한 검증까지의 통합 사례는 중복 없이 한쪽에 둔다.
- [ ] M5b: ServiceAccount·imagePullSecrets / admission을 분리한다. admission 특수 사례는 보충으로 분명히 표시한다.
- 검증: 인증 성공과 인가 성공을 구분하고 `can-i`의 허용·거부 양쪽을 설명한다. impersonation으로 확인한 범위를 실제 인증서 로그인 검증과 혼동하지 않는다.

### M6. Troubleshooting

- [ ] M6a: `10-troubleshooting`의 남은 내용을 앱·metrics·로그 / control plane / worker로 분리한다.
- [ ] M6b: 네트워크 장애를 별도 작업으로 정리한다. MySQL 이름·targetPort 사례는 Service 정상 구성과 중복을 줄인다.
- 검증: 증상 → 첫 관찰 → 증거별 수정 → 원래 워크로드 재검증이 이어진다. API 장애 시 노드·런타임 진입과 static Pod 복구의 파일·마운트 대조를 보존한다.

### M7. 클러스터 운영과 Helm

- [ ] M7a: `09-cluster-lifecycle`을 설치 / drain·업그레이드 / etcd로 나눈다. `05-services-dns`의 CNI 설치 설명과 중복을 정리한다.
- [ ] M7b: `11-helm`을 release 관리 흐름으로 축약하고 repo/chart/release/app 버전의 차이를 필요한 지점에 설명한다.
- 검증: kubeadm·etcd는 실행 세션이 버전·실행 노드·백업·복구 후 성공 조건을 직접 검토한다. Helm은 release 상태와 실제 workload 정상 동작을 모두 확인하도록 쓴다.

### M8. 전체 탐색·누락 검토와 마감

- [ ] 실제 결과로 `_deck.mjs`·index의 설명·DeckMap을 정리하고 시험 대비의 짧은 작업 색인을 만든다.
- [ ] M0의 커리큘럼·기존 절 이관표와 최종 페이지를 대조한다. 미작성 실습은 명시하고 완료했다고 숨기지 않는다.
- [ ] 중복 설명·불필요한 보충·낡은 제외 목록·옛 장 번호·깨진 앵커를 검토한다.
- [ ] 각 도메인의 대표 페이지 하나에서 “목표 파악 → 명령 선택 → 공식 예제 찾기 → 성공 판정”이 가능한지 확인한다.
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
/goal docs/plans/01-cka-udemy-rework.md의 전체 개편을 M0부터 M8까지 순서대로 완료해 줘.

각 작업 묶음을 편집 → 검증 → 오류 수정 → 계획 기록 → 커밋한 뒤 다음 묶음으로 계속해.
M1 시범 결과는 스스로 검토하고 필요한 개선을 반영한 다음 나머지 개편을 진행해.
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

최종 저장소 검사: 2026-09-12 실행 방침 반영 후 `pnpm check` 재검증 통과(exit 0). 콘텐츠 검사·371페이지 빌드·31,796개 내부 페이지/앵커 링크 검사 통과. 계획의 상대 파일 링크와 공백도 확인했다. 사이트에 렌더되는 변경이 없어 브라우저 검증은 해당하지 않는다.
영구 정본으로 승격한 내용: 아직 없음. 본문 개편 시작 시 baseline에 반영한다.
남은 follow-up: M0~M8 본문 개편 및 각 묶음의 검토·실습 검증.
