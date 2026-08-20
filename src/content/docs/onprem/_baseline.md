# onprem 덱의 기준

`onprem` 덱을 고치기 전에 읽는다. 다른 덱에는 해당하지 않는다.

## 이 덱의 축

**"클라우드가 대신 해 주던 자리를 하나씩 채운다"** 가 덱 전체의 뼈대다.
1장의 빈칸 대응표(관리형 서비스 ↔ 온프렘 도구 ↔ 장 번호)가 곧 목차이고,
각 장은 그 빈칸 하나를 "없으면 무슨 일이 생기는가 → 무엇이 채우는가 → 함정" 순서로 채운다.
새 도구를 덱에 넣을 때는 **1장 대응표에도 줄을 추가**한다 — 표와 장이 어긋나면 축이 무너진다.

두 번째 축은 **바닥 두 개(오브젝트 스토리지 · Postgres)** 다.
Loki · Tempo · Velero · CNPG 백업이 전부 S3를 쓰고, Keycloak · Grafana가 Postgres를 쓴다.
위층 이야기를 쓸 때 **그 상태가 어느 바닥에 떨어지는지**를 반드시 밝힌다.

## 관측 덱과의 경계

옛 8~12장(관측)은 2026-08-11에 [observability 덱](/observability/)으로 독립했다.
**8장 하나만 남았고 뒤 장이 앞으로 밀렸다** — 옛 13~18장이 지금 9~14장이다.

- **이 덱 8장은 판단만 쓴다** — 어느 빈칸을 채우나, 상태가 어느 바닥에 떨어지나,
  감시자를 어디에 배치하나, 용량을 어떻게 정하나.
- **도구 넷(Prometheus · Loki · Tempo · Grafana)의 설치·설정·질의·운영은 쓰지 않는다.**
  PromQL · LogQL · ServiceMonitor · derived field 같은 말이 이 덱에 자라기 시작하면
  경계가 무너진 것이다 — 관측 덱으로 옮긴다.
- 관측 도구의 **버전 번호도 이 덱에 두지 않는다.** 아래 표에서 뺐고, 원본은
  `src/content/docs/observability/_baseline.md`에 있다.

## 기준 시점과 확인한 사실

**2026년 8월** 기준이다. 아래는 2026-08-10에 공식 출처로 확인했다.
이 표의 값을 고칠 때는 반드시 출처를 다시 조회한다 — 특히 ingress-nginx와 MinIO는
"살아 있다"고 쓴 옛 문서가 검색 결과에 압도적으로 많다.

| 항목 | 확인한 값 | 출처 |
|---|---|---|
| Kubernetes | v1.35 (레포 전체 공통 표기) | cka 덱 `_baseline.md` |
| ingress-nginx | **2026-03 은퇴** — 릴리스·버그픽스·보안패치 없음. 후속으로 예고됐던 InGate도 무산 | kubernetes.dev/blog `2025/11/12/ingress-nginx-retirement`, kubernetes.io/blog `2026/01/29/ingress-nginx-statement` |
| Gateway API | **v1.5** (2026-02-27), v1.5.1 패치. 마이그레이션 도구 ingress2gateway 1.0 (2026-03-20) | kubernetes.io/blog `2026/04/21/gateway-api-v1-5`, `2026/03/20/ingress2gateway-1-0-release` |
| MinIO | 커뮤니티판 **2026-02 저장소 아카이브**(2025-05 콘솔 관리기능 제거 → 2025-12 maintenance mode 순). 상용 AIStor로 이동 | min.io 블로그, `minio/minio` 저장소 상태 |
| CloudNativePG | **1.30.0** (2026-06-29). 1.29.1에서 CVE-2026-44477(9.4) 수정 | cloudnative-pg.io/releases |
| oauth2-proxy | **7.15.3** (2026-06-09) | github.com/oauth2-proxy/oauth2-proxy/releases |
| 관측 도구 넷 | **여기 두지 않는다** — Prometheus · Grafana · Loki · Promtail · Tempo는 관측 덱 `_baseline.md` | `src/content/docs/observability/_baseline.md` |

## 서술 규칙

각 장 첫머리의 `<TermIntro>` 상자가 의무다 — 규칙은 AGENTS.md "덱" 절.

- **Keycloak 자체는 [keycloak 덱](/keycloak/)이 맡는다.** 이 덱의 5장은 "플랫폼 도구 열 개에
  로그인을 어떻게 한 곳으로 모으나"까지만 쓰고, realm·mapper·토큰 수명은 링크로 넘긴다.
  같은 이유로 관측 도구는 [observability 덱](/observability/), 쿠버네티스 기초는
  [cka 덱](/cka/), 리눅스 운영은 [server 덱](/server/)이 맡는다.
- **버전 번호는 위 표에 있는 것만 쓴다.** 표에 없는 도구는 버전을 적지 말고 성질만 쓴다 —
  확인 안 한 숫자를 적으면 이 덱의 신뢰가 통째로 깎인다.
- 온프렘의 제약(인터넷 직접 연결 없음 · egress proxy · 사내 CA · 오토스케일 없음)은
  장마다 반복해서 확인한다. 클라우드 전제로 쓰인 공식 문서를 그대로 옮기지 않는다.
