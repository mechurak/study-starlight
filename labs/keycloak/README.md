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

## 회사 프록시 환경에서 시작하기

image pull은 Docker daemon의 `/etc/docker/daemon.json` `proxies` 설정을 따르지만, 로컬 image build 안의
`apt-get`(Samba)과 `npm ci`(앱)는 그 설정을 받지 않는다. 그래서 `compose.yaml`의 모든 build는 명령을
실행한 shell에 이미 있는 `HTTP_PROXY`·`HTTPS_PROXY`·`NO_PROXY`(소문자 포함)를 build arg로 넘기고,
변수가 없으면 아무것도 넘기지 않는다. 회사 shell에 평소 proxy 변수가 잡혀 있다면 따로 export할 것은
없다. TLS를 다시 서명하는 HTTPS inspection proxy라면 build 단계가 그 proxy CA도 신뢰해야 하므로
PEM 파일 경로만 `CORP_CA_FILE`로 알려 준다.

```bash
export CORP_CA_FILE=/path/to/corporate-proxy-ca.crt
./scripts/first-start.sh --guided
```

`samba/prepare-state.sh`의 `prepare_proxy_ca`가 그 PEM을 Git 제외 `.state/build/corporate-proxy-ca.crt`로
복사하고, 모든 로컬 build가 이를 BuildKit secret `corporate_proxy_ca`로 받는다. Samba build는 `apt-get`
동안만 OS trust에 넣었다가 layer를 남기기 전에 다시 제거하고, slim base라 `update-ca-certificates`가 없는
앱 build는 `NODE_EXTRA_CA_CERTS`로 그 파일을 직접 읽는다. 완성 image와 실행 container는 proxy CA를
신뢰하지 않는다. 프록시가 없는 환경(맥미니)에서는 변수 없이 그냥 시작하면 빈 파일이 만들어져 CA 단계가
건너뛰어진다. 변수 없이 다시 실행해도 이미 복사한 CA는 유지되며, 지우려면 그 파일을 삭제하거나
`reset.sh`를 쓴다. BuildKit secret을 쓰므로 `docker buildx`가 필요하다. Ubuntu의 Docker apt 저장소는
buildx plugin을 함께 설치하고, macOS Homebrew는 `brew install docker-buildx` 뒤
`~/.docker/cli-plugins/docker-buildx` 링크가 필요하다.

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

## 브라우저로 확인하기

`status.sh`는 container가 healthy인지만 보고, `verify.sh <단계>`는 지나온 단계의 실제 로그인을 자동으로
수행한다. 같은 결과를 화면에서 직접 보려면 host에서 한 번만 다음을 준비한다.

1. `/etc/hosts`에 세 이름을 loopback으로 연결한다.

   ```text
   127.0.0.1 keycloak.keycloak.test app-a.keycloak.test app-b.keycloak.test
   ```

2. 브라우저가 회사 프록시나 PAC를 쓰면 `*.keycloak.test`를 프록시 예외에 넣는다. 예외가 없으면 요청이
   회사 프록시로 나가 loopback의 lab에 닿지 못한다. Ubuntu GNOME은 설정 → 네트워크 → 프록시의
   Ignored Hosts에 `*.keycloak.test`를 추가한다. 터미널의 `curl`도 `NO_PROXY`에 `.keycloak.test`가
   있어야 한다.
3. 선택 사항으로 web CA `.state/web-ca/ca.crt`를 브라우저에 등록하고 브라우저를 다시 시작한다. 등록하지
   않아도 host별로 한 번씩 인증서 경고를 넘기면 모든 실습이 동작하며, 주소창의 "안전하지 않음" 표시만
   남는다. 경고 없이 보고 싶을 때만 등록한다. macOS는 login keychain을 쓰며 등록할 때 암호 확인 창이
   뜬다. Ubuntu의 Chrome·Chromium은 OS 인증서 저장소가 아니라 사용자별 NSS(Network Security Services)
   DB를 본다. Firefox는 설정의 인증서 관리자에서 같은 파일을 가져온다.

   ```bash
   # macOS
   security add-trusted-cert -r trustRoot -p ssl \
     -k ~/Library/Keychains/login.keychain-db .state/web-ca/ca.crt

   # Ubuntu Chrome/Chromium
   sudo apt-get install --yes libnss3-tools
   certutil -d sql:$HOME/.pki/nssdb -A -t 'C,,' -n keycloak-lab-web-ca -i .state/web-ca/ca.crt
   ```

   Chrome을 한 번도 실행하지 않아 `~/.pki/nssdb`가 없으면 먼저
   `mkdir -p ~/.pki/nssdb && certutil -N -d sql:$HOME/.pki/nssdb --empty-password`로 만든다. snap으로 설치한
   Chromium은 `~/snap/chromium/current/.pki/nssdb`를 쓴다.

| 화면 | 주소 | 계정 | 열리는 단계 |
|---|---|---|---|
| Admin Console | `https://keycloak.keycloak.test:30080/admin/` | `lab-admin` | `base`부터 |
| Account Console | `https://keycloak.keycloak.test:30080/realms/study/account/` | `local-user`, `ldap`부터 `alice`·`bob` | `base`부터 |
| 앱 A | `https://app-a.keycloak.test:30081/` | 위 사용자 | `app-a`부터 |
| 앱 B | `https://app-b.keycloak.test:30082/` | 위 사용자 | `app-b`부터 |

계정 이름은 위 표에 고정돼 있고, 비밀번호는 `first-start.sh`가 만든 `.state/secrets/`의 파일에 있다.
값은 로컬 터미널에서만 확인하고 문서·로그에 붙여 넣지 않는다.

| 계정 | 비밀번호 파일 |
|---|---|
| `lab-admin` (Admin Console) | `.state/secrets/keycloak-bootstrap-admin-password` |
| `local-user` | `.state/secrets/keycloak-local-user-password` |
| `alice` | `.state/secrets/samba-alice-password` |
| `bob` | `.state/secrets/samba-bob-password` |

```bash
cat .state/secrets/keycloak-bootstrap-admin-password
```
브라우저 HTTPS는 `.state/web-ca/ca.crt`, Keycloak→Samba LDAPS는 `.state/directory-ca/ca.crt`를 신뢰한다.
두 CA는 서로 대신할 수 없다.

Admin Console은 왼쪽 위 realm 선택을 `study`로 바꿔서 본다. guided 단계를 마칠 때마다 새로 보여야 하는
객체와 위치는 다음과 같다.

| 완료 단계 | Admin Console에서 확인할 곳 |
|---|---|
| `base` | Users에 `local-user`만 있고, Clients에 `app-a`·`app-b`·`lab-api`가 없음 |
| `app-a` | Clients에 `app-a` |
| `app-b` | Clients에 `app-b` |
| `api` | Clients에 `lab-api`, Realm roles에 `app-user`·`api-admin`, `local-user`의 Role mapping에 `app-user`, `app-a`·`app-b`의 Client scopes → dedicated scope → Mappers에 `lab-api-audience` |
| `ldap` | User federation에 `samba-ad`, Users 검색에 `alice`·`bob` |
| `groups` | `samba-ad`의 Mappers에 `lab-groups`, Groups에 `app-users`·`api-admins`와 각 Role mapping, `app-a`·`app-b` dedicated scope Mappers에 `ldap-groups` |

### Samba 디렉터리

Samba AD DC에는 웹 콘솔이 없고, 이 lab은 Samba port를 host에 publish하지 않는다. 원본 계정과 그룹은
container 안에서 조회하고, Keycloak이 가져온 결과는 `ldap`·`groups` 단계 뒤 Admin Console에서 본다.

```bash
docker exec keycloak-lab-samba samba-tool user list
docker exec keycloak-lab-samba samba-tool group listmembers app-users
docker exec keycloak-lab-samba samba-tool group listmembers api-admins
```

macOS에서는 keychain에 web CA를 신뢰시킨 실제 Chrome으로 Admin Console·Account Console·앱 A 로그인을
확인했다. Ubuntu에서는 GNOME 프록시 Ignored Hosts 추가 뒤 Admin Console 접속까지 확인했고, NSS DB
등록은 아직 실행하지 않았다.

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

## 처음부터 다시 시작하기

`stop.sh`는 데이터를 남기는 중단이다. 빈 상태에서 다시 재현하려면 `reset.sh`를 쓴다. `.state`만 지우면
안 된다. container·network·두 named volume이 남아 `first-start.sh`가 기존 자원을 이유로 중단하고,
새로 만든 비밀번호가 volume 안의 DB·Samba 비밀번호와도 맞지 않는다. 완전 초기화는 일상적인 시작
명령이 아니므로 먼저 삭제 대상을 읽고, 확인한 뒤에만 확인 문자열을 쓴다.

1. 삭제 대상을 본다. 이 명령은 아무것도 지우지 않는다.

   ```bash
   ./scripts/reset.sh --dry-run
   ```

2. 목록을 확인했으면 초기화한다.

   ```bash
   ./scripts/reset.sh --confirm DELETE-keycloak-lab-compose-state
   ```

3. 다시 시작한다. reset은 `.state/build`의 proxy CA 복사본도 지우므로 프록시 환경에서는
   `CORP_CA_FILE`을 다시 지정한다.

   ```bash
   export CORP_CA_FILE=/path/to/corporate-proxy-ca.crt   # 프록시 환경에서만
   ./scripts/first-start.sh --guided
   ./scripts/status.sh
   ```

4. web CA를 브라우저에 등록했었다면 새로 만들어진 CA와 맞지 않으므로 옛 `keycloak-lab-web-ca`를 지우고,
   [브라우저로 확인하기](#브라우저로-확인하기)의 3번으로 새 파일을 다시 등록한다. 등록하지 않았다면
   건너뛴다.

   ```bash
   # macOS
   security delete-certificate -c keycloak-lab-web-ca ~/Library/Keychains/login.keychain-db

   # Ubuntu Chrome/Chromium
   certutil -d sql:$HOME/.pki/nssdb -D -n keycloak-lab-web-ca
   ```

reset 대상은 `keycloak-lab` project의 container/network, 두 named volume, 생성한 CA·secret·proxy CA
복사본·lifecycle과 Compose 검증 디렉터리 `p03`, `p05`~`p11`, `d09`, `d16`, `d18`, `d24`, `guided`뿐이다.
다른 Docker workload, `.state/tools`, 과거 비공개 P04 산출물은 읽거나 삭제하지 않는다. 전역 prune,
Colima reset, kind/kubectl 조작은 없다.

reset은 image와 build cache도 지우지 않는다. 이미 build에 성공한 host에서 다시 시작하면 `apt-get`·`npm ci`
단계가 cache로 건너뛰어져 proxy 경로를 다시 시험하지 않는다. 그 경로를 다시 시험하려면
`docker builder prune`이 필요하지만, 이 명령은 다른 project의 build cache도 함께 지운다.

파괴적 전체 재현은 `./scripts/verify-p11.sh --confirm DELETE-keycloak-lab-compose-state`로 호환된다.
실행 전 반드시 reset 범위와 다른 workload 보존 조건을 다시 확인한다.

## 선택 실습과 유지보수

MFA, OIDC Brokering, Service Account, DB 격리 복원은 기본 guided 순서 뒤의 선택 실습이다. 구현과
상세 진단은 각각 `internal/seed/seed-d09.mjs`, `seed-d16.mjs`, `seed-d18.mjs`와
`internal/verify/verify-d09.sh`, `verify-d16.sh`, `verify-d18.sh`, `verify-d24.sh`에 있다.
과거 P05~P11 상세 순차 검증도 `internal/verify/`에 있으며 과거 evidence를 요구하므로 현재 상태
확인에는 사용하지 않는다. 현재 확인은 `scripts/verify.sh`가 정본이다.

## 더 읽기

- 사이트: [Compose 실습 환경](../../src/content/docs/keycloak-lab/lab-setup.mdx),
  [실습 코드에서 읽을 것](../../src/content/docs/keycloak-lab/lab-code-guide.mdx)
- 공통 환경 준비: [Docker Compose 실습 환경](../../src/content/docs/lab-environment/docker-compose.mdx),
  [로컬 HTTPS 실습을 브라우저로 보기](../../src/content/docs/lab-environment/local-https-browser.mdx)
- 결정: [decisions.md](decisions.md)
- 실제 검증 결과와 미실행 범위: [verification.md](verification.md)
