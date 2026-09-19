# 6. CKA 시뮬레이터 실습 패턴 보강

상태: 완료
지금 위치: 본문·색인·의미 리뷰·로컬 검증·저장소 검사 완료
실행 범위: 사용자 제공 killer.sh 자료에서 유용한 실습을 선별해 추가·검증까지 완료

[계획 관리 규칙](README.md)을 따른다.

## 목표와 완료 조건

- [x] 기존 풀이와 중복을 줄이고 빠진 작업·실패 분기·완료 판정을 관련 페이지에 보강한다.
- [x] 원문에서 과도하게 일반화한 QoS·HTTPRoute·CoreDNS 설명을 공식 동작과 대조한다.
- [x] 새 페이지의 sidebar·map·복습 색인을 연결하고 `npm run check`를 통과한다.

## 범위와 입력

입력은 사용자가 붙여 넣은 killer.sh CKA Simulator A Kubernetes 1.35 해설이다.
원문 문제집을 복제하지 않고 재사용할 수 있는 명령과 판단 기준을 선별한다.
정본은 `src/content/docs/cka-udemy/`, 개념 연결은 `cka/`다. 작성·검증은
`../content-authoring.md`, `../verification.md`, 두 덱의 `_baseline.md`를 따른다.
실제 클러스터 실행·시험 환경 보장·커밋·배포는 범위 밖이다.

## 작업

| ID | 의존성·입력 | 수정 범위 | 완료 조건·검증 |
|---|---|---|---|
| M1 | 기존 덱과 제공 해설 | 작업별 보강 위치 선정, 공식 근거 | 중복·오류·빠진 전제 식별 |
| M2 | M1 | 독립 실습 페이지와 기존 본문 | 입력·수정·성공·복구가 이어짐 |
| M3 | M2 | sidebar·map·index·exam-search | 새 페이지 등록, 원문 주제별 복습 경로 |
| M4 | M3 | 의미 리뷰와 저장소 검사 | `npm run check`, diff·참조 확인 |

## 실행 기록

| 작업 | 상태 | 결정·변경 파일 | 검증 결과·미해결 사항 | 다음 행동 |
|---|---|---|---|---|
| M1 | 완료 | kubeconfig·스토리지는 기존 내용을 활용. 설치·전환·호출·분기·축소·DNS 변경은 독립 작업 | 공식 근거는 각 본문 옆에 연결 | M2 완료 |
| M2 | 완료 | 새 페이지 6개, 기존 페이지에 작업별 실패 분기 보강 | 아래 의미 리뷰와 로컬 검사 통과 | M3 완료 |
| M3 | 완료 | `_deck.mjs` sidebar·map, index, exam-search, 관련 페이지 진입 링크 | 원문 17개 작업과 SSH 위치를 색인으로 연결 | M4 |
| M4 | 완료 | diff·본문 의미 리뷰, YAML·Kustomize·kubeconfig 검증 | 로컬 검사 및 `npm run check` 통과 | 없음 |

## 페이지별 의미 리뷰

대상 독자는 기본 Kubernetes 명령을 알고 시뮬레이터를 복습하는 사용자다. 새 페이지는 작업
입력·관찰·변경·완료·복구를, 기존 페이지는 이번에 추가하거나 고친 절을 검토했다.
기존 페이지 전체의 검토일을 일괄 갱신하지 않았다. 모든 클러스터 명령은 실제 랩 미실행이다.

| 페이지 | 중심 질문·문제 | 결정과 근거·판정 | 제한 |
|---|---|---|---|
| basics | 어느 호스트에서 작업·제출하나 | 중첩 root/SSH 셸과 context 구분. 사용자 제공 환경에만 한정 | 실제 시험 접속 방식 단정 안 함 |
| jsonpath | 정확한 user 인증서를 꺼냈나 | 배열 인덱스 대신 실제 별칭, CN과 별칭 구분, data/path 분기. kubectl 공식 reference와 로컬 가상 kubeconfig 확인 | 인증서 로그인은 미검증 |
| cert-manager (신규) | 설치 후 CR을 언제 만들 수 있나 | 제품 Helm·webhook·SelfSigned 문서 대조. CRD·Pod Ready·CR 저장과 Ready 확인 | 인증서 발급·운영 전체는 제외 |
| statefulset-scale (신규) | 어떤 controller를 줄이나 | owner 확인 → scale → 실제 Pod·PVC. StatefulSet 공식 정책의 Retain/Delete 구분 | 실데이터 복구는 별도 |
| resource-limits | 먼저 퇴거할 후보는 무엇인가 | QoS 후보 조회와 실제 노드별 메모리 퇴거 순위 구분. Node-pressure Eviction 공식 문서 | CPU 부족을 퇴거 신호로 일반화하지 않음 |
| kustomize-hpa (신규) | 두 환경 HPA로 어떻게 전환하나 | 공통 HPA·prod patch·참조 정리·명시 삭제. 공식 Kustomize/HPA/declarative 관리 대조, 로컬 렌더 값 검증 | 기존 디렉터리가 입력. 부하·실제 삭제 미실행 |
| storage (유지) | PV/PVC 다음 무엇을 검증하나 | class 생략/빈 값·Bound·실제 mount 설명이 이미 있어 색인으로 재사용 | 원문 이름별 YAML 복제하지 않음 |
| troubleshooting | 스크립트와 로그 파일을 어떻게 제출하나 | top --containers, sandbox/container 구분, 제출 호스트 redirect. top/crictl 공식 안내 | runtimeType은 런타임별 정보, CRI 미실행 |
| cluster-upgrade | 미조인 worker도 upgrade node인가 | 신규 조인과 기존 노드 업그레이드 구분. kubeadm 공식 join 문서와 기존 설치 절 연결 | 패키지 실제 설치 미실행 |
| pod-api-access (신규) | Pod 신원으로 요청했나 | CA/token·list/get·namespace/전체 범위·파일 호스트 분리. API 접근·Authorization 문서 대조 | 기존 Pod·curl·권한 전제 |
| rbac | create만 허용했나 | 두 리소스 허용과 list/다른 namespace 거부, 권한 합집합. 공식 RBAC 대조 | --as는 인증 검증이 아님 |
| daemonset-static-pod | 모든 요구 노드에 배치했나 | control-plane toleration과 대상 노드 대조. 공식 DaemonSet 예제 | 자동 toleration이 모든 taint를 허용하지 않음 |
| scheduling | 노드당 최대 하나를 보장하나 | required anti-affinity와 maxSkew 차이. 공식 affinity/topology spread 대조 | 기존 Pod 자동 퇴거가 아님 |
| httproute-matching (신규) | 헤더가 맞을 때만 분기하나 | match AND/OR, specificity 우선. Gateway API HTTP routing과 v1.4 명세 대조 | 실제 컨트롤러·응답 미검증 |
| security | 만료일·갱신 명령만 요구했나 | OpenSSL enddate와 kubeadm 정확한 행 비교, 명령 기록과 실행 분리 | 실제 갱신 미실행 |
| network-policy | 목적지·포트가 정확히 짝지어졌나 | 별도 egress 규칙, 교차 조합 오류·listener 없는 음성 검사 한계. NetworkPolicy API 대조 | CNI·실제 연결 미검증 |
| coredns-domain (신규) | 새 zone과 원래 이름이 모두 되나 | 여러 zone, reload 대기, 두 FQDN, 삭제 없는 Corefile 복구. CoreDNS/Kubernetes 공식 안내와 로컬 patch 입력 확인 | 실제 DNS 조회 미검증 |
| dns | 첫 zone만 유일한 도메인인가 | 기본 예시의 정방향/역방향 구분으로 문장 교정, 새 변경 실습 연결 | 전체 DNS 설정 변경 아님 |
| workloads·gateway·helm·service-account·kustomize-patches | 관련 작업을 어디서 이어 가나 | 기존 본문 유지, 각 신규 작업 진입 링크만 추가 | 기존 페이지 전체 재검토로 표시하지 않음 |
| index·exam-search·_deck | 추가 내용과 남은 공백이 보이나 | 6개 sidebar 등록, map 연결, killer.sh 복습 표. cert-manager 부분 사례를 종합 운영으로 과장하지 않음 | 시험 출제·허용 범위 확장 주장 없음 |

## 실행한 로컬 검증

- `git diff --check`: 통과.
- Node의 YAML parser로 신규 예제와 추가된 NetworkPolicy·스케줄링 YAML을 파싱했다.
- 임시 base/overlay에서 본문의 HPA·prod patch를 추출해 `kubectl kustomize` 실행:
  staging/prod namespace, min 2, max 4/6, CPU 50%, Deployment 유지·ConfigMap 부재 assert 통과.
- `kubectl create configmap --dry-run=client`의 복구 JSON에 원래 Corefile 내용이 있고
  resourceVersion·UID가 없는 것을 확인했다. 클러스터 patch는 실행하지 않았다.
- 임시 가상 kubeconfig와 자체 서명 테스트 인증서로 context 줄별 출력·현재 context·두 번째
  user의 이름 필터와 인증서 디코딩 결과 일치를 검증했다. 임시 파일은 삭제했다.
- 로컬 도구: kubectl v1.36.4, 내장 Kustomize v5.8.1. v1.35 클러스터 동작 검증과 구분한다.

## 완료 기록

2026-09-19 완료. 실습 6개를 추가하고 기존 페이지에 명령·진단·검증 분기를 보강했다.
sidebar·map·관련 페이지 링크와 killer.sh 복습 색인을 연결했다. 장기 참조할 내용은 해당 본문에,
부분 설치 사례의 범위와 남은 실습 공백은 index에 반영했다.

`npm run check` 1회 통과: 콘텐츠 검사(460 MDX), Astro 빌드·Pagefind(519 HTML),
내부 링크 검사(41,133 페이지·anchor 링크). 화면 동작 변경이 없어 브라우저 검증은 하지 않았다.
클러스터 실행·Helm 설치·실제 트래픽·DNS·스케일링 검증은 미실행이며 본문의 명령은 랩에서
수행할 절차다. 커밋·푸시·배포는 하지 않았다.
