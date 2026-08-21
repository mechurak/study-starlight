# kagent 실습 덱의 기준

`kagent-lab` 덱을 고치기 전에 읽는다. 다른 덱에는 해당하지 않는다.

## 이 덱의 역할

전용 kind 클러스터에서 kagent의 resource·MCP·A2A를 익힌 뒤, Node/TypeScript backend의
CRD 관리·상태 관찰·A2A 호출과 권한 우회 차단을 검증하고, 같은 클러스터에 Agent Substrate를 추가해
일반 Agent와 `SandboxAgent`를 비교하는 **온프렘 도입용 walking skeleton 실습**이다.

```text
lab-environment: Docker · kind · kubectl · Helm 준비와 클러스터 일반 사용
kagent-lab:      kagent 설치 · Agent/MCP/A2A · backend 연동 · 권한 · 온프렘 승격 · Substrate A/B · cleanup
agent-platform:  사내 catalog · ACL · approval · runtime adapter 설계
```

Docker·kind·kubectl·Helm의 설치 명령은 복제하지 않는다. `lab-environment` 덱으로 연결한다.
제품 중립 domain model과 전체 포털 설계는 `agent-platform` 덱으로 넘긴다. 다만 이 덱에서는 그 설계를
말로만 남기지 않고, 최소 backend probe와 RBAC·A2A 우회 차단 acceptance test까지 직접 실행한다.

## 기준 환경과 버전

**2026년 8월 21일**에 kagent와 Agent Substrate 공식 문서를 확인했다.

- kagent 공식 quickstart의 CLI 권장 경로와 `demo` profile을 사용한다.
- macOS kagent CLI는 Homebrew, Ubuntu는 공식 `get-kagent` installer를 기본 경로로 삼는다.
- 확인 당시 공식 설치 문서의 기본 CLI release는 `0.9.9`다. 독자는 실행 전에 `kagent version`을 기록한다.
- Agent API는 `kagent.dev/v1alpha2`, kmcp의 `MCPServer` 예시는 `kagent.dev/v1alpha1`이다.
- 실습 클러스터 이름은 `kagent-lab`, context는 `kind-kagent-lab`, namespace는 `kagent`로 고정한다.
- 일반 `Agent`와 `SandboxAgent`는 별도 클러스터로 나누지 않는다. 기본 Agent·backend 실습을 먼저 완주한 뒤
  같은 `kagent-lab` 클러스터에 Substrate를 추가해 동일 환경에서 A/B 비교하고, 마지막에 클러스터 전체를 지운다.
- Substrate 실습의 고정 조합은 kagent `0.9.9`와 Agent Substrate `0.0.6`이다. 공식 walkthrough가 확인한
  조합이며, 둘을 독립적으로 `latest`로 올리지 않는다.
- 기본 모델 연결은 quickstart와 같은 OpenAI provider를 사용하되, OpenAI-compatible 사내 LiteLLM gateway를
  `openAI.baseUrl`로 연결하는 선택 경로도 1장에서 함께 검증한다.
- 사내 LiteLLM gateway는 신뢰 가능한 `https` endpoint를 기본으로 한다. private CA·TLS inspection·proxy는
  1장의 kind trust 확인과 온프렘 승격 장의 acceptance test로 나눈다. LiteLLM 경로에서는 UI model 목록을 위한
  `ModelProviderConfig` discovery까지가 1장의 기본 절차다.
- `kagent install`은 Helm CLI로 `kagent-crds`와 `kagent` release를 `upgrade --install`한다. `demo` profile은
  내장 values로 sample Agent와 tool을 추가한다.
- backend 관리 경로는 Kubernetes API의 `Agent`·`SandboxAgent` CRD이고, 호출 경로는
  `kagent-controller` Service의 `8083` 포트와 `/api/a2a/{namespace}/{agent-name}/` route다. dashboard 내부 API,
  CLI shell 실행, Agent Pod의 임의 Service를 backend 계약으로 쓰지 않는다.
- `SandboxAgent` hands-on은 Go Declarative runtime으로 제한한다. Agent Harness는 coding workspace 수요가
  확인될 때 여는 후속 경로로만 설명하고 첫 Substrate 실습에는 넣지 않는다.
- kind의 Substrate chart가 함께 올리는 Valkey·RustFS는 학습용이다. 온프렘 staging에서는 전용 node pool,
  외부 S3-compatible snapshot storage와 snapshot 암호화·보존·삭제 정책을 별도 검증한다.

API가 alpha이고 설치 경로가 빠르게 바뀌므로 모든 본문 페이지는 `status: review`로 둔다. 명령·CRD schema를
바꿀 때는 quickstart, API reference, release notes를 함께 다시 확인한다.

## 안전 경계

- 다른 Kubernetes cluster에서 실행하지 않는다. kagent 설치 전 `kubectl config current-context`가
  정확히 `kind-kagent-lab`인지 확인한다.
- 1장에서 `kubectl config use-context kind-kagent-lab`으로 context를 고정한다. 이후 `kubectl` 예시는
  현재 context를 전제로 하며 명령마다 `--context`를 반복하지 않는다.
- API key 값을 문서·Git·매니페스트에 직접 적지 않는다. 환경 변수에서 Kubernetes Secret으로 넘긴다.
  사내 gateway에는 provider key가 아니라 workload 범위의 LiteLLM virtual key를 사용한다.
- Helm이 만든 `default-model-config`를 직접 수정하면 다음 `kagent install`이나 Helm upgrade에서 되돌아갈 수 있다.
  실습의 빠른 전환과 운영에서 별도 `ModelConfig`를 선언적으로 관리하는 방식을 구분한다.
- 원격 kagent installer는 파일로 받은 뒤 내용을 확인하고 실행하며 checksum 검증을 끄지 않는다.
- 처음 만드는 Agent에는 조회 tool만 준다. apply·delete 같은 변경 tool은 별도 승인 없이는 붙이지 않는다.
- `runtime`은 문서 기본값에 기대지 않고 모든 Declarative manifest에서 `go` 또는 `python`을 명시한다.
- MCP server와 BYO image는 code 실행 경계다. community image·package를 운영 cluster에서 그대로 실행하지 않는다.
- kagent의 OIDC 로그인을 Agent별 authorization으로 해석하지 않는다. backend가 매 invocation마다 Grant와
  session ownership을 검사하고, staging의 NetworkPolicy·gateway가 controller A2A port 직접 우회를 막는다.
- Substrate snapshot에는 prompt·tool 결과·workspace state가 들어갈 수 있는 민감 데이터로 취급한다.
- `kagent bug-report` 산출물은 외부 공유 전에 Secret, token, prompt, 내부 주소가 없는지 검사한다.
- `kagent uninstall`은 cluster 전체의 kagent resource를 지운다. 이 덱에서는 전용 kind cluster 삭제를 기본 정리로 삼는다.

## 필수 경로와 선택 경로

- **필수:** 0~8장과 10장, 13~14장. 설치부터 backend의 CRD·status·A2A와 권한 경계, 온프렘 승격 판정,
  cleanup까지 한 바퀴 돈다.
- **선택:** 9장 BYO. 사내 Agent가 구성형만으로 부족하고 code형 image 계약을 검증할 때 실행한다.
- **선택 challenger:** 11~12장 Substrate. 기본 Agent와 backend 경로를 먼저 통과한 뒤 같은 클러스터에서 실행한다.
  idle 자원 절감이나 gVisor 격리 요구가 측정되지 않으면 채택 근거로 삼지 않는다.

## 장의 공통 형식

각 실습 장은 가능한 한 다음 순서로 쓴다.

1. 이번 장의 성공 조건
2. 실행 명령 또는 manifest
3. 기대 상태
4. 관찰 포인트
5. 실패했을 때 먼저 볼 상태·condition·로그
6. 다음 장에서 환경을 재사용할지, 지금 지울지

1장에서 dashboard가 열린 뒤의 장은 가능한 한 실제 사용자 흐름대로 UI 절차를 우선 보여준다. 다만 UI 절차만 쓰지 않고,
같은 결과를 Kubernetes resource나 CLI에서 확인하는 방법을 함께 둔다.
