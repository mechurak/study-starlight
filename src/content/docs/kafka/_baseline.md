# Kafka 덱의 기준

`kafka` 덱을 고치기 전에 읽는다.

## 이 덱의 축

Kafka를 메시지 큐 제품 목록으로 설명하지 않고, **서비스 사이의 결합을 시간 축에서 끊는 분할된 log**로 설명한다.
생산자·broker·partition·consumer group을 글을 쓰고 읽는 흐름 위에서 연결한다.

## 범위 경계

- 다룬다: log와 partition, producer·consumer, delivery semantics, topic 설계, 온프렘 배포·운영·장애 진단.
- 깊게 다루지 않는다: 특정 vendor의 모든 기능, 클라우드 요금표, 업종별 이벤트 schema 설계.
- Kubernetes·Linux·관측의 일반 운영은 각각 CKA·server·observability 덱을 정본으로 둔다.

## 현재성과 서술 규칙

- 특정 Kafka·operator·protocol 버전을 쓰면 공식 문서를 다시 확인하고 `reviewedAt`을 갱신한다.
- 성능 숫자는 workload·partition 수·replication factor·하드웨어 조건 없이 일반화하지 않는다.
- exactly-once를 서비스 전체의 exactly-once side effect로 확대해 설명하지 않는다.
