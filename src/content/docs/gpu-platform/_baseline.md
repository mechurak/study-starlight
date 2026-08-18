# 온프렘 GPU 플랫폼 덱의 기준

`gpu-platform` 덱을 고치기 전에 읽는다. 다른 덱에는 해당하지 않는다.

## 이 덱의 축

첫 번째 축은 **"하드웨어는 하나의 inventory로 보되, 서로 다른 GPU와 workload를 하나의
scheduling pool로 섞지 않는다"** 다.

- DGX Spark: ARM64 + GB10 + 128GB unified memory, inference 중심의 single-node cell
- A100 8-GPU 서버: x86_64 + NVSwitch, full GPU·MIG, interactive·batch·학습·inference
- 향후 B300 서버: x86_64 + 최신 driver/CUDA, full GPU·full-node 중심으로 먼저 검증

두 번째 축은 **"Kubernetes API와 Git이 원하는 상태의 단일 원본"** 이다.

- LiteLLM: 이용자 key·quota·공개 모델명·fallback
- KServe: inference service·runtime·revision·route
- Kueue: 기다릴 job·quota·fair sharing·resource flavor
- JobSet·Kubeflow Trainer: 함께 떠야 하는 분산 job의 lifecycle
- GPU Operator: driver·container runtime·device plugin·GPU label·DCGM
- Kubernetes: Pod·Service·Secret·namespace·node lifecycle

GPUStack은 이 목표 구조에 넣지 않는다. 기존 [GPUStack 덱](/gpustack/)은 Docker 기반으로 빠르게
시작하는 별도 선택지로 보존한다.

## 기준 환경

- 사내 온프렘 Kubernetes와 GitOps·Gateway API·관측 기반이 있음
- DGX Spark 약 10대
- A100 8-GPU 서버 2대를 Backend.AI 유료 라이선스로 운영 중
- 향후 B300 서버 2대 도입 가능성
- 사내 이용자 입구로 LiteLLM 준비 중
- LLM·embedding·reranker·FastAPI 모델 serving과 interactive·batch·분산 학습을 모두 고려
- 장기 목표는 Backend.AI 기능을 Kubernetes-native 구성으로 단계적으로 대체하는 것

## 범위 경계

- **다룬다:** GPU node pool, GPU Operator, KServe Standard·LLMInferenceService, LiteLLM,
  Kueue·JobSet·Kubeflow Trainer, MIG·full GPU, artifact cache, RDMA·스토리지, Backend.AI 전환.
- **깊게 다루지 않는다:** Kubernetes 자체 설치, CUDA kernel tuning, 학습 framework별 코드,
  모델 선정·평가, 세부 비용 산정, Slurm 운영.
- KServe는 inference만 대체한다. Backend.AI의 interactive·batch·storage·portal을 KServe 하나로
  대체한다고 쓰지 않는다.
- 물리적으로 한 Kubernetes cluster를 강제하지 않는다. **공통 운영 모델과 여러 실행 cluster**를
  구분한다.

## 기준 시점과 확인한 사실

**2026년 8월 18일** 기준이다. 아래 지원 범위는 바뀔 수 있으므로 수정할 때 공식 원문을 다시 본다.

| 항목 | 확인한 사실 | 공식 출처 |
|---|---|---|
| GPU Operator | DGX Spark·DGX A100·DGX B300과 ARM64 Spark를 지원 목록에 포함 | NVIDIA GPU Operator Platform Support |
| 사전 설치 driver | DGX처럼 driver·toolkit이 있는 시스템은 해당 operand를 끌 수 있음. 실제 CRI 설정은 별도 검증 | GPU Operator Getting Started |
| 이기종 driver | `NVIDIADriver` CR과 node selector로 node별 driver type·version을 관리할 수 있음 | NVIDIA GPU Driver CRD |
| MIG | A100을 포함한 Ampere 이후 지원 GPU를 격리된 GPU instance로 분할 | NVIDIA MIG User Guide |
| KServe Standard | `InferenceService`가 raw Kubernetes deployment로 GPU·생성형·예측형 serving을 지원 | KServe Administrator Guide |
| KServe LLM | `LLMInferenceService`는 Gateway API inference extension·Envoy 계층·LeaderWorkerSet 의존 | KServe LLMInferenceService docs |
| Kueue | `ResourceFlavor`·ClusterQueue·LocalQueue로 이기종 자원 quota와 admission을 표현 | Kueue docs |
| JobSet | 여러 Kubernetes Job을 하나의 분산 workload로 묶고 Kueue와 연동 | Kubernetes JobSet announcement |
| Backend.AI | 공개 구조는 자체 Sokovan scheduler·Agent·session·vfolder 중심. Kubernetes backend 공개 문서는 비어 있음 | Backend.AI Concepts · Agent Kubernetes Backend |
| Spark vLLM | NVIDIA가 ARM64 Spark와 multi-Spark용 vLLM·NCCL 실행 절차를 제공 | NVIDIA DGX Spark playbooks |

## 서술 규칙

- 제품 목록보다 **workload의 수명**을 먼저 보여준다: 상시 API, interactive session, 기다리는 batch,
  함께 떠야 하는 distributed job.
- "하나의 플랫폼"을 "하나의 cluster"와 같은 말로 쓰지 않는다.
- `InferenceService`와 `LLMInferenceService`를 섞지 않는다. 전자는 기본, 후자는 고급 LLM topology다.
- Kubernetes scheduler가 model memory를 이해한다고 쓰지 않는다. GPU family·MIG profile·full-node
  요구를 label·taint·resource flavor·preset으로 명시한다.
- `nvidia.com/gpu: 8`은 GPU 여덟 장을 요구한다는 뜻이지 distributed job 전체의 atomic admission을
  보장하는 말이 아니다. 여러 Pod가 함께 떠야 하면 Kueue·JobSet·Trainer의 역할을 설명한다.
- Spark·A100·B300용 runtime image의 architecture·CUDA·driver 호환을 각각 검증한다.
- Backend.AI 종료는 기능 parity와 rollback을 통과한 뒤의 단계로 둔다. 라이선스 절감을 시작점으로 쓰지 않는다.
