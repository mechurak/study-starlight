# GPUStack 덱의 기준

`gpustack` 덱을 고치기 전에 읽는다. 다른 덱에는 해당하지 않는다.

## 이 덱의 축

첫 번째 축은 **"LiteLLM은 이용자 정책, GPUStack은 모델 실행 상태"** 다.

- LiteLLM: 사용자 인증·가상 키·quota·모델 별칭·fallback·사용량 정책
- GPUStack: worker 발견·모델 배치·컨테이너 생명주기·replica·route·GPU 관측
- vLLM/FastAPI: 실제 추론

두 번째 축은 **"DGX Spark 한 대가 기본 배치 단위, 2대 pair는 예외적인 용량 셀"** 이다.
한 대에 들어가는 모델은 replica로 수평 확장하고, 한 대에 들어가지 않는 LLM만 2대를 함께 쓴다.
pair 하나는 고가용성이 아니라 **둘 중 하나만 죽어도 함께 멈추는 하나의 장애 단위**다.

## 기준 환경

이 덱은 다음 실제 도입 시나리오에 맞춘다.

- DGX Spark 약 10대, ARM64 + NVIDIA GB10 + 128GB unified memory
- 일반 서빙은 Spark 한 대에서 독립 실행
- 일부 Spark는 ConnectX-7으로 2대씩 묶은 pair가 될 수 있음
- LLM은 vLLM으로 OpenAI 호환 API 제공
- 임베딩은 가능하면 vLLM의 `/v1/embeddings`, 필요하면 자체 FastAPI
- 자체 모델은 FastAPI 기반 classification·embedding, 한 노드 안에서 실행
- 이용자 입구는 별도 LiteLLM
- GPUStack Server는 가능하면 GPU가 없는 별도 VM에 둠

## 범위 경계

- **다룬다:** Docker 기반 GPUStack, worker label과 수동 배치, vLLM·embedding,
  FastAPI custom backend와 Generic Proxy, model route, 2대 pair, 업그레이드·장애·용량 운영.
- **깊게 다루지 않는다:** 학습·파인튜닝 스케줄링, Slurm, 쿠버네티스 설치,
  vLLM 내부 커널 튜닝, 3대 이상 대규모 분산 추론.
- FastAPI 앱이 모델 서버를 넘어 DB·queue·batch job·여러 sidecar를 갖는 플랫폼으로 커지면
  GPUStack의 범위를 벗어난다. 그때 K3s/Kubernetes + KServe를 다시 비교한다.

## 기준 시점과 확인한 사실

**2026년 8월 13일** 기준이다. 현재성이 빠르게 바뀌므로 숫자와 지원 범위를 고칠 때는
아래 원문을 다시 확인한다.

| 항목 | 확인한 사실 | 공식 출처 |
|---|---|---|
| GPUStack | 오픈소스 GPU 클러스터 관리자. Docker 기반 self-hosted cluster, ARM64 worker 지원 | `docs.gpustack.ai` Overview · Requirements |
| 내장 backend | vLLM · SGLang · MindIE · VoxBox. embedding·reranker는 vLLM으로 지원 | GPUStack Built-in Inference Backends |
| custom backend | 컨테이너 이미지·실행 명령·health path 지정. custom backend는 multi-worker 불가 | GPUStack Inference Backend Management |
| Generic Proxy | OpenAI 비호환 API를 `/model/proxy/<route-id>/<upstream-path>`로 전달 | GPUStack Model Deployment Management |
| model route | 여러 target에 가중치·fallback을 주어 별칭·트래픽 분산·재해 복구 구성 | GPUStack Model Route Management |
| multi-worker | vLLM · SGLang · MindIE에서 가능. GPUStack의 MP 기반 가이드는 experimental로 표기 | GPUStack distributed vLLM tutorial |
| DGX Spark | ARM64 GB10, 128GB unified memory, 10GbE와 ConnectX-7. NVIDIA의 vLLM multi-node recipe 존재 | NVIDIA DGX Spark docs · build.nvidia.com/spark |
| GPUStack 릴리스 | v2.2.2가 v2.2.0~2.2.1의 권한·SAML 취약점을 수정하고 DGX Spark GB10 배포 검증 문제 수정 | `github.com/gpustack/gpustack/releases` |

## 서술 규칙

- "10대를 한 GPU처럼 합친다"고 쓰지 않는다. scheduler가 **독립 노드와 명시적인 pair**에
  workload를 놓는다고 쓴다.
- `replica`와 `distributed instance`를 섞지 않는다. 전자는 독립 복제본, 후자는 여러 worker가
  한 모델 인스턴스를 함께 실행하는 것이다.
- 기능 목록보다 요청 경로와 장애 경계를 먼저 보여준다.
- 자체 FastAPI에는 OpenAI 호환 여부를 반드시 표시한다. LiteLLM은 일반 `/predict` API의
  범용 gateway로 설명하지 않는다.
- 버전 고정 예시는 임의 숫자를 넣지 않는다. 실제 배포에서는 태그 대신 검증한 image digest를
  고정하라고 설명한다.
