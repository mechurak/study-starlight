# LiteLLM 덱의 기준

`litellm` 덱을 고치기 전에 읽는다. 다른 덱에는 해당하지 않는다.

## 이 덱의 한 문장

LiteLLM Proxy는 애플리케이션과 여러 LLM endpoint 사이에 놓여 **누가 어떤 공개 모델을 얼마나 쓰며,
실제 어느 배포로 보낼지**를 한곳에서 결정하는 AI Gateway다.

```text
애플리케이션 → LiteLLM Proxy → 외부 provider / 사내 vLLM
                    │
                    ├─ Postgres: key · team · spend · config의 기록
                    ├─ Redis: replica 사이의 limit · router · cache 상태
                    └─ Langfuse: LLM 요청의 trace와 평가 데이터
```

## 기준 환경

- 사내 온프렘 Kubernetes에 LiteLLM Proxy를 운영한다.
- 외부 OpenAI 호환·provider API와 사내 vLLM/KServe/GPUStack endpoint를 함께 연결할 수 있다.
- 애플리케이션은 provider key가 아니라 LiteLLM virtual key 또는 조직의 서명된 identity를 쓴다.
- Postgres와 Redis는 LiteLLM Pod 밖의 별도 고가용 서비스로 운영한다.
- 인터넷 egress proxy, 사내 CA, 내부 DNS, Gateway API와 NetworkPolicy가 있을 수 있다.
- Langfuse는 별도 서비스다. 이 덱은 LiteLLM에서 trace를 내보내는 경계까지만 다룬다.

## 범위 경계

- **중심은 Proxy다.** Python SDK는 Proxy 내부의 provider 변환을 이해할 만큼만 언급한다.
- LiteLLM은 모델 프로세스를 띄우거나 GPU를 배치하지 않는다. 그 역할은
  [GPUStack 덱](/gpustack/)과 [온프렘 GPU 플랫폼 덱](/gpu-platform/)이 맡는다.
- 일반 API gateway의 WAF·TLS·DNS·SSO 기반은 [온프렘 덱](/onprem/), Prometheus·Loki·Tempo·Grafana는
  [관측 덱](/observability/)이 맡는다.
- Langfuse의 trace 데이터 모델·저장소·보존·평가는 별도 Langfuse 덱에서 다룬다.
- MCP Gateway·Agent Gateway·guardrail 제품 비교는 이 덱의 핵심 범위가 아니다.

## 기준 시점과 확인한 사실

**2026년 8월 18일** 기준이다. LiteLLM은 릴리스가 잦고 공식 문서의 예시 버전도 페이지마다 다르므로,
실제 배포에서는 이 표의 숫자를 복사하지 말고 조직이 검증한 image digest와 chart version을 함께 고정한다.

| 항목 | 확인한 사실 | 공식 출처 |
|---|---|---|
| 기준 릴리스 | 공식 release notes의 최신 정식 릴리스는 v1.94.0(2026-07-28) | LiteLLM Release Notes |
| 배포 모드 | monolithic chart와 gateway·backend·ui를 나눈 componentized chart가 있다 | Production Deployment |
| 상태 저장소 | Postgres는 key·team·user·spend·config, Redis는 limit·router·분산 cache 상태를 맡는다 | Production Deployment · What Needs Redis |
| 다중 replica | LiteLLM 서비스는 stateless하게 2개 이상 둘 수 있고, 여러 instance에서는 Redis가 필요하다 | Production Deployment · Production Best Practices |
| migration | migration job 한 곳만 schema를 바꾸고 serving Pod에는 `DISABLE_SCHEMA_UPDATE=true`를 둔다 | Production Deployment |
| probe | `/health/liveliness`와 `/health/readiness`가 Kubernetes의 canonical probe endpoint다 | Health Checks |
| 내부 vLLM | OpenAI 호환 vLLM endpoint는 `hosted_vllm/` provider route로 연결한다 | VLLM provider docs |
| 관측 연동 | Langfuse·OpenTelemetry callback과 Prometheus metrics를 제공한다 | Logging · Prometheus metrics |

## 서술 규칙

- 모든 장은 **정책 질문 → 요청 경로의 어느 지점인가 → 설정 → 실패 시 관측 지점** 순으로 쓴다.
- `model_name`은 이용자에게 공개하는 모델 그룹 또는 alias, `litellm_params.model`은 실제 provider 모델로 구분한다.
- 같은 `model_name` 항목 여러 개는 같은 이름 뒤의 여러 deployment다. `fallback`은 다른 `model_name`으로
  넘어가는 동작이므로 load balancing과 섞지 않는다.
- Postgres가 없을 때와 Redis가 없을 때의 손실을 같은 "상태 저장 실패"로 뭉뚱그리지 않는다.
- 애플리케이션 예제에 master key를 주지 않는다. master key는 관리자 API와 UI용 자격 증명이다.
- retry·fallback·timeout을 늘리는 것을 무조건 신뢰성 향상으로 쓰지 않는다. 중복 비용, 긴 tail latency,
  비결정적 응답과 streaming 재시도 한계를 함께 적는다.
- 기능이 오픈소스인지 Enterprise인지 공식 문서에서 확인하지 못했으면 단정하지 않는다.
- 이미지 태그는 `latest`나 움직이는 태그를 예제로 권하지 않는다. version과 digest를 고정한다.
