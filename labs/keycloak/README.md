# Keycloak Compose lab

Keycloak·PostgreSQL·앱 A/B·API와 Samba AD DC를 `keycloak-lab` Docker Compose project 하나에서
실행하는 실습 진입점이다. 기본 경로에는 kind와 kubectl을 사용하지 않는다. Samba는 **Microsoft AD
DS가 아니라 AD 호환 디렉터리 실습 대역**이며, 이 결과를 Windows domain 검증으로 일반화하지 않는다.

현재 macOS/Colima 비브라우저 경로는 P03~P11 범위에서 검증했다. macOS browser의 CA trust와 실제
Chrome 로그인은 P05·P06의 `blocked` 항목으로 남아 있고, Ubuntu 24.04 + rootful Docker Engine의 P03
플랫폼 검증도 보류 상태다. 두 항목은 Compose lifecycle 사용을 막지 않지만 통과한 것으로 간주하지 않는다.

## 명령 요약

모든 명령은 이 디렉터리에서 실행한다.

```bash
cd labs/keycloak

./scripts/first-start.sh       # 최초 시작 또는 marker가 남은 최초 시작 재개
./scripts/status.sh            # 여섯 상시 service의 readiness 확인
./scripts/stop.sh              # container/network만 내리고 데이터 보존
./scripts/resume.sh            # 기존 volume과 .state로 전체 재개
./scripts/service.sh start api # service 하나와 Compose 의존성 기동
./scripts/service.sh status api
./scripts/reset.sh --dry-run   # 초기화 대상 출력만
./scripts/verify-p11.sh --confirm DELETE-keycloak-lab-compose-state
```

스크립트는 `compose.yaml`의 고정 project name과 파일을 명시하여 `keycloak-lab`만 다룬다. 다른
container·network·volume의 ownership이 이름과 충돌하거나 project에 알 수 없는 일회성 container가
남아 있으면 자동으로 지우지 않고 중단한다.

## 선행조건

- macOS는 Colima 0.10.3의 `colima` Docker context, Ubuntu는 rootful Docker Engine을 사용한다.
- Docker Compose 5.5.1이 필요하다. macOS에 plugin이 없으면 `samba/compose.sh`가 고정 checksum의
  바이너리를 `.state/tools/`에 내려받는다. 최초 image pull/build와 패키지 설치에는 인터넷이 필요하다.
- Docker runtime은 4 logical CPU, RAM 8 GiB 이상이어야 한다. 시작 직전 `MemAvailable` 5 GiB와 Docker
  data filesystem 여유 20 GiB도 필요하다. lifecycle 시작 명령이 이 조건을 확인한다.
- `172.30.0.0/24`가 다른 route/network와 겹치지 않고, host loopback의 `30080`~`30082`를 다른
  container가 사용하지 않아야 한다.
- browser를 사용할 때만 `/etc/hosts`에서 아래 세 이름을 loopback으로 해석해야 한다. 기존의 충돌하는
  항목은 덮어쓰지 않는다. 현재 보류 중인 browser 검증을 수행하려면 별도로 web CA를 신뢰해야 하며,
  인증서 경고를 무시해서는 안 된다.

  ```text
  127.0.0.1 keycloak.keycloak.test app-a.keycloak.test app-b.keycloak.test
  ```

고정 버전·주소·CA·secret·자원 근거는 [decisions.md](decisions.md), 실제 환경별 결과와 보류 항목은
[verification.md](verification.md)가 정본이다.

## 최초 시작

`first-start.sh`는 두 named volume과 `keycloak-lab` network가 모두 없는 최초 실행에서 시작한다. 기존
데이터가 있으면 초기화나 덮어쓰기를 시도하지 않고 `resume.sh`를 안내한다. 예외는 이 명령 자체가 남긴
in-progress marker가 있는 중단된 최초 시작뿐이다.

```bash
./scripts/first-start.sh
```

이 명령은 서로 분리된 directory/web CA와 file-backed secret을 `.state/`에 준비하고, Samba·PostgreSQL·
Keycloak을 health condition까지 기다린다. 이어서 앱 A client, 앱 B/API 역할·audience, Samba LDAP
Federation과 group mapper를 멱등 seed한 뒤 앱 A/B·API를 기동한다. 고정 sleep으로 readiness를
추측하지 않고 Compose `--wait`와 각 service healthcheck를 사용한다.

최초 시작이 중간에 실패했다면 volume이나 `.state`를 임의로 지우지 않는다. 스크립트가 남긴
`.state/lifecycle/first-start-in-progress` marker가 있는 동안에는 같은 `first-start.sh`를 다시 실행해
멱등 seed를 이어 갈 수 있다. 실패 로그와 `./scripts/status.sh` 결과를 먼저 확인하고, 빈 상태 재구성이
정말 필요할 때만 아래의 명시적 전체 초기화 절차를 사용한다.

## 상태와 readiness

```bash
./scripts/status.sh
./scripts/status.sh keycloak
```

전체 상태 확인은 `samba`, `postgres`, `keycloak`, `api`, `app-a`, `app-b`가 모두
`running/healthy`일 때만 성공한다. 서비스별 확인도 container 존재만 보지 않고 해당 healthcheck를
판정한다. 시작과 재개 명령은 Compose `up --detach --wait`가 같은 readiness 조건을 만족할 때 반환한다.

## 데이터 보존 중단과 재개

```bash
./scripts/stop.sh
./scripts/resume.sh
```

`stop.sh`는 ownership을 확인한 정확한 `keycloak-lab` project에 `compose down`을 `--volumes` 없이
실행한다. 여섯 container와 project network는 사라지지만 다음 상태는 남는다.

- Samba domain DB·SYSVOL: `keycloak-lab-samba-data`
- Keycloak의 PostgreSQL 상태: `keycloak-lab-postgres-data`
- 두 CA, leaf key/certificate, secret, 검증 기록: `.state/`

`resume.sh`는 두 volume과 필요한 `.state` 파일이 존재하는지 확인하고 같은 여섯 service를 다시 만든 뒤
health readiness를 기다린다. 앱 A/B의 memory session은 container와 함께 사라지므로 사용자는 다시
로그인해야 하지만 Samba SID·계정/그룹과 Keycloak realm·Federation 설정은 보존된다.

## 서비스별 기동

기존 전체 상태에서 service 하나와 Compose가 선언한 의존성만 기동할 수 있다.

```bash
./scripts/service.sh start samba
./scripts/service.sh start keycloak  # postgres도 필요하면 함께 기동
./scripts/service.sh start app-a     # keycloak 의존성 포함
./scripts/service.sh status app-a
```

허용 이름은 `samba`, `postgres`, `keycloak`, `api`, `app-a`, `app-b`뿐이다. seed·diagnostic service는
일회성 검증 경로이며 lifecycle의 상시 service 목록에 포함하지 않는다. 전체를 원래 상태로 올릴 때는
서비스별 명령을 반복하지 말고 `resume.sh`를 사용한다.

## 명시적 전체 초기화

전체 초기화는 복구 명령이 아니다. Samba domain, Keycloak DB, 로컬 CA/private key, password와
P03·P05 이후 Compose 검증 기록을 영구 삭제하고 다음 시작에서 새 identity를 만든다. 먼저 dry-run으로
현재의 정확한 대상을 확인한다.

```bash
./scripts/reset.sh --dry-run
```

출력에는 `keycloak-lab` label을 가진 정확한 container, `keycloak-lab` network,
`keycloak-lab-samba-data`, `keycloak-lab-postgres-data`, 그리고 삭제할 `.state` 파일이 모두 나온다.
P04 선택 실습의 `kind.yaml`, `kind/`, `k8s/`, `.state/coredns`, `.state/kubeconfig`, `.state/tools`,
`.state/verification/p04`는 이 Compose 초기화에서 보존된다. 명시적 opt-in이 없으면 스크립트는 대상을
출력한 뒤 실패하며 아무것도 삭제하지 않는다.

대상과 위험을 검토하고 정말 새 Compose identity가 필요할 때만 아래의 정확한 확인 문자열을 입력한다.

```bash
./scripts/reset.sh --confirm DELETE-keycloak-lab-compose-state
```

일반 중단에는 이 명령을 사용하지 않는다. lifecycle에는 `compose down --volumes`, `docker system prune`,
전역 container/network/volume 삭제, Colima reset/delete, kind 조작이 없다.

## 범위별 검증

현재 정상 상태를 좁게 확인하려면 이미 구현된 진단을 사용한다.

```bash
./samba/compose.sh --profile p08 run --rm --no-deps p08-diagnostic
P09_ACTION=inspect ./samba/compose.sh --profile p09 run --rm --no-deps \
  --env P09_ACTION=inspect p09-admin
./scripts/verify-d09.sh       # 복제 browser flow의 OTP 등록·성공·실패·복구
```

`verify-d09.sh`는 전용 client와 사용자에만 복제 flow를 적용한다. realm 기본 browser flow나 앱 A/B의
binding을 바꾸지 않으며, OTP secret·code·password·cookie를 출력하지 않는다.

P10의 보존 중단·재개와 reset dry-run/guard 검증은 다음 명령이다. 실제 volume 또는 `.state` 초기화는
실행하지 않는다.

```bash
./scripts/verify-p10.sh
```

P11의 빈 상태 전체 재현은 실제 Compose volume과 P03·P05 이후 로컬 검증 기록을 삭제한다. 위의 reset
dry-run으로 대상을 먼저 확인하고, P04 자산과 다른 workload의 전후 상태를 함께 비교할 때만 다음 명령을
사용한다. 이 명령도 reset과 같은 고정 확인 문자열 없이는 exit 2로 거부된다.

```bash
./scripts/verify-p11.sh --confirm DELETE-keycloak-lab-compose-state
```

P11은 빈 상태 최초 시작, 로컬 사용자 앱 A→앱 B SSO와 API, Samba alice/bob 로그인과 group→role→claim,
refresh, 보존 중단·재개 뒤 같은 결과를 비브라우저 경로로 확인한다. 최초 image pull/build와 패키지 준비는
인터넷이 필요할 수 있지만, 이후 진단은 로컬 image에 `--pull never`를 적용한다. macOS browser 검증과
네이티브 Ubuntu 검증은 이 명령의 성공으로 대체되지 않는다.
