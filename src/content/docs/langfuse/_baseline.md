# Langfuse 덱의 기준

`langfuse` 덱을 고치기 전에 읽는다. 다른 덱에는 해당하지 않는다.

## 이 덱의 한 문장

Langfuse는 LLM 애플리케이션이 수행한 각 단계를 observation으로 남기고, **동작·비용·품질을 같은 실행 문맥에서
추적해 prompt와 코드의 다음 변경으로 되돌리는 LLM engineering platform**이다.

```text
애플리케이션 / LiteLLM → Langfuse Web API → S3 event → Redis queue → Worker → ClickHouse
                               │                                      │
                               └─ Postgres: 사용자 · project · prompt · dataset · 평가 설정
                                                                      └─ trace · observation · score
```

## 기준 환경

- 사내 온프렘 Kubernetes에 Langfuse v4를 self-host한다.
- 새 계측은 Python SDK v4, JS/TS SDK v5 또는 native OpenTelemetry를 기준으로 한다.
- production 애플리케이션은 project별 public/secret key로 내부 Langfuse endpoint에 trace를 보낸다.
- Langfuse Web과 Worker는 여러 replica로 운영하고 Postgres, ClickHouse, Redis/Valkey, S3 호환 object storage는
  Pod 밖의 별도 고가용 서비스로 운영한다.
- LiteLLM은 별도 AI Gateway다. Langfuse는 모델 요청의 허용·routing을 결정하지 않고 그 결과를 관측한다.
- prompt·response에는 개인정보와 사내 기밀이 들어갈 수 있으므로 수집 전에 client-side masking과 retention을
  먼저 결정한다.

## 범위 경계

- 중심은 **LLM 애플리케이션의 trace와 개선 루프**다. 일반 인프라 metric·log·distributed trace 운영은
  [관측 덱](/observability/)이 맡는다.
- provider 변환·virtual key·budget·fallback은 [LiteLLM 덱](/litellm/)이 맡는다.
- 모델 process와 GPU scheduling은 [GPUStack 덱](/gpustack/)과 [온프렘 GPU 플랫폼 덱](/gpu-platform/)이 맡는다.
- Gateway API·TLS·DNS·SSO·Postgres 기반은 [온프렘 Kubernetes 덱](/onprem/)이 맡는다.
- 이 덱은 Langfuse v4의 새 설치를 기준으로 쓴다. v3에서 v4로 옮기는 dual write와 backfill은 업그레이드 장에서만
  다루고, legacy API를 새 설계의 출발점으로 쓰지 않는다.
- plan과 Enterprise Edition에 따라 달라지는 기능은 공식 availability를 확인한 것만 표시한다.

## 기준 시점과 확인한 사실

**2026년 8월 18일** 기준이다. Langfuse Cloud는 v4 전환 기간이고 self-hosted v4는 GA다. 실제 도입에서는
server·Python SDK·JS SDK·Helm chart를 하나의 호환성 묶음으로 검증하고 image digest를 고정한다.

| 항목 | 확인한 사실 | 공식 출처 |
|---|---|---|
| GA 기준 | Server v4, Python SDK v4, JS/TS SDK v5가 GA다 | Versions & Compatibility |
| Cloud 전환 | Cloud의 legacy API·ingestion 제거 예정일은 2026-11-16이다 | Langfuse v4 · Compatibility |
| 데이터 모델 | v4는 observation-first이며 trace 속성을 observation row에 복제한다 | Langfuse v4 · Core Concepts |
| 수집 | 최신 SDK는 OpenTelemetry 기반이며 background queue와 batch를 사용한다 | SDK Overview · Event Queuing |
| application 구성 | Web과 Worker 두 container가 있고 Worker가 event를 비동기 처리한다 | Platform Architecture |
| 저장소 | Postgres는 transactional data, ClickHouse는 observation/score, Redis는 queue/cache, S3는 raw event/media를 맡는다 | Platform Architecture |
| Kubernetes | 공식 Helm chart는 application과 dependency를 배포하거나 외부 Postgres·ClickHouse·Redis를 연결할 수 있다 | Kubernetes Helm |
| ClickHouse | Langfuse는 multi-shard를 지원하지 않으며 production은 단일 shard의 replica 구성을 권장한다 | ClickHouse self-hosting |
| retention | self-hosted의 project retention 기능은 Enterprise Edition이고, 정책이 없으면 event data를 자동 삭제하지 않는다 | Data Retention |

## 서술 규칙

- 모든 장은 **어떤 질문에 답하려는가 → 어떤 observation/score가 필요한가 → 어떻게 계측·운영하는가 → 무엇이
  빠지면 잘못 해석하는가** 순으로 쓴다.
- v4에서는 trace를 독립 저장 행처럼 가르치지 않는다. trace는 같은 `trace_id`를 공유하는 observation의 논리적
  묶음이고 root observation이 trace 대표가 된다.
- `generation`은 LLM 호출, `span`은 일반 작업 시간, `event`는 순간 사건으로 구분한다. 모든 것을 generation으로
  만들지 않는다.
- trace 한 개는 chatbot 대화 전체가 아니라 보통 **한 turn 또는 한 agent run**이다. 여러 turn은 `session_id`로 잇는다.
- 안정된 observation `name`, `environment`, `release`, `version`을 분석 계약으로 보고 임의 request id를 name에 넣지 않는다.
- SDK의 HTTP 성공은 ClickHouse 저장 완료가 아니다. client batch, Web ingest, S3, Redis queue, Worker, ClickHouse의
  비동기 경계를 구분한다.
- prompt version은 immutable history, label은 움직이는 deployment pointer로 구분한다. production code가 `latest`를
  암묵적으로 따르도록 권하지 않는다.
- score는 정답이 아니라 측정 결과다. evaluator version·표본·human calibration 없이 평균 하나로 release를 승인하지 않는다.
- prompt·response 전문은 기본 관측값으로 가정하지 않는다. 민감정보는 가능하면 애플리케이션 경계를 떠나기 전에 지운다.
- image tag는 `latest`를 권하지 않고 server·SDK·chart 호환성 및 digest 고정을 함께 적는다.
