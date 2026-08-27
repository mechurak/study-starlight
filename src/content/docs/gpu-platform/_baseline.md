# 온프렘 GPU 추론 플랫폼 덱의 기준

`gpu-platform` 덱을 고치기 전에 읽는다. 다른 덱에는 해당하지 않는다.

## 이 덱의 한 문장

DGX Spark·A100·향후 B300을 **Kubernetes 위의 추론 전용 플랫폼**으로 운영한다. GPU Operator는
노드를 GPU 실행 가능 상태로 만들고, KServe는 모델 서버의 원하는 상태를 관리하며, LiteLLM은 이용자에게
안정된 API 입구를 제공한다.

```text
이용자 → LiteLLM → Gateway → KServe가 관리하는 모델 Pod → GPU
                                      ↑                 ↑
                                 Kubernetes       GPU Operator
```

## 기준 환경

- 사내 온프렘 Kubernetes와 GitOps·Gateway API·관측 기반이 있음
- DGX Spark 약 10대
- A100 8-GPU 서버 2대를 Backend.AI 유료 라이선스로 운영 중
- 향후 B300 서버 2대 도입 가능성
- 사내 이용자 입구로 LiteLLM 준비 중
- LLM·embedding·reranker·FastAPI 모델의 **상시 inference**가 대상
- 장기 목표는 기존 inference endpoint를 Kubernetes-native 구성으로 단계적으로 옮기는 것

## 범위 경계

- **다룬다:** GPU node pool, GPU Operator, full GPU·MIG, KServe Standard `InferenceService`,
  `LLMInferenceService`, LiteLLM, vLLM·FastAPI, model cache, serving network·관측, endpoint 전환.
- **다루지 않는다:** batch queue, Kueue, 학습, Kubeflow Trainer, 학습 checkpoint, Notebook·VSCode 같은
  interactive workspace, Kubernetes 자체 설치, CUDA kernel tuning, 모델 선정·평가, 세부 비용 산정.
- 다중 노드는 **대형 모델 추론**에 필요한 범위에서만 다룬다. 학습의 gang scheduling과 혼합하지 않는다.
- KServe는 inference만 맡는다. Backend.AI 전체를 KServe 하나로 대체한다고 쓰지 않는다.
- 물리적으로 한 Kubernetes cluster를 강제하지 않는다. 공통 운영 모델과 여러 실행 cluster를 구분한다.

## 이 덱의 축

첫 번째 축은 **하드웨어는 하나의 inventory로 보되, 서로 다른 GPU를 한 scheduling pool로 섞지 않는다**다.

- DGX Spark: ARM64 + GB10 + unified memory, single-node inference cell
- A100 8-GPU 서버: x86_64 + NVSwitch, full GPU·고정 MIG pool
- 향후 B300 서버: x86_64 + 최신 driver/CUDA, full GPU·full-node부터 검증

두 번째 축은 **Kubernetes API와 Git이 원하는 상태의 단일 원본**이다.

- LiteLLM: 이용자 key·quota·공개 모델명·fallback
- KServe: inference service·runtime·replica·route
- GPU Operator: driver·container runtime·device plugin·GPU label·MIG·DCGM
- Kubernetes: Deployment·Pod·Service·Secret·node lifecycle

## 기준 시점과 확인한 사실

**2026년 8월 18일** 기준이다. 아래 지원 범위와 API는 바뀔 수 있으므로 수정할 때 공식 원문을 다시 본다.

| 항목 | 확인한 사실 | 공식 출처 |
|---|---|---|
| GPU Operator | driver·Container Toolkit·device plugin·GFD·DCGM 등을 한 operator가 관리 | NVIDIA GPU Operator 개요 |
| 사전 설치 driver | host가 driver·toolkit을 소유하는 구성이 가능하며 실제 CRI 연결은 별도 검증 | GPU Operator 설치 문서 |
| 이기종 driver | `NVIDIADriver` CR과 node selector로 node별 driver type·version을 나눌 수 있음 | NVIDIA Driver CRD |
| MIG | A100을 포함한 지원 GPU를 격리된 GPU instance로 분할 | NVIDIA MIG User Guide |
| KServe Standard | `InferenceService`가 Deployment·Service·Gateway API 같은 일반 Kubernetes 자원을 생성 | KServe Control Plane |
| KServe LLM | `LLMInferenceService`는 Gateway API·Inference Extension·LWS를 이용해 고급 LLM topology를 구성 | KServe LLMInferenceService 문서 |

## 서술 규칙

- 제품 목록보다 **요청의 일생**을 먼저 보여준다: API 요청 → route → model server → GPU.
- 새 장의 첫 화면에는 “전체 중 어디인가”를 알려 주는 그림을 둔다.
- GPU Operator는 scheduler가 아니다. 노드 준비·자원 노출·관측의 기반이라고 설명한다.
- KServe는 model-aware GPU 추천기가 아니다. 선언을 일반 Kubernetes 객체로 바꾸고 상태를 맞추는
  inference control plane이라고 설명한다.
- `InferenceService`와 `LLMInferenceService`를 섞지 않는다. 전자는 기본, 후자는 지능형 routing·다중 노드·
  prefill/decode 분리가 필요한 고급 경로다.
- Kubernetes scheduler가 model memory를 이해한다고 쓰지 않는다. GPU family·MIG profile·full-node 요구는
  label·taint·affinity·검증된 runtime preset으로 명시한다.
- Spark·A100·B300용 runtime image의 architecture·CUDA·driver 호환을 각각 검증한다.
- 생성형 장식 이미지보다 D2와 공식 구조도를 우선하고, 공식 이미지는 `SourceFigure`로 출처를 남긴다.
