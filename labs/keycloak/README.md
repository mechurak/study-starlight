# Keycloak guided lab

Keycloak·PostgreSQL·앱 A/B·API·Samba AD 호환 디렉터리를 Compose project 하나에서 실행한다.
학습자는 `keycloak/`의 공개 설정과 `app/`의 실행 코드를 읽고 바꾼다. 인증서·secret 준비,
Admin REST 인증, 서버 ID 조회, 멱등 적용, 자동 로그인 검사는 `internal/`이 대신한다.

## 시작 경로를 고른다

처음부터 객체가 생기는 순서를 관찰하려면 **빈 실습 상태에서만** guided 시작을 사용한다.

```bash
cd labs/keycloak
./scripts/first-start.sh --guided
./scripts/status.sh
```

이미 이 lab을 실행한 적이 있고 두 named volume을 보존했다면 초기화하지 말고 재개한다.
예전 환경처럼 mode/stage 파일이 없어도 완성된 `ready/groups` 환경으로 인식한다.

```bash
./scripts/resume.sh
./scripts/status.sh
```

인자 없는 `./scripts/first-start.sh`는 새 빈 상태에서 아래 단계를 모두 적용해 기존과 같은 완성 환경을
만드는 호환 경로다. 기존 자원이 있으면 자동 초기화하지 않고 `resume.sh`를 안내한다.

## guided 학습 순서

각 단계에서 먼저 공개 JSON을 읽고 `apply`한 뒤 `verify`한다. `apply`는 앞 단계를 몰래 적용하지 않고,
`verify`는 설정을 복구하거나 client·role·mapper를 만들지 않는다. 로그인 검사는 새 session/event를 만든다.

```bash
./scripts/apply.sh app-a
./scripts/verify.sh app-a

./scripts/apply.sh app-b
./scripts/verify.sh sso

./scripts/apply.sh api
./scripts/verify.sh api

./scripts/apply.sh ldap
./scripts/verify.sh ldap

./scripts/apply.sh groups
./scripts/verify.sh groups
```

| 완료 단계 | 새로 배우는 설정 | 정상 상시 service |
|---|---|---|
| `base` | `study` realm, local-user, Samba alice/bob·원본 그룹 | samba, postgres, keycloak |
| `app-a` | app-a client와 정확한 callback | 위 + app-a |
| `app-b` | 별도 app-b client, 같은 realm SSO | 위 + app-b |
| `api` | bearer client, realm role, local-user role, audience | 여섯 service |
| `ldap` | LDAPS READ_ONLY provider와 user full sync | 여섯 service |
| `groups` | LDAP group mapper, group-role, groups claim | 여섯 service |

순서를 건너뛰면 exit 1, 잘못된 인자나 인자 누락은 exit 2다. 적용 중 readiness가 실패하면 stage는
승격되지 않으며 같은 명령으로 재개한다. 이미 지난 단계를 재적용해도 뒤 단계 mapper와 다른 role을
지우지 않고 완료 stage를 낮추지 않는다. 내부 단계 검사는 stage 파일만 믿지 않고 실제 Client·Role·
사용자·LDAP provider·mapper가 공개 설정과 맞는지 적용 전후에 읽는다. 새 guided 단계가 전진할 때는
아직 배우지 않은 lab 소유 객체가 없는지도 확인한 뒤에만 stage를 기록한다.

## 무엇을 읽고 무엇을 건너뛰나

| 위치 | 이해할 것 | 처음에는 건너뛰어도 되는 것 |
|---|---|---|
| `keycloak/clients/` | confidential client, Code, PKCE, callback | secret 주입과 서버 생성 ID |
| `keycloak/roles/`, `mappings/`, `mappers/` | role 부여와 token 출력의 차이 | Admin REST의 검색·중복 방지 |
| `keycloak/federation/` | LDAPS provider와 group mapper의 별도 책임 | bind credential 주입과 sync endpoint 호출 |
| `app/server.mjs` | `/login`→`/callback`→앱 session→API 전달 | 테스트용 HTML form 추적 |
| `app/api.mjs` | JWT 서명·issuer·audience 검증과 role 인가 | CA·secret 파일 생성 |
| `compose.yaml` | service/network/volume/secret 경계 | 과거 상세 검증 profile |
| `internal/` | 자동화의 역할과 공개 진입점 | 구현 세부 전체 |

`mappings/*.json`은 이 lab의 이름 기반 적용 입력이며 Keycloak native import 형식이 아니다. 다른 JSON도
ClientRepresentation, ComponentRepresentation, ProtocolMapperModel 등 어느 Admin API 대상인지 해당
학습 페이지에서 확인한다. 공개 설정과 같은 값을 internal 코드에 복사해 두지 않는다.

## 브라우저와 secret

`/etc/hosts`에 다음 세 이름을 `127.0.0.1`로 연결한다.

```text
127.0.0.1 keycloak.keycloak.test app-a.keycloak.test app-b.keycloak.test
```

- Admin Console: `https://keycloak.keycloak.test:30080/admin/` (`lab-admin`)
- 앱 A: `https://app-a.keycloak.test:30081/`
- 앱 B: `https://app-b.keycloak.test:30082/`
- 사용자: `local-user`, Samba의 `alice`, `bob`

비밀번호는 `.state/secrets/keycloak-bootstrap-admin-password`, `keycloak-local-user-password`,
`samba-alice-password`, `samba-bob-password`에 있다. 예를 들어 값은 로컬 터미널에서
`cat .state/secrets/keycloak-local-user-password`로만 확인하고 문서·로그에 붙여 넣지 않는다.
브라우저 HTTPS는 `.state/web-ca/ca.crt`, Keycloak→Samba LDAPS는 `.state/directory-ca/ca.crt`를 신뢰한다.
두 CA는 서로 대신할 수 없다.

## 중단, 재개, 개별 상태

```bash
./scripts/stop.sh
./scripts/resume.sh
./scripts/status.sh
./scripts/service.sh status app-a
```

`stop`은 project container/network만 내리고 volume·CA·secret·mode/stage를 남긴다. `resume`은 기록된
단계에 필요한 service만 복원하며 seed를 재적용하지 않는다. 단계보다 앞선 service를 수동 시작하면
필요한 apply 단계를 안내하고 실패한다.

## 선택 실습과 유지보수

MFA, OIDC Brokering, Service Account, DB 격리 복원은 기본 guided 순서 뒤의 선택 실습이다. 구현과
상세 진단은 각각 `internal/seed/seed-d09.mjs`, `seed-d16.mjs`, `seed-d18.mjs`와
`internal/verify/verify-d09.sh`, `verify-d16.sh`, `verify-d18.sh`, `verify-d24.sh`에 있다.
과거 P05~P11 상세 순차 검증도 `internal/verify/`에 있으며 과거 evidence를 요구하므로 현재 상태
확인에는 사용하지 않는다. 현재 확인은 `scripts/verify.sh`가 정본이다.

완전 초기화는 일상적인 시작 명령이 아니다. 먼저 삭제 대상을 읽고, 별도 승인 뒤에만 확인 문자열을 쓴다.

```bash
./scripts/reset.sh --dry-run
./scripts/reset.sh --confirm DELETE-keycloak-lab-compose-state
```

대상은 `keycloak-lab` project의 container/network, 두 named volume, 생성한 CA·secret·lifecycle과
Compose 검증 디렉터리 `p03`, `p05`~`p11`, `d09`, `d16`, `d18`, `d24`, `guided`뿐이다. 다른 Docker
workload, `.state/tools`, 과거 비공개 P04 산출물은 읽거나 삭제하지 않는다. 전역 prune, Colima reset,
kind/kubectl 조작은 없다.

파괴적 전체 재현은 `./scripts/verify-p11.sh --confirm DELETE-keycloak-lab-compose-state`로 호환된다.
실행 전 반드시 reset 범위와 다른 workload 보존 조건을 다시 확인한다.

## 더 읽기

- 사이트: [Compose 실습 환경](../../src/content/docs/keycloak/lab-setup.mdx),
  [실습 코드에서 읽을 것](../../src/content/docs/keycloak/lab-code-guide.mdx)
- 결정: [decisions.md](decisions.md)
- 실제 검증 결과와 미실행 범위: [verification.md](verification.md)
