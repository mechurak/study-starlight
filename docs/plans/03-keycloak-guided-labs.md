# 3. Keycloak 실습 학습 경로와 코드 구조 개편

작성일: 2026-09-15
상태: 완료
지금 위치: M01 → M01-C → M02~M13 구현·검증·기록 완료
실행 범위: M01 → M01-C → M02~M13 전체 구현·검증·기록. 기존 데이터와 비대상 workload를 보존하고
초기화는 별도 허용 없이 실행하지 않는다. 커밋·푸시·배포는 하지 않는다.

[계획 관리 규칙](README.md)을 따른다. 후속 실행 요청을 받으면 위 실행 범위를 갱신하고 의존 순서로
진행한다. 이 계획은 서브에이전트나 병렬 에이전트 실행을 요구하지 않는다.

## 목표

소유자가 Keycloak 덱에서 실습을 시작할 때 다음을 알 수 있게 한다.

- 어떤 파일을 읽고 어떤 설정을 직접 바꾸는가.
- 환경 준비 스크립트는 무엇을 대신하며, 내부 구현은 어디까지 건너뛰어도 되는가.
- Client·Role·LDAP·Mapper 하나를 적용하면 로그인·token·API 결과가 어떻게 달라지는가.
- 실습 중간에 멈췄다가 어디서 이어 가며, 완성된 환경에서는 어떻게 복습하는가.

`labs/keycloak/`는 같은 레포에 유지한다. 본문과 실행 코드를 함께 관리하는 현재 목적에 맞고,
레포 분리로는 학습용 설정과 내부 자동화가 섞인 문제가 해결되지 않는다.

사용자 후속 결정: 이해하기 쉽도록 **이 lab은 Compose 전용**으로 정리한다. `kind/`, `k8s/`,
`kind.yaml`과 관련 실행·검증 의존성을 삭제한다. 초기 계획의 선택 실습 파일 보존 방침은 폐기한다.
과거 실행 결과는 이력 문서로 남기고, 현재 사용법에서 선택 경로로 안내하지 않는다.

## 완료 조건

- [x] 덱 index와 실습 README에서 학습 시작점·읽을 코드·자동화 역할을 찾을 수 있다.
- [x] 기본 개념 실습을 진행하는 데 `P07`, `P08`, `D09` 같은 과거 구현 ID를 알 필요가 없다.
- [x] 공개된 Keycloak 설정 파일을 읽고 적용하며, 대응하는 콘솔 항목과 결과를 확인할 수 있다.
- [x] 기반 환경 → 앱 A → 앱 B SSO → API → LDAP 로그인 → 그룹/역할/claim을 순서대로 재현한다.
- [x] 기반 환경과 앱 B 단계에는 각각 아직 만들지 않은 Client·LDAP·API 등이 몰래 생성되지 않는다.
- [x] 적어도 redirect, role, group claim 세 가지를 직접 바꿔 예상 결과와 복구를 확인한다.
- [x] 각 실습은 시작 상태·설정 이유·명령/조작·예상 결과·읽을 코드·복구·다음 장을 제공한다.
- [x] `app/`에는 앱/API 실행 예제가 있고 seed·검증 코드는 내부 자동화 위치로 분리된다.
- [x] 기존 인자 없는 최초 시작은 완성 환경을 만들며, 기존 데이터와 issuer·CA·secret 계약을 유지한다.
- [x] 단계별 실행의 재적용·실패 후 재개·보존 중단/재개와 기존 완성 환경 재개를 검증한다.
- [x] 학습용 확인 명령은 과거 검증 기록·kind·kubectl 없이 동작하며 설정을 자동 복구하지 않는다.
- [x] `labs/keycloak/kind/`, `k8s/`, `kind.yaml`이 없고 모든 유지하는 실행 코드에서 kind/kubectl 호출,
  P04 기록 선행 조건과 전용 보존 검사가 제거돼 있다.
- [x] 기존 MFA·Brokering·Service Account·DB 복원 및 전체 재현 경로가 계속 연결돼 있다.
- [x] 변경한 실행 경로의 실제 macOS/Colima 결과와 사이트 `pnpm check` 결과를 구분해서 남긴다.

계획 02의 Ubuntu 검증 보류는 그대로 유지한다. 이 계획의 완료 조건에 Ubuntu 신규 실측을 추가하지
않는다. 다만 이 계획에서 바꾼 실행 경로의 필수 검증이 미실행이면 그 작업을 완료로 표시하지 않는다.

## 범위와 경계

### 포함

- Keycloak lab의 파일 역할 분리, 공개 명령 정리, 공개 설정 추출.
- kind/Kubernetes 실습 파일 삭제, P04 의존성·보존 검사 제거, 현재 안내에서 해당 경로 제거.
- 같은 `study` realm과 기존 Compose 환경을 사용하는 단계별 학습 모드 추가.
- 기존 전체 자동 설정을 동일한 단계 구현의 조합으로 유지.
- 핵심 실습 본문 4개와 코드 안내 1개 추가, 관련 개념 페이지의 연결 수정.
- token 원문을 복사하지 않고 claim을 확인하는 최소 API 출력.
- 현재 사용법·검증 기록·baseline에 최종 계약 반영.

### 제외

- 레포 분리, Git submodule, 패키지 배포, 새 프레임워크/범용 실습 관리 도구.
- Keycloak·Node·Samba·PostgreSQL 버전 변경, 의존성 일괄 업그레이드.
- 별도 학습용 realm/Compose stack/VM 추가, 기존 `study`를 다른 이름으로 변경.
- kind·Kubernetes OIDC·oauth2-proxy·실제 AD DS·운영 HA 실습 확장.
- 실행 중인 kind cluster·host kubeconfig·설치된 도구와 기존 비공개 이력 파일의 일괄 정리.
  이번 삭제는 추적된 실습 자산과 관련 코드·현재 안내를 대상으로 한다.
- MFA·Brokering·서비스 계정 실습의 내용 전면 개편. 이번에는 경로와 분류만 정리한다.
- 사이트 공용 컴포넌트·테마·라우팅 개편, 모든 덱의 labs 구조 일괄 표준화.
- 기존 상세 증거·계획 02의 과거 실행 기록을 새 이름으로 전면 다시 쓰는 작업.

실행 단계에서 기존 실습 데이터를 지우거나 host 신뢰 저장소를 바꿀 필요가 생기면 현재 세션의
허용 범위를 확인한다. 이미 받은 허용은 다시 묻지 않는다. 허용이 없으면 독립적인 코드·문서·정적
검증을 먼저 마치고, 정확한 대상과 필요한 조치를 보고한다. 전체 재현을 이유로 자동 reset하지 않는다.

## 실행자가 읽을 것

매 세션은 이 문서 머리·실행 기록·현재 작업 상세, `git status --short`와 해당 diff부터 확인한다.

| 작업 | 필수 입력 |
|---|---|
| 공통 | [AGENTS.md](../../AGENTS.md), [루트 README](../../README.md), [검증 지침](../verification.md), [Keycloak baseline](../../src/content/docs/keycloak/_baseline.md) |
| 실행 코드 | [lab README](../../labs/keycloak/README.md), [환경 결정](../../labs/keycloak/decisions.md), [Compose](../../labs/keycloak/compose.yaml), 변경할 코드와 호출자 |
| 실제 결과 확인 | [lab 검증 기록](../../labs/keycloak/verification.md)의 해당 항목과 최신 후속 결과 |
| 콘텐츠 | [콘텐츠 작성 규칙](../content-authoring.md), [덱 메타데이터](../../src/content/docs/keycloak/_deck.mjs), 수정할 본문 |
| D2를 실제로 수정할 때만 | [D2 작성 규칙](../d2-authoring.md) |
| 기존 작업과 관계 확인 | [계획 02](02-keycloak-rework.md)의 머리와 마지막 차단/재개 조건. 전체 과거 로그를 매번 읽지 않는다. |

콘솔 메뉴·Admin REST 필드·라이브러리 동작을 새로 설명할 때는 구현 시점에 아래 공식 문서와 현재
고정 버전의 소스를 확인한다. 이 계획의 설계안을 공식 제품 동작을 검증한 결과로 간주하지 않는다.

- [Keycloak 26.7 Server Administration](https://www.keycloak.org/docs/26.7.0/server_admin/): Client, User Federation, Role, Mapper, Sessions.
- [Keycloak Admin REST](https://www.keycloak.org/docs-api/latest/rest-api/index.html): 실제 이미지 26.7.3과의 차이를 확인하고 사용한다.
- [Keycloak realm import](https://www.keycloak.org/server/importExport): 기존 realm에 시작 import를 재적용하는 것으로 업데이트를 대신하지 않는다.
- [openid-client 공식 소스](https://github.com/panva/openid-client), [jose 공식 소스](https://github.com/panva/jose): lockfile의 버전에 맞춰 확인한다.

## 조사 결과와 설계 이유

계획 작성 시 작업 트리는 clean이었다. 실제 Docker 상태나 `.state`의 비밀값은 조회하지 않았다.

| 확인한 현재 구현 | 개편에서 다룰 문제 |
|---|---|
| `scripts/first-start.sh`가 prepare 3개, app-a/p07/p08 seed, 여섯 service 기동을 모두 수행 | 학습 전에 Client·API·LDAP·그룹 매핑이 완성됨 |
| `app/seed-p07.mjs`에 앱 B·API client·role·audience가 함께 있음 | SSO와 API 인가 단계를 분리할 필요 |
| `app/seed-p08.mjs`에 LDAP provider·LDAP mapper·role mapping·protocol mapper·진단 client가 함께 있음 | LDAP 로그인 성공과 group/claim/API 권한의 원인을 따로 관찰하기 어려움 |
| `scripts/prepare-p05/p06/p07-state.sh`는 CA·인증서·secret 준비 | Keycloak 설정 학습 대상과 혼동하지 않게 분리 |
| `compose.yaml`의 `app-b.depends_on`에 `api`가 포함 | 앱 B SSO만 시작해도 API가 먼저 기동되는 의존성을 조정해야 함 |
| `scripts/status.sh`와 `resume.sh`는 항상 여섯 service를 요구 | guided 중간 단계의 정상 상태와 재개를 표현할 수 없음 |
| `scripts/verify-p08.sh`는 `.state/verification/p04/cluster.txt`와 이전 단계 증거를 요구 | 학습용 확인 명령으로 직접 감싸면 kind/과거 기록 의존이 다시 생김 |
| `verify-p07.mjs`는 SSO와 API 결과를 함께 검사, `verify-p08.mjs`는 전용 진단 client도 사용 | 단계 전용 검사는 필요한 동작만 분리하고 진단 client를 자동 생성하지 않아야 함 |
| `app/Dockerfile`이 `seed-*.mjs`까지 앱 image에 COPY | 코드 위치 변경 시 image COPY·Compose mount·Node import 경로를 함께 다뤄야 함 |
| `app/server.mjs`는 로그인·callback·session·API 전달, `api.mjs`는 JWT 검증·role 검사 | 학습용 참고 코드는 작고 유용하므로 이 흐름을 중심으로 안내 |
| `clients-and-sso.mdx`, `ldap-federation.mdx` 등은 개념·완료 결과 중심 | 직접 설정/관찰/복구하는 절차를 별도 실습으로 연결 |
| index에는 실제 Chrome 미검증 문구가 있고 최신 lab 기록에는 대표 Chrome 경로 통과가 있음 | 현재 요약의 불일치는 최신 근거에 맞춰 수정, 과거 기록은 보존 |

## 구현 계약

아래 경로와 명령은 **목표 설계**다. 구현 전부터 존재하거나 실행 가능한 것으로 안내하지 않는다.
작은 모델이 작업마다 인터페이스를 새로 설계하지 않도록 이 계약을 우선한다. 실제 코드와 충돌하면
근거·영향·수정안을 이 문서의 결정 기록에 적고 범위 안에서 가장 작은 수정을 한다.

### 학습자가 보는 코드와 명령

```text
labs/keycloak/
  README.md                    # 시작·중단·재개·학습 링크, 명령의 정본
  compose.yaml                 # 기존 service·network·volume 원본
  keycloak/
    study-realm.json            # 기반 realm/local-user import
    clients/                   # app-a.json, app-b.json, lab-api.json
    roles/                     # realm-roles.json
    federation/                # samba-ad.json, ldap-groups.json
    mappers/                   # api-audience.json, groups-claim.json
    mappings/                  # local-user-roles.json, group-roles.json
  app/
    server.mjs                 # 앱 A/B 공용 로그인·세션·API 전달
    api.mjs                    # 검증·인가·학습용 claim 출력
    Dockerfile                 # 기존 image·의존성 유지
    ...                        # package/lockfile, healthcheck
  scripts/
    first-start.sh             # 기존 완성 환경 + 새 --guided
    apply.sh                   # 주제 한 단계의 공개 설정 적용
    verify.sh                  # 현재 단계 결과 확인
    status.sh / stop.sh / resume.sh / service.sh / reset.sh
    verify-p11.sh              # 기존 전체 초기화 재현의 호환 진입점만 유지
  internal/
    runtime/                   # lifecycle-common, prepare-*, 인증서 확장 설정
    keycloak/                  # entrypoint, Admin REST 공통 처리, 주제별 적용
    seed/                      # 기존 p07/p08 및 보조 seed 호환 조합
    verify/                    # 기존 상세 검증 코드와 단계별 검사
  samba/                       # 디렉터리 실행 대역. 현 구조 유지
  decisions.md / verification.md
  .state/                      # 기존 Git 제외 상태
```

`internal/`에 README를 추가한다면 파일별 긴 설명을 복제하지 말고 역할·진입점·경로 규칙만 짧게 둔다.
모든 내부 파일명을 이번에 의미 기반으로 바꿀 필요는 없다. `P/D` ID는 내부 호환·과거 증거에서 유지하고
학습자의 기본 실행 순서에서만 제거한다. `scripts/`에 예전 검증별 wrapper를 전부 남기지 않는다.

### 공개 설정의 원본과 내용

기존 seed의 필드를 의미 변경 없이 먼저 추출한다. 아래 공개 JSON과 적용 코드에 같은 값을 중복 보관하지
않는다. secret·서버 생성 ID·LDAP parentId는 내부에서 주입하고 JSON에는 넣지 않는다.

| 새 파일 (`keycloak/` 기준) | 추출 원본 | 담을 내용 |
|---|---|---|
| `clients/app-a.json` | `keycloak/seed-app-a.sh`의 Client JSON | confidential, Code, S256, 정확한 callback, 사용하지 않는 flow off |
| `clients/app-b.json` | `app/seed-p07.mjs`의 appB | 앱 B의 별도 client/callback |
| `clients/lab-api.json` | 같은 파일의 lab-api | 현재 API client 표현 |
| `roles/realm-roles.json` | 같은 파일의 ensureRole 호출 | `app-user`, `api-admin` RoleRepresentation 배열 |
| `mappings/local-user-roles.json` | 같은 파일의 local-user role 처리 | `{ "username": "local-user", "grant": ["app-user"], "revoke": ["api-admin"] }` |
| `mappers/api-audience.json` | 같은 파일의 audienceMapper | access token의 `aud=lab-api` |
| `federation/samba-ad.json` | `app/seed-p08.mjs`의 ldapProvider 표현 | LDAPS, READ_ONLY, DN, attribute, import/cache/sync 설정 |
| `federation/ldap-groups.json` | 같은 파일의 groupMapper 표현 | `lab-groups`, member DN, 두 그룹 filter |
| `mappings/group-roles.json` | 같은 파일의 ensureGroupRole 호출 | `[{ "group": "/app-users", "roles": ["app-user"] }, { "group": "/api-admins", "roles": ["api-admin"] }]` |
| `mappers/groups-claim.json` | 같은 파일의 groupClaimMapper | access token `groups`, full path |

`mappings/*.json` 두 개는 이 lab의 이름 기반 적용 입력이며 Keycloak에 그대로 import하는 포맷이 아님을
명시한다. 다른 파일도 Client/Component/Mapper 등 적용 대상 API를 설명한다. 특히 federation config의
문자열 배열을 임의로 boolean/숫자로 바꾸지 않는다. `study-realm.json`의 secret 치환은 기존 방식을 유지한다.

학습 본문은 중요 필드와 이유를 설명하고 전체 seed 소스를 복사하지 않는다. 공개 JSON 수정 → 해당
`apply.sh` 실행 → 콘솔에서 실제 저장값 확인을 기본 설정 방법으로 한다. 콘솔에서 직접 바꾸는 관찰
실습도 제공한다. 인증서 생성·관리 인증·ID 조회·중복 방지는 내부 자동화에 맡긴다.

### 명령과 단계 계약

모든 명령의 작업 디렉터리는 `labs/keycloak`이다. 기존 인자 없는 `first-start.sh`는 완성 환경을 만드는
현재 동작을 유지한다. 최초 학습 안내에서는 `--guided`를 명시한다.

```bash
./scripts/first-start.sh --guided
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

| 완료 단계 | 바로 이전 단계 | 새로 적용할 설정 | 정상 상시 service | 아직 적용하지 않는 것 |
|---|---|---|---|---|
| `base` | 빈 상태 | 기존 CA/secret, Samba seed, `study`와 local-user import | samba, postgres, keycloak | 앱 client·API role/audience·Federation |
| `app-a` | base | app-a client | 위 + app-a | app-b·API·LDAP |
| `app-b` | app-a | app-b client | 위 + app-b | API·LDAP |
| `api` | app-b | lab-api·두 role·local-user role·A/B audience mapper | 위 + api, 총 여섯 | LDAP·외부 group mapper |
| `ldap` | api | samba-ad provider, user full sync | 여섯 | lab-groups·외부 group role mapping·groups claim |
| `groups` | ldap | LDAP group mapper/sync, group-role, A/B groups claim | 여섯 | 보조 MFA/Brokering/Service Account는 별도 |

기반 환경이 만드는 realm/local-user/Samba 사용자도 README에서 명시한다. 빈 Keycloak에 realm을
콘솔로 처음 만드는 실습까지 범위를 넓히지 않는다. `realm-and-users`에서 import 설정과 실제 값을 읽는다.

- `apply`는 allowlist의 다섯 이름만 받는다. 한 단계씩 진행하며, 선행 단계 누락 시 무엇이 필요한지
  출력하고 변경 전에 실패한다. 앞 단계를 자동으로 적용하지 않는다.
- 선행 상태 판정은 필요한 객체의 존재와 현재 완료 단계로 한다. 복구하려는 대상 설정의 정상 로그인까지
  먼저 요구하지 않는다. 잘못된 redirect를 적용하는 관찰 실습도 가능해야 하므로 apply 성공과 로그인
  검증 성공은 별개다. JSON 형식 오류나 대상 이름 충돌은 변경 전에 거부한다.
- 이미 완료한 단계는 다시 적용할 수 있다. 해당 단계가 소유한 설정만 원본 값으로 적용하며 후속
  단계가 추가한 mapper/role을 지우지 않는다. 완료 단계는 뒤로 내려가지 않는다.
- 초기 모드 `ready`는 같은 단계 구현을 순서대로 호출한다. ready 전용 설정 복사본을 만들지 않는다.
  기존 P08 진단 client 등 전체 재현 전용 seed는 ready의 내부 후처리로 유지할 수 있다.
- `verify`는 검사만 수행한다. 누락 Client 생성·role 보정·LDAP sync·seed·container 재기동을 하지 않는다.
  로그인 검사로 session/event가 생기는 것은 명시하며, 이를 완전한 read-only라고 부르지 않는다.
- `verify`의 인자는 `app-a`, `sso`, `api`, `ldap`, `groups`로 고정한다. 오타/인자 누락은 exit 2,
  선행 조건/검사 실패는 exit 1, 성공은 exit 0. 오류 출력에는 단계·기대값·관찰값을 넣는다.
- token 원문·secret은 출력하지 않는다. 새 증거는 `.state/verification/guided/`에 기록할 수 있지만
  명령의 선행 조건으로 사용하지 않는다.

### 중간 상태·재개·기존 환경 호환

`.state/lifecycle/mode`에는 `guided` 또는 `ready`, `stage`에는 위 표의 완료 단계를 한 줄로 저장한다.
둘 다 allowlist로 읽고 shell `source`하지 않는다. 기존 `first-start-in-progress` marker는 유지한다.
상태 파일은 임시 파일→rename으로 성공 시 갱신하며 `.state`의 기존 권한 규칙을 따른다.

- 최초 준비 시 mode를 기록한다. 기존 자원이 있으면 `--guided`도 자동 초기화/전환하지 않는다.
- 기반 환경 기동이 성공해야 `base`, 단계 설정과 해당 service readiness가 성공해야 다음 stage를 기록한다.
- 설정 후 기동 실패처럼 부분 적용된 상태에서는 같은 명령 재실행으로 이어 간다. marker만 보고
  성공 처리하지 않고 live 객체를 확인한다. 실패한 뒤 완료된 다음 단계로 넘어가지 않는다.
- `status`는 현재 단계에 필요한 service를 검사하고 뒤 단계의 service 부재를 정상적인 미시작으로 표시한다.
  실제 단계와 모드도 표시한다. `status api`처럼 명시적으로 미시작 service를 요청하면 실패한다.
- `resume`는 기록된 단계까지의 service만 복원하고 seed를 재적용하지 않는다. 학습 중 콘솔에서 바꾼
  설정을 보존하며, 완료된 최종 단계나 기존 ready 환경은 현재처럼 여섯 service를 복원한다.
- `service.sh start`로 단계보다 앞선 앱/API를 시작하려 하면 필요한 apply 단계를 안내한다.
- metadata가 없는 기존 환경은 기존 ready 호환 경로로 취급한다. `status`는 읽기만 하며 metadata를
  만들지 않는다. `resume`는 기존 두 volume·필수 상태·여섯 service readiness를 검증한다. 일부 파일이나
  volume이 없는 깨진 환경을 새 guided 환경이라고 추정하지 않는다.
- in-progress marker만 있는 예전 최초 시작도 기존 ready 재개 동작을 보존한다. guided marker가 남은
  최초 시작에서 인자 없는 명령으로 mode를 바꾸지 말고 저장된 mode를 따라간다.
- `stop`은 현재 project의 container/network만 내리고 mode/stage/CA/secret/volume을 남긴다.
- `reset --dry-run`과 기존 확인 문자열은 유지한다. mode/stage는 이미 reset 범위인 lifecycle 아래에
  둔다. P04 전용 보존 분기/출력은 M01-C에서 제거하고, reset 대상은 Compose가 소유하는 상태로
  명시한다. 비공개 과거 이력이나 공유 도구 디렉터리를 새 삭제 대상으로 포함하지 않는다.

### 앱·진단의 학습용 출력

`app/api.mjs`에 `GET /claims`를 추가한다. 기존 `authenticate` 뒤에서만 실행하고 role은 요구하지 않는다.
검증한 access token에서 `iss`, `aud`, `exp`, `groups`, `realm_access.roles`만 반환한다. token·email·
password·cookie·client secret은 포함하지 않고 응답에 `Cache-Control: no-store`를 둔다.

사용자는 기존 앱 proxy를 통해 `/api/claims`, `/api/user`, `/api/admin`을 확인한다. API host port를
추가하지 않는다. `/api/claims`의 JSON은 토큰을 검증한 API의 결과이며 Keycloak 전체 사용자 모델과
같지 않음을 설명한다. 학습용 확인 기능이지 운영 관리 API로 소개하지 않는다.

앱 홈에는 로그인 상태, 준비된 API 링크 정도만 추가한다. `/session`의 기존 응답 계약을 유지한다.
API 이전 단계에는 API가 아직 없다는 설명으로 충분하며 별도 진행도 UI·프런트엔드 framework를 만들지 않는다.
폼 자동화가 의존하는 로그인 링크와 callback 흐름을 유지한다.

## 작업 목록

각 작업은 지정한 수정 범위와 검증·기록까지 마치면 완료다. 전체 실행을 요청받았으면 다음 허용 작업을
이어 간다. 단일 작업만 요청받았으면 다음 작업을 구현하지 않는다.

| ID | 의존성 | 작업 | 완료 판정 |
|---|---|---|---|
| M01 | 없음 | 현재 호출·이동 경로 조사 확정 | 이동표·검증 경로·환경 조건 기록 |
| M01-C | M01 | kind/Kubernetes 실습 자산·의존성 제거 | Compose 전용 실행·검증·안내, 과거 이력 유지 |
| M02 | M01-C | 내부 자동화 파일 이관 | 공개/내부 경계와 모든 실행 참조 연결 |
| M03 | M02 | 공개 설정·Client 적용 분리 | JSON 원본 하나, app-a/app-b 독립 적용 |
| M04 | M03 | API role/audience 적용 분리 | API만 적용, 기존 P07 조합 호환 |
| M05 | M04 | LDAP와 group 적용 분리 | LDAP-only/최종 권한 단계 독립, P08 조합 호환 |
| M06 | M05 | guided lifecycle·apply 진입점 | 단계 전환·실패 재개·ready 호환 |
| M07 | M06 | 학습용 결과·단계 검사 | claim 출력과 과거 증거 없는 검증 |
| M08 | M06, M07 | 실행 회귀·중간 상태 검증 | 실제 실행 근거와 복구 완료 |
| M09 | M08 | 시작 안내·읽을 코드 지도 | README/코드 안내에서 바로 시작 가능 |
| M10 | M09 | Client·SSO·API 실습 본문 | 두 실습의 직접 변경·예상 결과·복구 확인 |
| M11 | M10 | LDAP·group 실습 본문 | 두 실습의 설정/claim/API 경계 연결 |
| M12 | M11 | 보조 실습·영구 문서 정리 | 현재 링크·범위·baseline 정합 |
| M13 | M12 | 최종 검증·완료 기록 | 완료 조건 판정, 필수 검사 통과 |

### M01 — 호출과 이동 계약 확정

입력: `compose.yaml`, `app/Dockerfile`, `scripts/` 전체의 상대 경로, `keycloak/`와 `app/seed-*`,
README/본문의 실행 명령, 계획 02의 현재 재개 명령.

1. 아래 검색으로 호출 위치를 확인하고 이 계획에 실제 이동표를 보완한다.

   ```bash
   git status --short
   rg -n 'verify-|prepare-|seed-|lifecycle-common|script_directory|lab_directory' labs/keycloak
   rg -n 'labs/keycloak|scripts/verify-|P0[3-9]|P1[01]|D09|D16|D18' src/content/docs/keycloak docs/plans/02-keycloak-rework.md
   ```

2. `.state`의 비밀값을 읽지 않는다. 실행을 요청받은 세션에서는 Docker runtime·자원·정확한 project
   존재·기존 mode/stage 여부를 읽기 전용으로 확인하고 M08의 사용 가능한 검증 환경을 기록한다.
3. `samba/`는 유지하고 `kind/`, `k8s/`, `kind.yaml`은 M01-C 삭제 대상으로 확인한다. 루트로부터
   경로를 계산하는 기존 shell 패턴과 `$0`를 쓰는 sourced helper의 동작을 확인한다.
4. 기존 증거가 없는 최초 환경에서도 실행할 수 있는 진단과 과거 순차 검증 전용 진단을 구분한다.
   `verify-p08.sh`를 새 `verify.sh groups`에서 그대로 호출하는 설계는 금지한다.

완료: 파일 삭제·이동·호출자·기존 Compose 명령 보존 표가 구체적이고 후속 작업에서 탐색을 처음부터
반복할 필요가 없다. 삭제할 kind 명령은 호환 대상으로 남기지 않는다.
검증: diff·참조 경로. 이 작업 자체는 서비스나 소스를 바꾸지 않는다.

### M01-C — kind/Kubernetes 실습 자산과 의존성 제거

입력: M01 조사, 아래 삭제/수정표, 사용자 후속 결정. 이 작업은 내부 파일 이동보다 먼저 수행한다.
이미 명시적으로 정한 추적 파일 삭제를 위해 같은 허용을 다시 요청하지 않는다.

삭제할 추적 파일은 다음 8개다. 실행 시 `git ls-files labs/keycloak/kind labs/keycloak/k8s
labs/keycloak/kind.yaml`로 대상을 대조하고, 새 사용자 파일이 있으면 범위를 다시 판단한다.

- `labs/keycloak/kind.yaml`
- `labs/keycloak/k8s/directory-diagnostic.yaml`
- `labs/keycloak/kind/common.sh`
- `labs/keycloak/kind/configure-directory-access.sh`
- `labs/keycloak/kind/create-cluster.sh`
- `labs/keycloak/kind/prepare-tools.sh`
- `labs/keycloak/kind/verify-from-pod.sh`
- `labs/keycloak/kind/verify-p04.sh`

코드와 문서의 후속 정리는 같은 작업에서 수행한다.

| 대상 (`labs/keycloak/` 기준, 이동 전) | 구체적인 변경 |
|---|---|
| `scripts/verify-p05.sh` | kind binary 변수·cluster 조회를 제거하고 P04 cluster/persistence 기록 요구를 제거. 실제 network/port ownership 확인은 유지 |
| `scripts/verify-p06.sh`, `verify-p07.sh`, `verify-p08.sh`, `verify-p09.sh`, `verify-p10.sh` | P04 파일 선행 조건·fingerprint 입력·결과 키에서 P04를 제거. 다른 Compose 단계 검증은 유지 |
| `scripts/verify-p11.sh` | `p04_fingerprint` 함수·호출·cmp·`p04_kind_assets` 출력 제거. 비대상 workload/identity 검사 유지 |
| `scripts/reset.sh` | P04 보존 안내와 전용 예외 제거. Compose 소유 상태를 명시한 삭제 목록 사용 |
| `README.md`, `decisions.md` | 현재 선택 kind 경로·kind 도구 버전 계약·P04 자산 보존 안내 제거. 과거 전환 사실은 이력으로만 표시 |
| `verification.md` | P04 과거 결과는 남기고 현재는 자산을 제거한 Compose 전용 lab임을 최신 요약에 기록 |
| Keycloak `_baseline.md`, `lab-setup.mdx`, `wrapup.mdx` | P04 파일을 후속 선택 실습으로 보존한다는 계약/안내 제거, Compose 전용 경계로 갱신 |
| `kubernetes-oidc.mdx`, `_deck.mjs`, `index.mdx` | 기존 개념·선택 기준 문서는 유지. 삭제한 lab 파일 실행/재개 안내가 있으면 제거하고 개념 참조임을 명확히 함 |
| 계획 02 | 과거 로그·상태는 유지하고 현재 자산 계약은 계획 03을 따른다는 짧은 연결 안내만 추가 |

reset/이력 경계:

1. reset의 검증 기록 대상은 현재 Compose 생성 디렉터리 `p03`, `p05`~`p11`, `d09`, `d16`, `d18`,
   `d24`, 이후 `guided`를 명시한다. 전체 verification 디렉터리에서 특정 이름만 제외하는 방식 대신
   이 목록만 사용한다. 새 Compose 검증 디렉터리를 추가할 때 목록도 갱신한다.
2. P11의 reset 후 잔존 검사는 같은 Compose 삭제 대상 목록을 공유한다. 모든 verification 항목의
   부재나 `! -name p04`를 검사하지 않는다. 과거 검증 기록을 지우거나 가짜로 만들어 통과시키지 않는다.
3. `.state/coredns`, `.state/kubeconfig`, `.state/verification/p04`가 이미 있으면 비공개 과거 산출물로
   두고 읽기·검사·재생성·삭제하지 않는다. 학습 안내나 현재 readiness 조건에는 등장하지 않는다.
4. `.state/tools`는 현재 Compose wrapper도 사용하므로 유지한다. kind 도구 정리를 이유로 디렉터리를
   지우지 않는다. 실제 kind cluster가 주소/port를 점유하면 기존 ownership 검사로 충돌을 보고한다.
   자산 삭제 과정에서 cluster를 자동 삭제하거나 host kubectl context를 바꾸지 않는다.

완료/검증:

- 8개 파일과 해당 tracked 디렉터리가 없어지고, 삭제 파일의 실행 caller/현재 문서 링크가 없다.
- 남은 실행 코드에서 kind/kubectl 실행·P04 선행 조건·전용 보존 검사 0건. 단순한
  `kind_or_kubectl=not_used` 같은 비의존성 설명이나 과거 문서 이력을 실패로 오인하지 않는다.
- shell 문법·Compose config·경로 검사 통과. P04 산출물이 없는 테스트 입력에서도 reset dry-run과
  무확인 guard가 동작하며 명시한 Compose 대상만 다루는지 검사한다. 실제 reset은 이 작업에 필요 없다.
- 현재 README/baseline과 과거 계획 사이에 보존/삭제 지침 충돌이 없음. `pnpm check`를 실행한다.
- 삭제 목록과 Git 이력에서 복구 가능함을 완료 기록에 적는다.

### M02 — 동작 변경 없이 내부 코드 이관

입력: M01 이동표와 M01-C에서 정리한 Compose 전용 코드. 변경 범위: 아래 파일,
호출자·Compose mount·Dockerfile, 사용법의 경로.

| 현재 경로 (`labs/keycloak/` 기준) | 이동 목적지/처리 |
|---|---|
| `scripts/lifecycle-common.sh` | `internal/runtime/lifecycle-common.sh` |
| `scripts/prepare-*-state.sh`, `scripts/*-leaf.ext` | `internal/runtime/` 아래 동일 basename |
| `keycloak/entrypoint.sh` | `internal/keycloak/entrypoint.sh` |
| `keycloak/seed-app-a.sh` | 먼저 `internal/seed/seed-app-a.sh`로 이동, M03에서 공개 JSON 적용 구현으로 대체 |
| `app/seed-*.mjs` | `internal/seed/` 아래 동일 basename |
| `scripts/verify-*.sh`, `scripts/verify-*.mjs` | `internal/verify/` 아래 동일 basename |
| `scripts/verify-p11.sh` | 내부 본체를 호출하는 얇은 호환 wrapper는 기존 경로에 유지 |
| 나머지 lifecycle 공개 스크립트 | 기존 `scripts/` 경로 유지 |

실행 순서:

1. 파일 이동과 호출자 변경을 한 단위로 수행한다. shell 본문을 복제해 두 군데서 유지하지 않는다.
2. 공개 스크립트가 lab 루트를 확정하고 공통 함수에 전달하게 한다. helper에서 호출자의 `$0`를
   자기 위치로 착각하지 않도록 변수 계약을 정한다. 서로 다른 의미에 같은 shell 전역 변수를 쓰지 않는다.
3. Node seed는 Compose에서 `internal/seed/`를 read-only mount해 실행한다. 앱 Dockerfile은
   app/API/healthcheck만 COPY한다. image build context는 `./app`를 유지한다.
4. Node 검증 파일의 container mount 위치는 기존 `/opt/keycloak-lab-app/` 근처를 보존한다.
   ESM dependency 검색이 호스트의 새 `internal/` 위치 때문에 실패하지 않게 한다. 새 import 모듈도
   같은 트리로 mount한다. host Node/npm 설치를 실습 선행 조건으로 추가하지 않는다.
5. compose service/profile 이름, secret mount 이름, `.state/verification/pXX` 경로와 출력 계약은
   그대로 둔다. 과거 증거와 전체 검증을 깨뜨리는 동시 rename을 피한다.
6. 본문·README의 현재 실행 경로를 갱신한다. 계획 02의 과거 로그는 보존한다. 현재 Ubuntu 재개용
   `samba/verify-p03.sh`와 `scripts/verify-p11.sh`는 기존 경로로 계속 실행 가능해야 한다.

완료/검증: 변경 shell의 해당 interpreter 문법 검사, Node `--check`, JSON 파싱, Compose 전체 profile
config의 host source 경로 존재 확인. image build와 대표 seed/진단 module 해석을 확인한다. 무관한
전체 초기화 검증은 하지 않는다. 본문 변경을 포함해 작업을 마감하면 `pnpm check` 한 번.

### M03 — Client 설정 원본과 주제별 적용

입력: 기존 app-a seed와 p07의 app-b 설정. 출력: `keycloak/clients/app-a.json`, `app-b.json`,
`internal/keycloak/admin.mjs`, `clients.mjs`, `apply.mjs` 및 관련 Compose seed entrypoint.

1. JSON에는 native client 필드만 두고 secret을 제외한다. 고정 callback, Code/PKCE, publicClient 등은
   기존 값을 그대로 추출한다. mapper나 사용자가 추가한 필드를 reapply로 날리지 않게 업데이트한다.
2. `admin.mjs`에는 secret 읽기, 관리자 인증, HTTP 실패 확인, 이름으로 단일 객체 조회 정도만 공유한다.
   runtime secret 주입과 객체 적용 코드를 구분한다. 일반 API framework나 범용 templating을 만들지 않는다.
3. `clients.mjs`는 app-a/app-b를 각각 독립 적용한다. secret 파일은 기존 것을 읽고 회전시키지 않는다.
4. `apply.mjs`는 `app-a`, `app-b` 등을 allowlist로 dispatch한다. 다른 module에서 호출할 수 있게
   함수와 CLI entry를 구분한다. module import 자체로 seed가 실행되지 않게 한다.
5. 기존 app-a-seed는 새 적용 함수로 연결한다. p07-seed는 아직 전체 작업을 수행하되 app-b 부분만
   공유 함수로 바꾼다. JSON과 옛 inline 설정이 동시에 원본으로 남아 있지 않게 한다.

완료/검증: app-a/app-b가 각각 1개, 재적용 시 ID·secret·후속 mapper 보존. redirect/flow/PKCE 값이
현재 seed와 동일. 테스트는 중복 생성과 PUT 시 후속 mapper 손실을 잡는 범위에 둔다.

### M04 — SSO와 API 권한 적용 분리

입력: `internal/seed/seed-p07.mjs`, M03 Client 적용. 출력: API 관련 공개 JSON, `internal/keycloak/api.mjs`.

1. API client, 두 Realm Role, local-user 역할, A/B audience mapper를 공개 원본에서 적용한다.
2. local-user에는 기존 계약대로 app-user를 부여하고 api-admin을 회수하되 다른 기본 role을 제거하지
   않는다. `default-roles-study`를 보존한다. 대상 user/client가 중복이면 임의 선택하지 않는다.
3. `seed-p07.mjs`는 app-b → api 함수 조합으로 바꾸고 기존 최종 검증·출력 계약을 유지한다.
4. `compose.yaml`의 `app-b`에서 API의 health 의존성을 제거한다. API는 별도 단계에서 명시적으로
   시작한다. 두 앱은 API 이전에도 login/session이 동작해야 한다.

완료/검증: app-b 단독 기동 시 API를 시작하지 않으며 SSO가 성립. API 적용 후 local-user는
`/user` 200·`/admin` 403, 무토큰 API 요청 401. P07 재적용으로 app-user/default role이 중복/손실되지 않음.

### M05 — LDAP 로그인과 외부 그룹 권한 분리

입력: `internal/seed/seed-p08.mjs`, M04. 출력: Federation/Mapper/Group mapping 공개 JSON,
`internal/keycloak/ldap.mjs`, `groups.mjs`.

1. `ldap`는 provider 생성/갱신과 user full sync까지만 한다. `READ_ONLY`, LDAPS CA, bind credential,
   attribute/DN, 기존 cache 설정을 유지한다. `lab-groups`나 group claim은 만들지 않는다.
2. `groups`는 provider가 존재하는지 확인한 뒤 LDAP group mapper 생성 → group sync → 필요한 cache
   clear → group-role mapping → A/B groups protocol mapper 순으로 수행한다. 두 매핑의 원본을 분리한다.
3. group 이름은 정확한 path로 찾는다. role mapping의 영향은 `/app-users`, `/api-admins`와 지정 role로
   한정한다. 관련 없는 그룹·role·계정을 삭제하지 않는다.
4. p08 전용 진단 client는 `internal/seed/seed-p08.mjs`의 전체 재현 후처리로 분리한다. 기존 P08/P11
   진단에 필요한 client/audience/groups mapper를 보존하되 guided 단계의 필수 요소로 만들지 않는다.
5. p08 호환 seed는 ldap → groups → 진단 준비를 조합한다. 기존 결과 출력과 최종 검사도 유지한다.

완료/검증: ldap 직후 alice/bob은 앱 로그인이 되지만 group 역할은 아직 없음. groups 직후 alice는
user/admin 200, bob은 user 200/admin 403. local-user 역할은 그대로. reapply 후 provider/mapper/group
중복 없음. full user sync와 group sync의 서로 다른 호출을 확인한다.

### M06 — 단계별 실행과 lifecycle

입력: M03~M05 적용 함수, 기존 lifecycle. 변경: 공개 `scripts/apply.sh`, first-start/status/resume/service,
내부 lifecycle helper와 Compose의 단계별 seed service.

1. 위 명령/상태 계약을 구현한다. 모드와 stage allowlist, 잘못된 인자 처리, atomic 완료 기록을 먼저 둔다.
2. `first-start --guided`는 모든 단계에서 사용할 CA/secret을 준비하고 기반 3개 service만 시작한다.
   secret 준비와 Keycloak Client 설정을 같은 단계로 오해하지 않게 로그에 구분한다.
3. `apply.sh`는 해당 단계의 입력 파일 경로·변경 대상 이름을 비밀값 없이 출력하고 seed service 실행
   후 필요한 앱/API를 `--wait`로 시작한다. 단계 성공을 실제 객체/health로 확인한 뒤 stage를 기록한다.
4. stage별 service 목록을 한 원본으로 두고 status/resume/service가 공유한다. ownership 검사에서는
   현재 단계뿐 아니라 기존 여섯 service 전체를 여전히 알고 있어야 한다.
5. 인자 없는 first-start는 같은 단계 구현을 마지막까지 진행하고 기존 진단 seed를 수행한다. first-start
   중인 내부 단계 호출에서 ownership 검사에 일회성 seed container가 자기 자신으로 걸리지 않게 설계한다.
6. ready 기존 환경·옛 in-progress marker·guided 부분 실패를 각각 처리한다. mode와 metadata를
   임의로 삭제해서 오류를 해결하지 않는다. 새 제어 파일은 reset dry-run에도 포함돼야 한다.
7. `apply`용 Compose service는 단계별 필요한 secret만 mount한다. LDAP bind secret을 앱 container에
   주거나 전체 `.state`를 mount하지 않는다. 새 one-off service도 read-only/cap_drop/limit 계약을 따른다.

완료/검증: 아래 M08 상태 조합을 검증할 수 있는 명령이 존재. 순서 건너뛰기 거부, 두 번 적용,
실패 후 같은 단계 재개, metadata 없는 기존 ready 재개를 테스트. 모드를 바꾸기 위해 기존 realm을 지우지 않음.

### M07 — 관찰 가능한 결과와 단계 검사

입력: app 서버/API, 기존 verify-app-a/p07/p08 Node 구현. 출력: `/claims`, 최소 홈 링크,
공개 `scripts/verify.sh`, `internal/verify/guided.mjs`와 필요한 작은 공통 module.

1. 위 claim 출력 계약대로 구현한다. token validation은 기존 `authenticate`를 재사용한다.
2. 단계 검사는 기존 Code+PKCE form/cookie 추적을 재사용하되 읽기 쉬운 함수를 추출한다. 검증을 위해
   Direct Access Grants를 켜거나 진단 client/role을 몰래 생성하지 않는다.
3. `app-a`: local-user 로그인/callback/session, 잘못된 password 거부. `sso`: A에서 한 번 로그인한
   Keycloak cookie로 B에 별도 session 생성, 두 번째 credential 제출 없음.
4. `api`: 무토큰 401, local-user user 200/admin 403, `/claims`에서 검증된 issuer/audience/role 확인.
   앱의 로그인 전 401과 API가 token을 거부한 401을 구분해서 결과를 기록한다.
5. `ldap`: alice/bob의 실제 앱 Code+PKCE 로그인, 오답 거부. 뒤 단계가 이미 완료돼 있어도 로그인
   검사는 통과할 수 있게 group 부재 자체를 이 명령의 필수 조건으로 두지 않는다.
6. `groups`: 앱을 통해 받은 API claim과 200/403을 확인한다. 기존 p08-diagnostic client 없이 동작한다.
7. `verify`는 설정을 고치지 않는다. 일부러 role/claim을 바꾸면 실패해야 하며 복구 명령/절을 안내한다.
   매 실행에 새 cookie jar를 사용해 기존 로그인 결과를 재사용하지 않는다.

완료/검증: historical evidence 폴더 없이 다섯 검사가 실행됨. 공개 설정에 오류를 넣으면 해당 검사가
원인을 드러내고 원본을 재적용하지 않음. `/claims`에는 허용된 필드만 있으며 인증 전 접근 거부.
공개 JS API/UI 변경 검증은 대표 앱 A/B 흐름에 한정한다.

단계 검사에 필요한 secret은 고정된 최소 목록만 mount한다. 앱 검사는 local-user credential과 web CA,
LDAP/group 검사는 alice/bob credential과 web CA를 사용한다. 단계 검증에 관리자 credential이 필요한
설정 조회는 별도 관리 진단으로 분리하고 앱/API container에 관리자 권한을 추가하지 않는다.

### M08 — 실제 실행과 회귀 검증

입력: M06/M07, 현재 runtime·기존 데이터 유무. 변경: 필요한 실패 수정, `verification.md`의 새 결과 절,
관련 자동 테스트. 성공 결과를 얻기 위해 P04나 과거 evidence 파일을 가짜로 만들지 않는다.

| 검증 조합 | 확인할 결과 |
|---|---|
| 빈 상태 guided base | 기반 3개 healthy, app client/API/Federation 부재 |
| app-a → app-b | 순서대로 기동, API container 부재, SSO 검사 통과 |
| api → ldap → groups | 해당 단계 검사 통과, 서로 다른 사용자 권한 결과 |
| app-b에서 stop/resume | 5개 service 복구, API를 새로 만들지 않음 |
| groups에서 stop/resume | 6개 복구, SID/realm·user·group·secret/CA 보존 |
| app-a/api/groups 재적용 | ID/secret 및 뒤 단계 설정 보존, 중복 객체 없음 |
| 앞 단계 건너뛰기·알 수 없는 stage | 변경 전 실패, 현재 완료 단계 유지 |
| 설정 적용 후 readiness 실패 | 성공 marker 미승격, 같은 명령으로 이어서 완료 |
| metadata 없는 기존 ready 환경 | 기존 resume/status 성공, 설정 재seed 없음 |
| P04 파일·kind/kubectl이 없는 환경 | 전체 유지하는 Compose 경로에 P04 선행 조건/보존 검사 없음 |
| 인자 없는 최초 시작 | 종전 완성 환경·진단 client 준비, 기존 최종 검증 통과 |
| 잘못된 redirect/role/claim | 실패 관찰 → 해당 값 복구 → 새 로그인에서 정상 결과 |

검증 방식:

1. 실제 환경의 현재 상태에서 가능한 보존형 검사부터 한다. metadata/분기/실패 처리는 임시 파일과
   좁은 command stub으로 테스트할 수 있다. stub 성공을 실제 Keycloak/Compose 실행 성공으로 쓰지 않는다.
2. 새 guided 최초 상태는 실제 빈 실습 환경에서 확인해야 한다. 기존 ready를 reset 없이 guided로
   바꾸는 임시 우회 명령을 추가하지 않는다. 빈 환경이 없고 초기화 허용이 없으면 해당 검증을 미실행으로
   기록하고 독립 작업을 계속한다. 최종에는 exact reset 대상과 필요한 실행을 보고한다.
3. 기존 전체 초기화 검증은 현재 세션에서 허용됐을 때만 수행한다. 기존 `verify-p11.sh`를 보존한 채
   ready 전체 재현과 identity·비대상 workload 보존을 확인한다. 최초 전체 경로 검증을 이 검사와
   중복 수행하지 않도록 순서를 정한다.
4. 자동 로그인 진단과 실제 Chrome 검증을 구분한다. 대표 앱 로그인/SSO/claim 확인의 화면 조작이
   본문대로 가능한지에만 브라우저를 사용한다. Keycloak 덱 사이트 전체를 순회하지 않는다.
5. 기존 보조 seed의 경로/공통 코드가 바뀌면 해당 MFA/Brokering/서비스 계정 진단을 실행한다.
   DB 복원 스크립트는 경로와 실행 의존성 변경에 맞춰 최소 검사하고 실제 실행 여부를 명확히 남긴다.

완료: 실제 통과·정적 통과·미실행을 분리한 결과표. 기존 volume/CA/secret·비대상 workload를 보존.
새 실행 코드 오류는 이 단계에서 고친다. 미실행 핵심 항목이 있으면 M08을 done으로 기록하지 않는다.
문서 초안 작업 M09~M12는 명령 계약이 확정된 부분부터 가능하되 미실행을 성공 문구로 바꾸지 않는다.

### M09 — 실습 진입점과 읽을 코드 지도

입력: 확정된 공개 명령과 M08 결과. 변경: `labs/keycloak/README.md`, 루트 README의 labs 위치,
`lab-setup.mdx`, 신규 `lab-code-guide.mdx`, `_deck.mjs`, `index.mdx`.

1. README 첫 화면에 목적·guided 시작·기존 환경 resume·학습 순서·코드 분류를 둔다. reset/P11은
   별도 유지보수 절로 내린다. 초보자가 명령 요약을 위에서 아래로 실행하다 초기화하지 않게 한다.
2. `lab-code-guide`에 반드시 읽을 공개 설정, 흐름을 읽을 앱/API, 사용법만 알 내부 자동화를 구분한다.
   파일 수만 보여 주지 말고 `이 파일에서 이해할 것 / 건너뛰어도 되는 구현`을 적는다.
3. `lab-setup`은 runtime/resource/hosts/CA/최초 시작/중단·재개까지만 설명하고 상세 학습은 연결한다.
   기존 환경이 이미 완성됐다면 검사/관찰부터 시작하는 복습 경로를 제공한다. fresh guided가 꼭
   필요한 부재 관찰은 별도로 표시하며 복습을 위해 데이터를 지우게 하지 않는다.
4. browser용 세 hosts 이름, Admin Console·앱 A/B URL, `lab-admin`·local-user·alice/bob의 용도를
   안내한다. 비밀번호가 있는 정확한 `.state/secrets/` 파일 경로와 로컬 확인 방법을 설명하되 문서나
   검증 로그에 실제 값을 저장하지 않는다. web CA 신뢰와 directory CA 신뢰를 혼동하지 않게 한다.
5. 본문에서 lab source는 확인한 GitHub 원격 `mechurak/study-starlight`의 파일 링크로 연결한다.
   로컬 절대 경로나 사이트 `/labs/` URL을 쓰지 않는다. README의 로컬 상대 링크도 함께 유지한다.
6. index는 규칙대로 LinkButton 하나와 DeckMap 하나를 유지하고 실습 진입은 LinkCard/본문 링크로
   추가한다. 새 group은 만들지 않고 아래 페이지 배치표를 따른다.

완료/검증: README만 읽어도 환경 시작·본문 이동·참고 코드 열기가 가능. 링크한 repository 파일이
실제 존재. `reviewedAt`은 실제 사실 확인 범위에 맞게 처리. `pnpm check`.

### M10 — Client·SSO·API 직접 실습

입력: M09, 공개 Client/API 설정, `server.mjs`·`api.mjs`. 변경: 신규 실습 2개와 해당 개념 페이지 링크.

`client-login-lab.mdx`:

1. base 시작 상태 확인 → app-a JSON의 client authentication/redirect/Code/PKCE 설명 → apply app-a.
2. 콘솔에서 실제 Client 값을 확인하고 앱 A에서 local-user 로그인, callback과 앱 session을 관찰한다.
3. 공개 JSON의 redirect URI path 하나를 의도적으로 잘못 바꾸고 app-a 재적용 → 새 로그인 실패를
   확인 → 원래 값으로 복구·재적용 → 새 로그인 성공. 넓은 wildcard/TLS 우회로 해결하지 않는다.
4. 읽을 코드는 Client JSON과 server의 `/login`, `/callback`, `/session`. 보일 결과와 역할을 명시한다.

`sso-api-lab.mdx`:

1. app-a 완료 → app-b 적용 → 같은 브라우저에서 B 로그인, password 재입력 없이 별도 앱 session 확인.
2. api 설정 읽기·적용 → local-user user 200/admin 403 → `/api/claims`의 aud와 role 확인.
3. 콘솔에서 local-user의 app-user만 회수 → 기존 앱 session 결과와 새 로그인 결과 비교 → 새 token으로
   user 403 확인 → 원래 역할을 복구 → 새 로그인 user 200. 기본 realm role은 건드리지 않는다.
4. 새 로그인 방법을 정확히 적는다. 현재 앱에는 local logout/refresh UI가 없으므로 자동 갱신을
   가정하지 않는다. 독립 브라우저 session 또는 명시적인 `/login` 재진입으로 code 교환과 token 교체를
   확인한다. SSO를 시험하는 A/B 단계에서는 같은 브라우저 session을 사용한다.
5. API의 인증/인가 코드와 secret/앱 session/Keycloak session의 차이를 연결한다.

완료/검증: 모든 변경 실습에 복구 절차가 있고 다음 단계의 정상 상태로 끝남. 실제로 확인하지 못한
콘솔 경로는 공식 문서/고정 버전으로 확인하고 미검증 여부를 표시. 개념 본문을 실습에 장문 복제하지 않음.

### M11 — LDAP 로그인·그룹 권한 직접 실습

입력: M10, LDAP/Mapper JSON. 변경: 신규 실습 2개, 외부 디렉터리 개념 페이지의 실습 링크.

`directory-login-lab.mdx`:

1. api 완료 상태에서 Samba의 alice/bob·두 원본 그룹이 기반 준비로 생성됐음을 확인한다.
2. provider JSON의 LDAPS/CA, users DN, bind DN, attribute, READ_ONLY/import를 읽고 ldap만 적용한다.
3. 콘솔에서 provider와 imported user를 확인하고 alice/bob의 앱 로그인 성공·오답 실패를 관찰한다.
4. 아직 group 역할을 연결하지 않아 API는 권한 부족일 수 있음을 보여 준다. 로그인 성공을 API 권한
   성공으로 설명하지 않는다. 완성 환경 복습자는 이 중간 상태 결과와 자신의 차이를 알 수 있어야 한다.

`directory-permissions-lab.mdx`:

1. LDAP group mapper → Keycloak group/role → OIDC group claim/audience → API를 현재 설정 파일과
   일대일로 연결한다. apply groups 이후 각 경계의 콘솔 값과 claim을 확인한다.
2. alice user/admin 200, bob user 200/admin 403을 서로 다른 로그인 session에서 관찰한다.
3. app-a의 Group Membership protocol mapper에서 access token 포함을 끈다. 새 로그인 token의
   groups가 사라져도 이 API는 realm role로 인가하므로 role이 유지되면 API 허용은 그대로임을 확인한다.
   원래 값으로 복구 후 새 token의 groups를 다시 확인한다. app-b mapper는 건드리지 않는다.
4. LDAP 원본 그룹 변경/disable/장애 시간축은 기존 `directory-changes.mdx`의 선택 심화로 연결한다.
   이 새 기본 실습을 위해 Samba 장애나 계정 disable까지 추가 실행하지 않는다.

완료/검증: LDAP mapping, group-role 정책, protocol mapper, API 인가의 서로 다른 책임이 행동과 결과로
드러남. group claim을 끄면 무조건 403이라는 잘못된 기대를 쓰지 않음. 모든 변경 복구 후 groups 검사 통과.

### 새 페이지 배치와 기존 페이지의 책임

M09~M11에서 페이지를 추가하기 직전에 order 충돌을 확인한다. 아래 값이 이미 쓰였다면 같은 그룹의
인접 빈 값을 골라 이 표를 갱신한다. 페이지 제목·slug에 단계 번호를 넣지 않는다.

| 새 slug | 제목 | deckGroup / order | 읽을 원본 |
|---|---|---|---|
| `lab-code-guide` | 실습 코드에서 읽을 것 | foundations / 1015 | README, compose, 공개 설정, app, internal 역할 |
| `client-login-lab` | Client를 연결하고 로그인 확인하기 | login / 1045 | app-a.json, server.mjs |
| `sso-api-lab` | 두 앱 SSO와 API 권한 실습 | access / 1075 | app-b/API/role/audience JSON, api.mjs |
| `directory-login-lab` | 외부 디렉터리 계정으로 로그인하기 | directory / 1125 | samba-ad.json, Samba seed 참조 |
| `directory-permissions-lab` | 외부 그룹을 Token과 API 권한으로 연결하기 | directory / 1135 | ldap-groups/group-roles/groups-claim JSON |

기존 `realm-and-users`, `oauth-oidc`, `clients-and-sso`, `token-validation`, `groups-and-roles`,
`scopes-and-mappers`, `samba-directory`, `ldap-federation`, `directory-group-mapping`은 개념·참조 역할을
유지하고 해당 실습을 연결한다. 기존 제목/anchor는 불필요하게 바꾸지 않는다. 변경했다면 legacy route의
anchor map도 확인한다. 실습 본문에는 Thesis/TermIntro/요약과 위에서 정한 실행 절차를 둔다.

### M12 — 보조 경로와 영구 문서 정리

입력: M09~M11 결과와 변경된 내부 경로. 변경: `README.md`, `decisions.md`, `verification.md`, baseline,
index/wrapup/glossary/troubleshooting, MFA/Brokering/Service Account/backup/directory-changes의 실행 참조.

1. README에 기본 학습·선택 실습·유지보수의 역할을 구분한다. 선택 실습은 내용과 실행 명령을
   연결하고 내부 D ID를 사용자가 먼저 찾아야 하는 형식으로 두지 않는다. 필요하면 의미 있는 이름과
   내부 명령을 표로 대응시키며 공개 wrapper를 주제마다 추가하지 않는다.
2. `internal/verify`의 역사적 순차 검증은 필요한 증거 파일을 명시한다. 현재 환경 확인에는 새
   `verify.sh`를 우선 안내하고 P05~P09 shell 검증을 전체 학습 순서로 노출하지 않는다.
3. baseline에 공개 설정 원본·guided/ready·현재 단계 재개·코드 읽기 범위를 추가한다. 기존 버전·issuer·
   자원·Samba/Ubuntu 제한을 그대로 유지한다. 세부 명령은 README에만 둔다.
4. decisions에는 구조/모드/상태/적용 책임 결정을, verification에는 실제 새 검사 결과와 미실행을 적는다.
   과거 시점의 보류 문구는 지우지 않고 최신 요약이 무엇인지 구분한다.
5. index와 wrapup의 Chrome 상태를 최신 실제 근거로 맞춘다. OTP의 Chrome 미실행 등 다른 범위까지
   완료로 확장하지 않는다. Ubuntu P03/P11 보류와 계획 02 상태는 유지한다.
   kind/Kubernetes lab 경로는 기본·선택 실습 모두에서 제거하고, Kubernetes OIDC 개념 참조와
   과거 P04 실행 이력만 각자의 위치에 둔다.
6. 루트 README에는 `labs/`의 존재와 Keycloak README 링크만 보강한다. AGENTS에 lab의 세부 실행
   규칙을 늘리지 않는다. 이 계획이 영구 사용법의 유일한 위치가 되지 않게 한다.

완료/검증: 현재 본문/README의 실행·파일 링크가 실제 새 위치에 연결, 과거 ID가 기본 학습 필수어로
남지 않음. 관련 glossary/wrapup과 `_deck.mjs` map 일치. 사이트 `pnpm check`.

### M13 — 최종 판정과 마감

1. 완료 조건과 실행 기록을 대조한다. 실행하지 않은 항목은 미실행 사유·재개 명령·필요 환경을 적는다.
2. 마지막 결과에 영향을 주는 변경 뒤 아직 수행하지 않은 필수 검증만 실행한다. M08에서 통과한
   전체 환경 검증을 문장 수정 때문에 반복하지 않는다.
3. 최종 사이트 콘텐츠·코드·설정 변경 묶음에 `pnpm check` 한 번을 실행한다. 앞선 체크 이후 변경이
   없다면 이미 통과한 결과를 재사용한다. `git diff --check`, 변경 경로와 임시 산출물도 확인한다.
4. 사용자가 README → guided 시작 → 첫 실습 → 참고 설정/앱 코드로 이동할 수 있는지 소스로 확인한다.
   사이트 페이지 추가만을 이유로 브라우저를 실행하지 않는다.
5. 완료된 범위·검증 근거·제한·영구 문서 위치를 아래 완료 기록에 적고 계획 목록 상태도 갱신한다.
   필수 실제 검증이 남으면 완료로 바꾸지 않는다. 커밋·푸시는 별도 사용자 요청을 따른다.

## 검증의 공통 원칙

- shell은 shebang에 맞춰 `sh -n` 또는 `bash -n`, Node는 `node --check`, JSON은 파싱으로 확인한다.
  현재 lab이 host Node를 요구하지 않으므로 필요하면 기존 Node image에서 정적 검사를 수행한다.
- Compose 파일 검사는 기존 `samba/compose.sh` wrapper와 고정 버전을 사용한다. 모든 profile의
  mount/entrypoint/secret 경로를 확인한다. config 출력도 기존 private 증거 위치에 둔다.
- 새 상태 분기·중복 적용·검사 부작용에 필요한 좁은 테스트만 추가한다. 파일 이름이나 본문 문장을
  그대로 재검사하는 대규모 테스트를 만들지 않는다.
- 상태 전이·부분 reapply의 계약 테스트가 필요하면 `internal/verify/contracts.test.mjs`에 Node 내장
  test runner로 둔다. 예: 뒤 단계 mapper 보존, 알 수 없는 stage 거부, 실패 시 완료 단계 미승격,
  verify에서 설정 쓰기 API가 호출되지 않음. host Node가 있으면 lab 디렉터리에서
  `node --test internal/verify/contracts.test.mjs`로 실행하고, 없으면 같은 고정 Node image를 사용한다.
  네트워크/관리 API stub은 이 계약 확인에만 쓰고 실제 로그인·LDAP 성공 근거로 사용하지 않는다.
- `verify.sh`의 설정 비변경 여부, reapply의 후속 설정 보존, 중간 stage resume는 이 개편의 핵심 회귀다.
- 이미 발급된 token과 새 token을 구분한다. role/group 실습에서 브라우저의 기존 app session token을
  새 설정 결과로 오해하지 않도록 로그인 시점과 API 응답을 함께 확인한다.
- 비밀값은 Git·계획·콘솔 로그·스크린샷·token 외부 디코더에 남기지 않는다. 학습자 자신의 password
  로컬 확인과 자동화 로그로 password를 출력하는 행위는 구분한다.
- 실습 서비스 중단/재개와 사이트 검사 결과를 분리한다. 실제 환경이 없으면 사이트 통과만 보고
  실습을 검증 완료로 쓰지 않는다.
- 단일 M 작업만 요청받아도 코드/사이트 콘텐츠/설정을 바꾼 실행을 마감할 때는 `pnpm check`를 한 번
  수행한다. 여러 M 작업을 한 번에 실행하면 해당 변경 묶음 끝에서 수행하고, 이미 통과한 검사를
  새 변경이나 실패 없이 반복하지 않는다. 계획 문서만 바꾸는 현재 요청은 diff·참조 검사로 끝낸다.

## 미결 사항과 판정 위치

설계 선택은 위 계약으로 정했다. 아래는 환경/실제 버전 확인 없이는 확정할 수 없는 항목이다.

| 항목 | 판정할 작업 | 기본 처리 |
|---|---|---|
| 후속 실행 시 기존 lab 데이터와 빈 환경 사용 가능 여부 | M01, M08 | read-only 확인 후 가능한 보존형 검사 진행. 기존 데이터 초기화는 허용 범위 확인 |
| 고정 버전 콘솔의 정확한 메뉴/필드 이름 | M10, M11 | 공식 문서·실제 대표 화면 대조, 기억으로 메뉴 경로 생성 금지 |
| legacy seed PUT가 부분 reapply에서 보존해야 할 실제 필드 | M03~M05 | live 객체와 Admin API 의미 확인, 후속 mapper/role 보존 테스트 |
| 새 claim 응답으로 기존 p08 진단 client 없이 확인 가능한 범위 | M07 | 앱 A/B의 실제 로그인·API 응답으로 본선 검사, legacy 진단은 내부 유지 |
| 기존 verify shell의 추가 역사적 의존성 | M01 | 필요한 항목을 이동표/내부 안내에 기록. 학습 검사로 무조건 재사용하지 않음 |

이 항목들 때문에 조사와 독립 구현 전체를 먼저 중단하지 않는다. 실제로 필요한 새 권한이나 환경이
없을 때만 의존 작업을 미실행으로 남기고 정확한 재개 조건을 보고한다.

## 실행 기록

| 작업 | 상태 | 결정·변경 파일 | 검증 결과·미해결 사항 | 다음 행동 |
|---|---|---|---|---|
| 계획 작성 | done | `03-keycloak-guided-labs.md`, 목록 README. 같은 레포 유지, 공개 설정/내부 코드 분리, guided+ready와 5개 적용 단계 설계 | 코드·본문·규칙 읽기 완료. 계획 diff와 참조 경로 검증 완료. 컨테이너·사이트 검사는 계획 문서만 변경하므로 미실행 | 후속 구현 요청 시 M01 |
| Compose 전용 범위 수정 | done | 사용자 요청에 따라 kind/Kubernetes 자산 보존 방침 폐기. M01-C에 8개 파일 삭제·P04 의존성/보존 검사·현재 안내 정리 추가 | 계획만 수정. 실행 자산·환경은 아직 변경하지 않음. 과거 이력은 보존하고 `.state/tools`의 Compose 용도 유지 | 후속 구현 요청 시 M01 → M01-C |
| M01 | done | `compose.yaml`, `app/Dockerfile`, `scripts/`, `keycloak/`, `app/seed-*`, 현재 README·본문 호출자, 이 문서 | 추적된 kind/Kubernetes 삭제 대상 8개 확인. 공개 lifecycle 6개는 `scripts/` 유지, prepare/helper·seed·상세 verify는 `internal/`로 이동하고 Compose mount/entrypoint를 함께 바꿔야 함. `app-b`의 API health 의존 확인. 현재 Colima의 `keycloak-lab` 6개 service와 두 named volume은 healthy/존재하며 mode·stage·in-progress marker는 없음: metadata 없는 기존 ready 호환 검증에 사용 가능. `timeline` Supabase workload와 `.state` 비밀값은 조회·변경하지 않음. 과거 상세 검증은 evidence 선행 조건이 있고 새 guided 검사는 별도 구현해야 함 | M01-C |
| M01-C | done | 추적된 `kind.yaml`, `kind/`, `k8s/` 8개 삭제. reset과 P05~P11의 P04 선행·fingerprint·보존 예외 제거. README/baseline/계획 02에 Compose 전용 현재 계약 반영 | 삭제 파일은 Git에서 복구 가능. 남은 실행 코드의 kind/kubectl 호출과 P04 선행 조건 0건(과거 결과의 `kind_or_kubectl=not_used` 문구만 유지). reset dry-run은 명시한 Compose 디렉터리만 출력하고 무확인 호출 exit 2. `.state` 과거 산출물과 실제 `kind` network는 변경하지 않음 | M02 |
| M02 | done | helper/prepare/인증서 확장→`internal/runtime`, entrypoint/Admin 적용→`internal/keycloak`, seed→`internal/seed`, 상세 verify→`internal/verify`; 공개 P11 wrapper만 유지. Compose mount·entrypoint와 문서 참조 갱신 | shell/Node syntax, JSON parse, 전체 profile Compose config와 실제 P07/P08·D09/D16/D18/D24 실행 통과. 앱 image에는 실행 app/API/healthcheck만 포함 | M03 |
| M03 | done | `keycloak/clients/app-a.json`, `app-b.json`, `internal/keycloak/admin.mjs`, `clients.mjs`, `apply.mjs` | 기존 완성 환경에서 app-a/app-b 적용 및 재적용 통과. 정확한 callback·Code·PKCE 유지, groups mapper와 secret/기존 데이터 보존 | M04 |
| M04 | done | lab-api, realm role, local-user mapping, audience 공개 JSON과 `internal/keycloak/api.mjs`; app-b의 API health 의존 제거 | API 적용과 legacy P07 조합 통과. local-user user 200/admin 403, 무토큰 401. app-a 재적용 2회 뒤 groups 검사 통과 | M05 |
| M05 | done | samba-ad/ldap-groups/group-roles/groups-claim 공개 JSON과 `ldap.mjs`, `groups.mjs`; P08 진단 후처리 분리 | LDAP user full sync와 group sync를 별도 적용. alice/bob 로그인 및 alice 200/200·bob 200/403, legacy P08 재현 통과 | M06 |
| M06 | done | `first-start --guided`, `apply.sh`, mode/stage atomic metadata, stage별 status/resume/service, 내부 실제 객체 gate | allowlist·invalid value 비승격 계약 검사, 공개 인자 오류 exit 2, metadata 없는 ready status/apply와 stop/resume 실제 통과. stage 파일과 Client·Role·사용자·LDAP·mapper 실제 상태를 함께 검사하고 기반 성공 뒤에만 `base` 기록. 빈 guided 전이·hidden object·과거 marker-only 재개도 M08에서 실제 통과 | M07 |
| M07 | done | API `/claims`, 앱 홈 링크, `verify.sh`, `internal/verify/guided.mjs`, 최소 secret별 진단 service | 다섯 검사가 과거 evidence/진단 client 없이 실제 Code+PKCE 흐름으로 통과. redirect·role·groups claim 오류에서 실패하고 설정을 자동 복구하지 않으며 공개 원본 복구 뒤 재통과. claim은 허용 필드만 반환 | M08 |
| M08 | done | 기존 상태를 xattr·ACL·owner 포함 오프라인 백업한 뒤 빈 guided와 빈 ready/P11을 실제 재현하고 원본 복원 | base→groups exact 객체/부재, app-b·groups stop/resume, 건너뛰기·invalid stage, 실제 unhealthy 비승격→재개, ID/secret 보존 재적용, 다섯 guided 검사 통과. 두 번째 reset의 인자 없는 first-start/P07/P08/P11 및 fresh D09/D16/D18/D24 통과. 원본 state 해시와 두 volume archive 직접 비교 후 metadata 없는 ready/groups·여섯 healthy·groups 검사 복원 통과. Supabase 불변 | M13 |
| M09 | done | lab README, 루트 README, `lab-setup.mdx`, `lab-code-guide.mdx`, index | guided/기존 resume·학습 순서·공개 설정/앱/내부 자동화 경계와 GitHub source 링크 반영. 실제 빈 상태 문구 대조와 `pnpm check` 통과 | M10 |
| M10 | done | `client-login-lab.mdx`, `sso-api-lab.mdx`와 관련 개념 링크 | redirect·role 변경의 예상/실패/복구와 새 token 구분 반영. 실제 자동 흐름에서 실패→복구 통과. `pnpm check` 통과 | M11 |
| M11 | done | `directory-login-lab.mdx`, `directory-permissions-lab.mdx`와 관련 개념 링크 | LDAP login과 group 권한을 분리하고 claim off가 role API를 막지 않는 경계·복구 반영. 실제 claim 실패→복구 및 groups 검사 통과. `pnpm check` 통과 | M12 |
| M12 | done | README, decisions, verification, baseline, index/wrapup, 선택 실습·backup 실행 참조 | Compose 전용/guided 영구 계약과 과거 이력 구분. MFA/Brokering/Service Account/DB 복원 이동 경로를 fresh ready에서 실제 재확인. Ubuntu 보류 유지. `pnpm check` 통과 | M13 |
| M13 | done | 전체 완료 조건, 실제 runtime, 원본 복원 상태와 변경 diff 대조 | Node·shell·JSON·전체 Compose profile·공개 인자 계약 통과. `pnpm check`: 432 MDX/431 topic, 479 HTML, 37,914 내부 링크. `git diff --check`, 새 파일 whitespace/실행 권한, Compose-only 의존성 검사 통과. 원본 metadata 없는 ready/groups 여섯 service와 Supabase workload healthy | 완료 |

## 후속 실행 요청 예시

한 작업만 맡길 때:

> `docs/plans/03-keycloak-guided-labs.md`의 M01을 수행해줘. 현재 작업 트리와 관련 지침을 확인하고,
> 호출·삭제·이동표와 검증 환경 조건을 구체화한 뒤 계획에 기록해줘. 구현은 M01-C부터이므로 이번에는 하지 마.

작업 범위를 지정할 때:

> `docs/plans/03-keycloak-guided-labs.md`를 읽고 M01-C~M05를 구현·검증·기록해줘. 선행 작업의 실제 완료를
> 확인하고 순서대로 진행해. 기존 실습 데이터는 보존하고, 실행하지 못한 검증은 이유와 재개 방법을 남겨줘.

전체 구현을 맡길 때:

> `docs/plans/03-keycloak-guided-labs.md`의 미완료 작업을 의존 순서대로 구현·검증·기록해줘. 파일 이동과
> 실제 학습 흐름까지 끝내고, 기존 데이터 보존과 공개 명령 호환 계약을 지켜줘. 필요한 새 권한/환경이
> 있으면 독립 작업을 마친 뒤 정확한 대상과 필요한 조치를 알려줘. 커밋·푸시는 하지 마.

## 완료 기록

완료. M01 → M01-C → M02~M13을 의존 순서대로 구현·검증했다. 빈 guided에서 base→app-a→app-b→api→
ldap→groups의 실제 객체 생성과 뒤 단계 부재, 로그인·SSO·인가, 재적용, app-b/groups stop-resume,
건너뛰기·invalid stage·readiness 실패 후 재개를 확인했다. 두 번째 빈 환경에서는 인자 없는 first-start와
P07/P08/P11, D09/D16/D18/D24를 재현했다.

검증 전 원래 state와 두 volume을 오프라인 백업했고, 종료 시 state 파일 해시와 volume의 내용·mode·
owner·mtime·xattr·ACL을 원본 archive와 직접 비교한 뒤 metadata 없는 ready/groups 환경으로 복원했다.
여섯 service와 Supabase workload는 healthy다. 민감한 임시 백업은 복원 확인 뒤 삭제하고 비밀 없는 guided
요약과 fresh 회귀 evidence만 `.state/verification/guided/`에 남겼다. 추적된 kind/Kubernetes 자산과 현재
실행 의존성은 제거했고 과거 비공개 P04 산출물은 변경하지 않았다. 최종 `pnpm check`와 정적·diff 검사는
모두 통과했다. 커밋·푸시·배포는 수행하지 않았다.
