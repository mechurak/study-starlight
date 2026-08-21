# 사내 Agent 배포 플랫폼 덱의 기준

`agent-platform` 덱을 고치기 전에 읽는다. 다른 덱에는 해당하지 않는다.

## 이 덱의 한 문장

사내 Agent 플랫폼의 오래가는 자산은 특정 runtime의 CRD나 API가 아니라 **Agent·Tool·Knowledge·Version·Trigger·Grant·Deployment의
제품 중립 계약**이다. 맨 Kubernetes, kagent와 Amazon Bedrock AgentCore는 이 계약을 실행 상태로 바꾸는 서로 다른 배포
어댑터다. durable execution 층은 필요가 acceptance test로 증명될 때까지 **보류한 결정**이며,
재개 시 Temporal과 Dapr Agents on Kubernetes를 비교한다.

```text
임직원 → 사내 포털·ACL·승인 → 제품 중립 Agent 계약 → Runtime Adapter → 맨 Kubernetes | kagent | AgentCore
                                                        └ Execution Profile → none | Temporal | Dapr Agents
                                                          (durable execution은 현재 none)
```

## 기준 환경

- 임직원이 Agent를 자발적으로 만들고 다른 임직원과 공유한다.
- Agent마다 개인·부서 단위로 사용·편집·소유 권한을 나눈다.
- 온프렘 Kubernetes가 있고, AWS VPC를 사내망의 신뢰 가능한 확장으로 사용할 가능성이 있다.
- Agent는 prompt·knowledge·승인된 MCP를 조합한 구성형과, source에서 immutable artifact를 만드는 코드형을 모두 포함한다.
  portable production 기본은 OCI digest이고 AgentCore CodeZip 같은 provider extension은 capability로 명시한다.
- 사내 Keycloak 또는 Entra ID가 사용자와 부서 group의 단일 원본이다.
- 사내 포털의 frontend와 backend(Node/TypeScript)가 같은 온프렘 cluster에 이미 떠 있다. Agent의
  등록·승인·접근 제어는 이 backend가 소유하고, 이슈로 남는 것은 runtime이다. 10장의 연결
  설계는 이 스택을 전제로 쓴다. 사용자에게 kubeconfig를 주지 않는다.

## 범위 경계

- **다룬다:** 포털과 runtime의 경계, 제품 중립 domain model, Agent 분류 차원과 trigger, knowledge의 버전·binding 경계,
  Agent·사용자 제작 MCP의
  등록·승인·배포 lifecycle, 세 단계 권한, adapter contract, kagent(아키텍처·resource·사내 연결·adapter 4장),
  맨 Kubernetes 기준선, 보류한 durable execution 층(재개 조건과 Temporal·Dapr Agents 후보), AgentCore,
  hybrid target 선택, 운영·도입 검증.
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
원본이고, provider ARN·namespace·CR name은 실행 위치를 나타내는 `Deployment`·`ToolDeployment`·
`KnowledgeDeployment`의 `providerRef`에만 둔다. provider 교체는 Agent·Tool·Knowledge의 정체성이나 ACL
변경이 아니라 해당 Deployment 변경이다.

세 번째 축은 **하나의 최소 공통분모로 기능을 깎지 않는다**다. 공통 계약과 함께 target capability를
명시한다. AgentCore의 session microVM이나 kagent의 Kubernetes-native scheduling처럼 backend에만 있는
기능은 capability와 policy로 선택한다.

네 번째 축은 **Agent의 요구 차원을 하나의 enum으로 합치지 않는다**다. 구성형·코드형은 작성 방식이고,
request·schedule·event는 활성화 방식이며, resident·suspendable·ephemeral은 process 상주 방식이다.
state scope·복구 보장·격리 경계·data/action 위험과 code 실행 능력을 별도 값으로 기록하고 target capability와
policy로 유효한 조합을 고른다. 한 차원 안에서도 값이 함께 성립할 수 있으면 단일 enum 대신 set이나 구조체로 둔다.

다섯 번째 축은 **runtime 결정을 둘로 나눈다**다. 누가 workload를 만들고 살리고 호출 표면을 제공하는가
(결정 A — workload lifecycle)와 중단된 다단계 실행을 누가 이어 주는가(결정 B — execution durability)는
서로 다른 결정이다. 결정 A의 온프렘 기본 후보는 kagent, AWS target의 기본 후보는 AgentCore다. 다만 kagent는 확정이 아니라
**어댑터가 Deployment를 직접 만드는 맨 Kubernetes를 기준선(영가설)으로 두고 검증하는 후보**다 —
기준선 대비 남는 가치(구성형 engine 등)를 PoC에서 증명하지 못하면 온프렘 답은 맨 Kubernetes 어댑터다.
결정 B는 수요가 acceptance test로 확인될 때까지 "없음"으로 둔다. 보류가 층의 삭제로 읽히지 않도록
재개 조건과 후보 비교를 12장에 기록한다. 결정 B를 재개해도 Temporal·Dapr Agents를 `RuntimeAdapter`의
세 번째 target으로 만들지 않는다. `ExecutionProfile` 또는 별도 durability port로 표현하고, 결정 A에서 고른
workload target과 조합한다.

## 결정 상태

| 결정 | 상태 | 현재 결론 | 다음 판정 |
|---|---|---|---|
| 제품 중립 control plane | `ADOPTED` | 회사 ID·ACL·승인·감사와 세 lifecycle을 포털이 소유 | provider 기능을 추가해도 이 불변조건을 지킨다 |
| 결정 A — 온프렘 workload lifecycle | `CANDIDATE` | 맨 Kubernetes가 기준선, kagent v0.9.9가 challenger | 11장 기준선 비교와 16장 PoC에서 유지 비용·남는 가치를 측정 |
| 결정 A — AWS workload lifecycle | `CANDIDATE` | AWS target이 필요할 때 AgentCore를 검증 | 대상 account·region을 고정하고 private network·quota·artifact contract를 시험 |
| 결정 B — execution durability | `DEFERRED` | `none` | 12장의 재개 조건을 실제 Agent가 충족하면 후보 평가를 시작 |

결정이 바뀌면 이 표의 상태·근거·판정일을 먼저 갱신하고 영향을 받는 장을 함께 고친다. `CANDIDATE`를
본문에서 채택된 기본값처럼 쓰지 않는다.

## 덱의 불변조건

1. `AgentVersion`, `Deployment`, `Publication`의 상태 머신을 합치지 않는다. 한 version은 여러 deployment를
   가질 수 있고 publication은 그중 검증된 하나를 가리킨다.
2. 승인된 Agent의 실효 동작은 재현 가능해야 한다. prompt·knowledge·tool·skill·model policy와 전역 policy
   overlay의 version 또는 content hash를 invocation·trace에 남긴다.
3. knowledge는 URL 문자열이 아니다. source revision·data classification·ACL·index artifact·삭제 및 재색인
   lineage를 제품 중립 `KnowledgeVersion`과 `KnowledgeBinding`으로 표현한다.
4. OIDC 사용자의 ACL key는 bare `sub`가 아니라 `(issuer, subject)`다. Entra object ID도 tenant·directory
   context와 함께 저장한다.
5. provider console에서 바꾼 값과 mutable tag·Git branch·공유 ConfigMap 변경이 승인된 version의 동작을
   조용히 바꾸게 두지 않는다.
6. execution durability는 workload placement와 조합되는 실행 profile이다. provider target이나 deployment
   identity를 대신하지 않는다.

## 기준 시점과 확인한 사실

**2026년 8월 21일** 기준으로 공식 문서를 확인했다. kagent 검토 기준은 이 저장소 실습과 같은 **v0.9.9**와
`kagent.dev/v1alpha2`, Dapr Agents는 **v1.0**이다. AgentCore는 release 번호가 없는 관리형 서비스이므로 PoC를
시작할 때 account·region·확인 날짜를 decision record에 고정한다. Temporal과 Dapr는 결정 B가 재개될 때 정확한
server·SDK·chart version을 새로 고른다. 아래 상태는 변화가 빠르므로 수정할 때 원문을 다시 보고, 실제 manifest는
문서의 암묵적 기본값에 의존하지 않는다.

| 항목 | 확인한 사실 | 공식 출처 | 영향 장 |
|---|---|---|---|
| kagent | v0.9.9 검토 기준. `Agent` API는 `kagent.dev/v1alpha2`, 선언형과 BYO Agent 지원 | [API reference](https://kagent.dev/docs/kagent/resources/api-ref/) | 2, 8~11 |
| kagent 인증 | v0.9에서 oauth2-proxy 기반 OIDC 인증 추가. application access control은 미구현 | [release notes](https://kagent.dev/docs/kagent/resources/release-notes/) | 5, 10~11 |
| kagent BYO | 사용자 image를 배포하며 A2A server 계약을 기대 | [BYO Agent](https://kagent.dev/docs/kagent/examples/a2a-byo/) | 2, 8~11 |
| kagent 실행 형태 | 일반 `Agent`는 Deployment, `SandboxAgent`는 Agent Substrate actor, `AgentHarness`는 장기 coding sandbox | [API reference](https://kagent.dev/docs/kagent/resources/api-ref/), [Agent Substrate](https://kagent.dev/docs/kagent/concepts/agent-substrate/), [Agent Harness](https://kagent.dev/docs/kagent/concepts/agent-harness/) | 2, 8~11 |
| kagent engine runtime | Python ADK(문서상 기본, 약 15초)와 Go ADK(약 2초). alpha schema의 기본값 변화에 기대지 않고 `runtime`을 명시 | [Agents](https://www.kagent.dev/docs/kagent/concepts/agents/), [API reference](https://kagent.dev/docs/kagent/resources/api-ref/) | 8~10 |
| kagent 통합 지점 | 외부 계약은 CRD schema다. dashboard 내부 HTTP API는 문서화·version 보장 대상으로 간주하지 않음 | [API reference](https://kagent.dev/docs/kagent/resources/api-ref/) | 8, 10~11 |
| kagent tool 선언 | `toolNames`가 allowlist, 자격증명은 `headersFrom` reference, 자동 discovery는 label로 제외 | [Tools](https://kagent.dev/docs/kagent/concepts/tools/) | 7, 9~11 |
| kagent memory | 대화에서 정보를 추출해 embedding으로 저장·검색. knowledge corpus ingestion 계약과는 별개 | [Agent Memory](https://kagent.dev/docs/kagent/concepts/agent-memory/) | 3, 9 |
| Dapr Agents | v1.0 GA Python framework. `Agent` 실행은 ephemeral이지만 memory는 persistent store를 쓸 수 있음. `DurableAgent`가 권장 | [core concepts](https://docs.dapr.io/developing-ai/dapr-agents/dapr-agents-core-concepts/) | 2, 12 |
| Dapr 배포·activity | 일반 Pod에 sidecar를 주입하며 activity는 at-least-once라 side effect에 idempotency 필요 | [sidecar](https://docs.dapr.io/concepts/dapr-services/sidecar/), [Workflow activity](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-features-concepts/) | 12 |
| Temporal | server·SDK는 MIT이고 worker는 일반 process지만 self-host는 persistence·보안·관측·upgrade·archival을 운영해야 함 | [LICENSE](https://github.com/temporalio/temporal/blob/main/LICENSE), [self-hosted guide](https://docs.temporal.io/self-hosted-guide) | 12 |
| Temporal agent 통합 | OpenAI Agents SDK 통합이 2026-03-23 GA | [Temporal announcement](https://temporal.io/blog/announcing-openai-agents-sdk-integration) | 12 |
| AgentCore Runtime | 임의 framework·model과 HTTP·MCP·A2A·AG-UI contract 지원. artifact는 Container와 CodeZip을 지원하며 runtime은 ARM64 | [Runtime CLI](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-get-started-cli.html), [direct code](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-get-started-code-deploy.html) | 2, 6, 13, 16 |
| AgentCore 격리 | runtime session별 전용 microVM. user와 session ID 매핑은 client backend 책임 | [session](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-sessions.html) | 2, 5, 13 |
| AgentCore private network | VPC ENI와 PrivateLink를 지원하고 VPC에 연결된 온프렘 private resource 접근 가능 | [VPC 연결](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agentcore-vpc.html) | 13~16 |
| Agent Registry·Policy | Registry는 Preview인 catalog 보조 기능이고 Policy는 Cedar로 Gateway tool action을 통제 | [Registry](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/registry-create-manage.html), [Policy](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/policy.html) | 5, 7, 13 |

## 서술 규칙

- 제품 이름보다 **사용자 요청과 배포 명령의 두 흐름**을 먼저 보여준다.
- kagent·Dapr Agents·AgentCore를 완성된 사내 포털이라고 쓰지 않는다. 사내 catalog·ACL은 별도다.
- kagent dashboard를 최종 사용자 화면으로 쓰지 않는다. 자체 포털을 만들면 dashboard는 운영자 콘솔로 남는다.
- backend가 kagent에 말을 거는 지점은 CRD다. dashboard의 내부 HTTP API나 CLI shell 실행을 계약으로 쓰지 않는다.
- Kubernetes를 데이터베이스로 쓰지 않는다. 정체성·version·Grant·감사는 포털 DB가 원본이고 실행 상태만 cluster가 원본이다.
- durable execution 층은 채택된 구성 요소가 아니라 **보류한 결정(결정 B)**으로 쓴다. kagent·AgentCore와
  나란한 세 번째 어댑터나 target으로 나열하지 않고, 별도 execution profile로 조합한다. 상세·재개 조건·후보
  비교는 12장에만 둔다.
- kagent를 확정된 결정처럼 쓰지 않는다. 온프렘 결정 A의 기준선은 맨 Kubernetes 어댑터이고,
  kagent는 그 기준선 대비 정당화를 PoC에서 통과해야 하는 기본 후보다.
- Temporal을 이미 도입한 것처럼 쓰지 않는다. 결정 B 재개 시 현재 가정에서의 잠정 선두 후보일 뿐이며,
  라이선스만으로 도입 검토가 끝난다고 쓰지 않는다.
- Dapr Agents를 kagent와 완전히 같은 제품군으로 쓰지 않는다. 전자는 code-first durable framework/substrate,
  후자는 Agent CR 중심 Kubernetes control plane이다.
- Dapr App ID·SPIFFE identity를 임직원 identity로 설명하지 않는다. workload 간 인증·인가 경계다.
- durable execution을 exactly-once side effect로 설명하지 않는다. activity 재실행에 대비해 tool을 idempotent하게 만든다.
- `AgentCore Identity`를 임직원 directory로 설명하지 않는다. inbound token 검증, workload identity,
  outbound credential을 맡는 서비스다.
- `AgentCore Policy`는 tool action 경계다. Agent invoke ACL을 대신한다고 쓰지 않는다.
- 이메일은 표시·검색값이고 ACL principal key는 OIDC의 `(iss, sub)` 또는 Entra의 `(tenantId, objectId)`다.
- UI에서 Agent를 숨기는 것을 authorization으로 보지 않는다. 매 invocation과 tool action에서 서버가 검사한다.
- code형 Agent와 구성형 Agent의 risk tier를 구분한다. 임직원의 임의 code를 platform process 안에서 실행하지 않는다.
- 제품 API 예제보다 adapter가 입력·출력·실패를 어떻게 정규화하는지에 집중한다.
