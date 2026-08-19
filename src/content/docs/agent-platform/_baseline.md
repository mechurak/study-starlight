# 사내 Agent 배포 플랫폼 덱의 기준

`agent-platform` 덱을 고치기 전에 읽는다. 다른 덱에는 해당하지 않는다.

## 이 덱의 한 문장

사내 Agent 플랫폼의 오래가는 자산은 특정 runtime의 CRD나 API가 아니라 **Agent·Tool·Version·Trigger·Grant·Deployment의
제품 중립 계약**이다. kagent, Dapr Agents on Kubernetes, Amazon Bedrock AgentCore는 이 계약을 실행 상태로
바꾸는 서로 다른 배포 어댑터다.

```text
임직원 → 사내 포털·ACL·승인 → 제품 중립 Agent 계약 → Runtime Adapter → kagent | Dapr Agents | AgentCore
```

## 기준 환경

- 임직원이 Agent를 자발적으로 만들고 다른 임직원과 공유한다.
- Agent마다 개인·부서 단위로 사용·편집·소유 권한을 나눈다.
- 온프렘 Kubernetes가 있고, AWS VPC를 사내망의 신뢰 가능한 확장으로 사용할 가능성이 있다.
- Agent는 prompt·knowledge·승인된 MCP를 조합한 구성형과, 컨테이너로 배포하는 코드형을 모두 포함한다.
- 사내 Keycloak 또는 Entra ID가 사용자와 부서 group의 단일 원본이다.

## 범위 경계

- **다룬다:** 포털과 runtime의 경계, 제품 중립 domain model, Agent 분류 축과 trigger, Agent·사용자 제작 MCP의
  등록·승인·배포 lifecycle, 세 단계 권한, adapter contract, kagent, Dapr Agents, AgentCore, hybrid target 선택,
  운영·도입 검증.
- **다루지 않는다:** Agent framework 사용법, prompt engineering, 모델 학습·평가, GPU 모델 서빙 상세,
  MCP 서버 구현 튜토리얼, Kubernetes 설치, AWS 계정·VPC 구축 절차.
- 모델 API 입구는 [LiteLLM 덱](/litellm/), LLM trace와 평가는 [Langfuse 덱](/langfuse/),
  온프렘 공통 기반은 [온프렘 쿠버네티스 덱](/onprem/), 모델 서버는
  [온프렘 GPU 플랫폼 덱](/gpu-platform/)으로 넘긴다.

## 덱의 축

첫 번째 축은 **세 권한을 섞지 않는다**다.

1. 누가 Agent를 만들고 배포할 수 있는가 — control plane 권한
2. 누가 배포된 Agent를 호출할 수 있는가 — invocation 권한
3. Agent가 누구를 대신해 어떤 tool action을 실행할 수 있는가 — action 권한

두 번째 축은 **제품 상태를 진실의 원본으로 삼지 않는다**다. 포털 DB의 product-neutral resource가
원본이고, provider ARN·namespace·CR name은 `Deployment.providerRef`에만 둔다. provider 교체는
Agent의 정체성이나 ACL 변경이 아니라 Deployment 변경이다.

세 번째 축은 **하나의 최소 공통분모로 기능을 깎지 않는다**다. 공통 계약과 함께 target capability를
명시한다. AgentCore의 session microVM이나 kagent의 Kubernetes-native scheduling처럼 backend에만 있는
기능은 capability와 policy로 선택한다.

네 번째 축은 **Agent 종류를 하나의 enum으로 합치지 않는다**다. 구성형·코드형은 작성 방식이고,
request·schedule·event는 활성화 방식이며, resident·suspendable·ephemeral은 process 상주 방식이다.
state·격리·행위 위험도 별도 축으로 기록하고 target capability와 policy로 유효한 조합을 고른다.

## 기준 시점과 확인한 사실

**2026년 8월 19일** 기준으로 공식 문서를 확인했다. 아래 상태는 변화가 빠르므로 수정할 때 원문을 다시 본다.

| 항목 | 확인한 사실 | 공식 출처 |
|---|---|---|
| kagent | CNCF Sandbox 프로젝트. `Agent` API는 `kagent.dev/v1alpha2`, 선언형과 BYO Agent 지원 | CNCF kagent, kagent API docs |
| kagent 인증 | v0.9에서 oauth2-proxy 기반 OIDC 인증 추가. 공식 release note는 application access control 미구현이라고 명시 | kagent v0.9 release notes |
| kagent BYO | 사용자 image를 배포하며 A2A server 계약을 기대 | kagent BYO Agent guide |
| kagent 실행 형태 | 일반 `Agent`는 Deployment, `SandboxAgent`는 Agent Substrate actor, `AgentHarness`는 장기 coding sandbox | kagent API docs, Agent Substrate·Agent Harness docs |
| Dapr Agents | v1.0 GA인 Python framework. `DurableAgent`가 권장 모델이며 Dapr Workflow·state store로 실행을 복구 | Dapr Agents introduction, core concepts |
| Dapr 배포 | 일반 application Pod에 sidecar를 주입한다. Agent 전용 CR/controller lifecycle은 platform adapter가 보완 | Dapr sidecar docs |
| Dapr 권한 | App ID별 SPIFFE workload identity·mTLS와 MCP access policy 제공. 임직원 invoke ACL과는 다른 층 | Dapr MCP security docs |
| Dapr activity | at-least-once 실행이므로 side-effect tool은 idempotency가 필요 | Dapr Workflow activity docs |
| AgentCore Runtime | 임의 framework·model을 지원하는 AWS 관리형 runtime. HTTP·MCP·A2A·AG-UI contract 제공 | AgentCore Runtime docs |
| AgentCore 격리 | runtime session별 전용 microVM. user와 session ID 매핑은 client backend 책임 | AgentCore session docs |
| AgentCore private network | VPC ENI와 PrivateLink를 지원하고 VPC에 연결된 온프렘 private resource 접근 가능 | AgentCore VPC docs |
| Agent Registry | Agent·MCP·skill catalog와 승인 lifecycle을 제공하지만 현재 Preview | AWS Agent Registry docs |
| AgentCore Policy | Cedar policy로 Gateway의 tool action을 통제. Agent catalog ACL과는 다른 층 | Policy in AgentCore docs |

## 서술 규칙

- 제품 이름보다 **사용자 요청과 배포 명령의 두 흐름**을 먼저 보여준다.
- kagent·Dapr Agents·AgentCore를 완성된 사내 포털이라고 쓰지 않는다. 사내 catalog·ACL은 별도다.
- Dapr Agents를 kagent와 완전히 같은 제품군으로 쓰지 않는다. 전자는 code-first durable framework/substrate,
  후자는 Agent CR 중심 Kubernetes control plane이다.
- Dapr App ID·SPIFFE identity를 임직원 identity로 설명하지 않는다. workload 간 인증·인가 경계다.
- durable execution을 exactly-once side effect로 설명하지 않는다. activity 재실행에 대비해 tool을 idempotent하게 만든다.
- `AgentCore Identity`를 임직원 directory로 설명하지 않는다. inbound token 검증, workload identity,
  outbound credential을 맡는 서비스다.
- `AgentCore Policy`는 tool action 경계다. Agent invoke ACL을 대신한다고 쓰지 않는다.
- 이메일은 표시·검색값이고 ACL principal key는 IdP의 불변 `sub` 또는 object ID다.
- UI에서 Agent를 숨기는 것을 authorization으로 보지 않는다. 매 invocation과 tool action에서 서버가 검사한다.
- code형 Agent와 구성형 Agent의 risk tier를 구분한다. 임직원의 임의 code를 platform process 안에서 실행하지 않는다.
- 제품 API 예제보다 adapter가 입력·출력·실패를 어떻게 정규화하는지에 집중한다.
