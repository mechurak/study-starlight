# Observability 첫 장애 조사 실습

kind 위에 학습용 LGTM 스택과 작은 결제 앱을 띄우고, 의도적으로 발생시킨 장애를
메트릭 → 로그 → 트레이스 순서로 조사한다.

실행 순서와 관찰 포인트는 스터디 사이트 문서를 따른다.

- [8. 실습 준비](https://study.upggu.com/observability/08-lab-setup/)
- [9. 첫 장애 조사](https://study.upggu.com/observability/09-first-investigation/)
- [10. 첫 대시보드](https://study.upggu.com/observability/10-first-dashboard/)

빠른 명령은 다음과 같다.

```bash
make up
make port-forward   # 이 터미널은 계속 열어 둔다
make scenario       # 다른 터미널에서 실행한다
make down           # 실습을 모두 마친 뒤 실행한다
```

`make down`은 이 실습 전용 kind 클러스터 `observability-lab` 전체를 삭제한다.

## 학습용과 운영용의 경계

이 구성은 Grafana의 `grafana/otel-lgtm` 개발·데모 이미지를 사용한다. 한 Pod 안에
OpenTelemetry Collector, Prometheus, Loki, Tempo, Grafana가 함께 있고 데이터는
`emptyDir`에 저장된다. 고가용성, 영속 저장소, 인증, 리텐션을 갖춘 운영 구성으로 사용하면 안 된다.

`k8s/lgtm.yaml`은 Grafana의 Apache-2.0 라이선스
[`docker-otel-lgtm` Kubernetes 예제](https://github.com/grafana/docker-otel-lgtm/blob/v0.30.2/k8s/lgtm.yaml)를
이 실습의 namespace·리소스·고정 버전에 맞게 수정했다.
