# kagent 실습 덱의 기준

`kagent-lab` 덱을 고치기 전에 읽는다. 다른 덱에는 해당하지 않는다.

## 이 덱의 역할

전용 kind 클러스터에서 kagent를 설치하고, 선언형 Agent와 MCP tool을 만들고, A2A로 호출하고,
상태와 로그로 실패를 설명한 뒤 안전하게 지우는 **반복 가능한 입문 실습**이다.

```text
lab-environment: Docker · kind · kubectl · Helm 준비와 클러스터 일반 사용
kagent-lab:      kagent CLI와 cluster 설치 · Agent 실행 · MCP · A2A · debug · cleanup · 실행 기반 개념
agent-platform:  사내 catalog · ACL · approval · runtime adapter 설계
```

Docker·kind·kubectl·Helm의 설치 명령은 복제하지 않는다. `lab-environment` 덱으로 연결한다.
사내 포털과 제품 중립 배포 계약은 `agent-platform` 덱으로 넘긴다.

## 기준 환경과 버전

**2026년 8월 19일**에 kagent 공식 문서를 확인했다.

- kagent 공식 quickstart의 CLI 권장 경로와 `demo` profile을 사용한다.
- macOS kagent CLI는 Homebrew, Ubuntu는 공식 `get-kagent` installer를 기본 경로로 삼는다.
- 확인 당시 공식 설치 문서의 기본 CLI release는 `0.9.9`다. 독자는 실행 전에 `kagent version`을 기록한다.
- Agent API는 `kagent.dev/v1alpha2`, kmcp의 `MCPServer` 예시는 `kagent.dev/v1alpha1`이다.
- 실습 클러스터 이름은 `kagent-lab`, context는 `kind-kagent-lab`, namespace는 `kagent`로 고정한다.
- 기본 모델 연결은 quickstart와 같은 OpenAI provider를 사용하되, OpenAI-compatible 사내 LiteLLM gateway를
  `openAI.baseUrl`로 연결하는 선택 경로도 1장에서 함께 검증한다.
- 사내 LiteLLM gateway는 `http` endpoint를 전제한다. TLS·private CA 절차는 본문에 두지 않고 공식 BYO 문서로
  연결한다. LiteLLM 경로에서는 UI model 목록을 위한 `ModelProviderConfig` discovery까지가 1장의 기본 절차다.
- `kagent install`은 Helm CLI로 `kagent-crds`와 `kagent` release를 `upgrade --install`한다. `demo` profile은
  내장 values로 sample Agent와 tool을 추가한다.
- 9장(Agent Harness·Agent Substrate)은 cluster가 필요 없는 개념 장이다. `SandboxAgent`·`AgentHarness`는
  gVisor worker pool과 snapshot용 object storage가 전제라 이 kind 실습에서 실행하지 않는다.

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
- MCP server와 BYO image는 code 실행 경계다. community image·package를 운영 cluster에서 그대로 실행하지 않는다.
- `kagent bug-report` 산출물은 외부 공유 전에 Secret, token, prompt, 내부 주소가 없는지 검사한다.
- `kagent uninstall`은 cluster 전체의 kagent resource를 지운다. 이 덱에서는 전용 kind cluster 삭제를 기본 정리로 삼는다.

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
