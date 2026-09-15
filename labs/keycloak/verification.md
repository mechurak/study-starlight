# Keycloak 실습 검증 기록

최신 확인일: **2026-09-15**

실제 실행한 환경과 아직 실행하지 않은 환경을 분리한다. 비밀번호·개인키와 긴 원본 로그는 기록하지
않으며, 로컬 상세 산출물은 Git에서 제외한 `labs/keycloak/.state/verification/`에 둔다.

## 2026-09-15 guided 개편 검증

현재 macOS/Colima의 metadata 없는 기존 완성 환경을 보존한 채 새 공개 설정을 모두 재적용했다.
Keycloak 26.7.3, Docker client 29.6.1/server 29.5.2, Compose 5.5.1에서 여섯 상시 service는 최종 healthy였다.

| 검사 | 상태 | 실제 결과 |
|---|---|---|
| 공개 JSON app-a/app-b/api/ldap/groups 재적용 | 통과 | 중복 없이 적용, 뒤 단계 설정·기존 secret 보존, user full sync와 group sync 분리 |
| `verify.sh app-a` | 통과 | Code+PKCE S256, local-user callback/session, 오답 거부 |
| `verify.sh sso` | 통과 | 앱 A credential 1회 뒤 앱 B 별도 session, 두 번째 credential 제출 없음 |
| `verify.sh api` | 통과 | 무토큰 401, local-user user 200/admin 403, 검증된 최소 claims |
| `verify.sh ldap` | 통과 | alice/bob 앱 Code+PKCE 로그인, 각각 오답 거부 |
| `verify.sh groups` | 통과 | alice user/admin 200/200, bob 200/403, full-path groups claim |
| metadata 없는 기존 환경 status/apply | 통과 | 파일을 만들지 않고 `mode=ready stage=groups`, 재적용 뒤에도 동일 |
| 실제 단계 객체 gate | 통과 | 완성 환경에서 base→groups 선행 객체와 groups 전체 객체 확인, `base --exact`는 뒤 단계 객체를 찾아 예상대로 실패 |
| shell·Node·JSON·전체 Compose profile 정적 검사 | 통과 | 이동한 host source와 entrypoint 포함 |
| 빈 상태 `first-start --guided`와 단계별 stop/resume | 통과 | 원본을 오프라인 백업한 뒤 base→groups 실제 전진, app-b의 5개·groups의 6개 service stop/resume와 identity 보존 확인 |
| redirect·role·claim의 실제 오류→복구 | 통과 | 각각 verify 실패 확인 뒤 공개 JSON 복구·재적용·새 로그인 정상 확인 |
| readiness 실패→재개 | 통과 | app-b Client 적용 뒤 의도한 unhealthy에서 stage가 app-a에 머물고, health 복구 후 같은 apply 재실행으로 app-b 완료 |
| 인자 없는 최초 시작/P11 | 통과 | 두 번째 빈 reset에서 동일 단계 조합으로 ready/groups 생성, P07·P08·P11과 stop/resume·비대상 Docker 자원 불변 확인 |
| MFA·Brokering·Service Account·DB 격리 복원 | 통과 | fresh ready에서 이동된 D09/D16/D18/D24 경로 모두 재실행 성공 |
| 기존 실습 상태 복원 | 통과 | state 해시와 volume 내용·mode·owner·mtime·xattr·ACL 대조 뒤 metadata 없는 ready/groups 및 실제 groups 검사 통과 |

빈 상태 검증은 사용자 승인 아래 원본 state와 두 volume을 먼저 일관된 tar로 백업하고 수행했다. guided
base에서는 세 service만 healthy였고 app-a/app-b/lab-api, lab role, LDAP provider가 없었다. app-b에서도
API와 LDAP가 없었고, api/ldap에서도 각각 뒤 단계 객체가 없음을 Admin REST 단계 검사로 확인했다. 단계
건너뛰기와 allowlist 밖 stage는 변경 전에 실패했다. app-a/api/groups 재적용 전후 서버 ID와 secret도
유지됐다. fresh ready에서 선별한 P11·선택 실습 텍스트 evidence와 guided 요약은
`.state/verification/guided/`에 보존했으며,
원래 volume과 CA·secret·검증 기록을 복원한 뒤 archive 직접 비교와 실제 로그인을 모두 통과시켰다.
사이트 검사 결과를 이 실제 환경 결과의 대체 근거로 사용하지 않았다.

아래 P03~P24 기록은 당시 실행 이력이다. P04의 추적된 kind/Kubernetes 자산은 2026-09-15 제거됐고
현재 Compose 실행·검증의 선행 조건이나 선택 경로가 아니다. 비공개 과거 산출물은 변경하지 않았다.

## P03 Samba AD DC

| 환경 | 상태 | 실제 범위 |
|---|---|---|
| macOS 26.6.2 arm64 + Colima 0.10.3 | 통과 | Ubuntu 24.04.4 arm64 VM, Docker client 29.6.1/server 29.5.2, Compose 5.5.1 |
| 네이티브 Ubuntu 24.04 + rootful Docker Engine | 미실행 | 회사 Ubuntu 환경에서 재개해야 함 |

macOS의 기존 Colima 프로필은 CPU 2개·메모리 2 GiB·disk 100 GiB였다. P03의 CPU 1개·메모리 1 GiB
제한을 둔 Samba 단독 검증은 이 프로필에서 통과했다. 이 값은 kind·Keycloak·PostgreSQL·앱까지 함께
실행할 권장 자원이 아니며, P04 이후에는 `lab-environment` 덱의 CPU 4개·메모리 8 GiB 권장을 따른다.

빈 `keycloak-lab-samba-data` 상태에서 다음을 실행했다.

```bash
cd labs/keycloak
./samba/verify-p03.sh
```

한 번의 스크립트 실행에서 확인한 결과는 다음과 같다.

- pinned Ubuntu base와 snapshot에서 arm64 이미지를 build했고 Samba package
  `2:4.19.5+dfsg-4ubuntu9.7`을 확인했다.
- Samba AD domain을 provision하고 `alice`, `bob`, `app-users`, `api-admins`를 조회했다.
- directory CA로 LDAPS 인증서를 검증한 상태에서 `alice`와 `bob`의 사용자 bind가 성공했다.
- seed를 두 번 더 실행한 뒤 사용자·그룹·membership과 domain SID가 달라지지 않았다.
- container를 강제 재생성한 뒤에도 같은 domain SID와 사용자·그룹·membership이 유지됐다.
- 최종 container는 healthy이며 `Privileged=false`, network mode `keycloak-lab`,
  `CapAdd=[CAP_SYS_ADMIN]`, Docker socket mount 없음으로 확인했다. host port도 publish하지 않는다.

추가 capability 없이 최초 provision을 시도했을 때 SYSVOL ACL 설정에서
`set_nt_acl_conn: fset_nt_acl returned NT_STATUS_ACCESS_DENIED`가 재현됐다. 이 실패와 Linux
`security.*` xattr 쓰기에 필요한 권한을 `decisions.md`에 먼저 기록한 뒤 `SYS_ADMIN` 하나만 추가해
다시 검증했다.

## Ubuntu P03 플랫폼 검증 보류

네이티브 Ubuntu에서는 `decisions.md`에 고정한 Ubuntu 24.04, rootful Docker client/server 29.8.0,
Docker Compose plugin 5.5.1을 준비하고 같은 `./samba/verify-p03.sh`를 실행한다. 스크립트는 최초
provision을 확인하기 위해 기존 `keycloak-lab-samba-data` volume이 있으면 중단한다. 이 검증은 사용자가
나중에 별도로 수행하기로 했으며 현재도 **미실행**이다. macOS 결과를 Ubuntu 결과로 일반화하지 않는다.
사용자 요청에 따라 macOS/Colima의 P03 전체 통과를 선행 조건으로 P04를 진행했지만, 이 보류 항목은
Ubuntu에서 실제 실행할 때까지 유지한다.

## P04 kind에서 Samba 연결

| 환경 | 상태 | 실제 범위 |
|---|---|---|
| macOS 26.6.2 arm64 + Colima 0.10.3 | 통과 | kind v0.33.0, Kubernetes/kubectl v1.35.8, 전용 cluster·bridge·CoreDNS·진단 Pod |
| 네이티브 Ubuntu 24.04 + rootful Docker Engine | 미실행 | P03 플랫폼 검증과 별도로 실제 실행 결과를 기록해야 함 |

다음 공식 계약을 구현 근거로 확인했다.

- kind configuration의 digest 고정 node image와 loopback `extraPortMappings`, NodePort와 같은
  container port를 쓰는 규칙
- kind quick start의 이름 있는 cluster·격리 kubeconfig·`--wait`·로컬 image load 흐름
- Kubernetes의 CoreDNS ConfigMap을 통한 cluster DNS 사용자 정의와 `reload` 동작

현재 Colima profile은 CPU 2개·메모리 2 GiB·disk 100 GiB로 전체 실습 권장값인 CPU 4개·메모리
8 GiB보다 작았다. P04 직전에는 Samba 약 188 MiB와 별도 Supabase container 8개가 합계 약 736 MiB를
사용했고, Supabase의 PostgreSQL·Storage named volume과 bind mount가 있었다. Colima 자원 변경은 VM을
재시작해 이 workload들을 모두 중단시키므로 이번에는 profile을 변경하거나 삭제·초기화하지 않았다.

P04는 Keycloak·PostgreSQL·앱을 올리지 않고 128 MiB limit의 진단 Pod만 추가했다. 생성 직후 kind node는
약 575 MiB를 사용했고 `MemoryPressure=False`, `DiskPressure=False`, `PIDPressure=False`, `Ready=True`였다.
기존 Supabase container들은 계속 실행됐고 healthcheck가 있는 항목은 모두 healthy였다. 이 결과는 현재
P04 범위가 2 GiB profile에서 통과했다는 뜻일 뿐 P05 이후 전체 workload에 충분하다는 뜻이 아니다.
P05 전에 다른 workload의 허용 중단 시간을 정한 뒤 `colima stop`과 CPU 4개·메모리 8 GiB 재시작으로
증설하거나, 전체 실습을 별도 profile/runtime에서 실행해야 한다. 기존 profile이나 volume을 삭제할
필요는 없다.

기존 Samba container·named volume·directory CA와 secret을 유지한 상태에서 다음을 실행했다.

```bash
cd labs/keycloak
./kind/verify-p04.sh
```

실제 확인 결과는 다음과 같다.

- cluster `keycloak-lab`과 격리 kubeconfig의 context `kind-keycloak-lab`을 사용했다. 호스트의
  current context는 전후 모두 unset이었고 `/etc/hosts`도 바뀌지 않았다.
- control-plane은 기존 kind bridge를 유지하면서 Compose 소유 bridge `keycloak-lab`에만 추가 연결됐고,
  Samba는 `172.30.0.10`, control-plane은 `172.30.0.20`이었다. 다른 Docker network는 수정하지 않았다.
- CoreDNS의 실습 전용 hosts block에서 `dc1.ad.keycloak.test`가 `172.30.0.10`으로 해석됐다. 이후 웹
  이름 세 개도 decisions의 `172.30.0.20` 경계를 사용하도록 함께 고정했다.
- 진단 Pod에서 `172.30.0.10:636` 직접 TLS 연결, directory CA를 사용한 LDAPS 검색,
  `alice`와 `bob` bind가 성공했다.
- 같은 Pod에서 directory CA가 없는 system CA bundle로 TLS 검증이 실패했고, 고정된 오답 비밀번호로
  `alice` bind가 실패했다.
- 진단 이미지는 P03의 로컬 `keycloak-lab-samba:4.19.5-ubuntu24.04`를 node에 직접 load했고 Pod는
  `imagePullPolicy: Never`를 사용했다. 진단 명령은 cluster DNS와 `172.30.0.10:636`만 사용해 공개
  registry·DNS·서비스 endpoint 없이 실행됐다. 도구와 kind node image의 최초 준비 단계는 공식
  download/registry 접근이 필요하다.
- P03의 `before-recreate.txt`와 P04 뒤 `verify-directory` 결과를 `cmp`로 비교해 domain SID
  `S-1-5-21-2785298756-3808558117-572789873`, 사용자 `alice`·`bob`, 그룹
  `app-users(alice,bob)`·`api-admins(alice)`가 유지됐음을 확인했다.
- `30080`~`30082`의 kind port mapping은 모두 host `127.0.0.1`에만 bind됐다. Samba host port는
  추가하지 않았다.

비밀번호·개인키를 제외한 상세 실행 산출물은 `.state/verification/p04/`에 있다. 이 결과를 Ubuntu
P03 또는 Ubuntu P04의 실제 결과로 사용하지 않는다.

## P05 Compose PostgreSQL·Keycloak

| 환경 | 상태 | 실제 범위 |
|---|---|---|
| macOS 26.6.2 arm64 + Colima 0.10.3 | 자동 검증·실제 Chrome 통과 | Colima 4 CPU/8 GiB, Docker client 29.6.1/server 29.5.2, Compose 5.5.1, Chrome 153.0.8010.36 |
| 네이티브 Ubuntu 24.04 + rootful Docker Engine | 미실행 | Ubuntu P03 플랫폼 검증과 함께 별도 실행해야 함 |

사용자 승인 뒤 label·고정 image·`.20` 주소·loopback `30080`~`30082` mapping이 모두 일치한 P04
`keycloak-lab` cluster 하나만 삭제했다. 다른 kind cluster와 전역 대상은 건드리지 않았다. 삭제 전후로
Samba named volume, domain SID, directory CA·secret, P03/P04 기록의 hash와 live directory 결과가
같음을 확인했다. `kind.yaml`, `kind/`, `k8s/`와 P04 검증 파일은 그대로 보존했다.

같은 승인 범위에서 default Colima를 삭제·초기화하지 않고 2 CPU/2 GiB에서 4 CPU/8 GiB로 재시작했다.
재시작 직후 Docker가 노출한 memory는 8,307,167,232 bytes, `MemAvailable`은 6,853,424 KiB였고 Docker
data filesystem 여유는 80,367,064 KiB였다. 기존 Supabase container 8개가 같은 PostgreSQL·Storage
named volume과 Studio bind mount로 복귀했고 healthcheck 대상은 모두 healthy였다. P05 자동 검증 시작
시점에는 `MemAvailable` 6,238,556 KiB, disk 여유 80,120,864 KiB를 기록했다.

`./scripts/verify-p05.sh`의 마지막 전체 실행은 다음을 통과했다.

- 고정 digest의 PostgreSQL 18.6과 Keycloak 26.7.3, 기존 Samba와 일회성 진단 container를 Compose로
  실행했다. PostgreSQL volume은 `keycloak-lab-postgres-data` 하나를 `/var/lib/postgresql`에 mount했고
  DB·Samba host port는 publish하지 않았다. Keycloak만 `127.0.0.1:30080`에 같은 target port를 냈다.
- web CA와 `keycloak.keycloak.test` SAN·serverAuth leaf, DB/bootstrap/local-user password를 Git 제외
  `.state`에 만들었다. Keycloak UID 1000, PostgreSQL UID 999, 진단 UID 65534가 자기 file-backed secret을
  실제로 읽었고 mount는 read-only였다. secret 값은 `docker inspect`의 environment에 없었다.
- `study` realm과 `local-user`를 만들었다. bootstrap `lab-admin` credential과 `local-user`의 Authorization
  Code 로그인 폼은 host에서 명시적 web CA 검증을 유지한 채 성공했다. 이 curl 기반 확인은 browser
  검증을 대신한 것으로 기록하지 않는다.
- UID 65534 진단 container에서 `dc1.ad.keycloak.test`와 `keycloak.keycloak.test`가 각각 `.10`과 `.20`으로
  해석됐다. directory CA LDAPS 검색, alice/bob bind, web CA discovery/JWKS와 issuer 일치를 확인했다.
  web CA로 LDAPS 검증, directory CA로 HTTPS 검증, 오답 alice password는 각각 실패했다. 진단 명령은
  공개 endpoint를 호출하지 않았다.
- Samba의 SID·alice/bob·`app-users`·`api-admins` 결과가 P03 기준과 같았다. PostgreSQL과 Keycloak
  container를 강제 재생성한 뒤에도 `study` realm, discovery/JWKS, 진단 결과와 P03 상태가 유지됐다.

상세 자동 검증 산출물은 `.state/verification/p05/`에 있다. host SecureTransport는 `--cacert`로 web CA를
명시했을 때 discovery/JWKS와 issuer를 검증했다. 후속 검증에서는 `/etc/hosts`의 세 이름을 loopback에
연결하고 현재 `.state/web-ca/ca.crt`를 macOS login keychain의 SSL trust root로 승인했다.
`security verify-cert -p ssl`과 CA 옵션 없는 host `curl`이 통과한 상태에서 실제 Google Chrome
153.0.8010.36으로 `lab-admin`의 Admin Console 로그인을 확인했다.

첫 `local-user` Account Console 확인은 account REST 두 요청이 401을 반환했다. import 사용자에게
`default-roles-study`가 없고 `app-user`만 직접 매핑된 것이 원인이었다. `study-realm.json`에 기본 realm
role을 명시하고 P05 자동 검사에 container 재생성 전후의 직접 매핑 검사를 추가했다. 보존 DB에도 같은
role을 멱등하게 적용한 뒤 새 Chrome session에서 Account Management의 `Personal info` 화면과 오류 0개를
확인했다. 별도 임시 realm의 fresh import에서도 대응하는 `default-roles-<realm>` 매핑이 생김을 확인하고
임시 realm을 제거했다. 이 결과로 macOS P05는 `done`이며 Ubuntu 결과로 일반화하지 않는다.

### Ubuntu P03 플랫폼 검증 보류 유지

P05의 macOS/Colima 결과는 네이티브 Ubuntu의 P03 또는 P05 결과로 일반화하지 않는다. Ubuntu 24.04 +
rootful Docker Engine에서 `./samba/verify-p03.sh`를 실행하는 기존 보류 항목은 그대로 남아 있다.

## P06 앱 A OIDC 로그인

| 환경 | 상태 | 실제 범위 |
|---|---|---|
| macOS 26.6.2 arm64 + Colima 0.10.3 | 비브라우저 자동 검증·실제 Chrome 통과 | Node.js 24.21.0 image, `openid-client` 6.8.8, Express 5.2.1, `express-session` 1.19.0, Chrome 153.0.8010.36 |
| 네이티브 Ubuntu 24.04 + rootful Docker Engine | 미실행 | Ubuntu P03 플랫폼 검증과 함께 별도 실행해야 함 |

P05의 Compose 자동 검증 결과에 영향을 주는 기존 service 설정은 바꾸지 않았다. 실행 전에 Samba,
PostgreSQL, Keycloak이 모두 기존 container에서 healthy이고 P03~P05 기록, 두 named volume, 두 CA와
기존 secret이 남아 있음을 확인했다. Colima는 4 CPU/8 GiB였고 `MemAvailable`은 6,204,204 KiB,
Docker data disk 여유는 80,120,860 KiB였다. 별도 Supabase container 8개도 중단하지 않았으며 Colima
설정, volume, domain, CA를 변경하거나 prune/reset하지 않았다. P05 전체 검증은 반복하지 않았다.

다음을 실행해 P06 범위만 검증했다.

```bash
cd labs/keycloak
./scripts/verify-p06.sh
```

실제 확인 결과는 다음과 같다.

- 고정 Node 24.21.0 base digest로 앱 image를 만들고 lockfile의 exact `openid-client` 6.8.8,
  Express 5.2.1, `express-session` 1.19.0을 `npm ci`로 설치했다. install audit은 취약점 0개였다.
- 별도 일회성 seed service가 web CA를 신뢰한 HTTPS 관리 경로로 confidential Client `app-a`를 만들었다.
  callback은 `https://app-a.keycloak.test:30081/callback` 하나이며 Standard Flow와 PKCE S256을 사용하고,
  implicit flow·Direct Access Grants(password grant)·service account는 끈 설정이다. seed를 연속 두 번
  실행해 같은 client를 갱신하고 중복 없이 끝나는 것도 확인했다.
- 앱 A는 `127.0.0.1:30081`에만 HTTPS를 publish하고 Compose alias도 같은 FQDN을 사용했다. app
  container의 issuer는 P05와 같은 `https://keycloak.keycloak.test:30080/realms/study`였으며 별도 내부
  issuer나 HTTP, TLS 검증 우회를 사용하지 않았다. host에서도 web CA를 명시한 health 요청은 성공하고
  directory CA를 잘못 사용한 요청은 TLS 검증에서 실패했다.
- 진단 container의 실제 로그인에서 authorization request가 `response_type=code`, 정확한 redirect URI,
  PKCE `S256` challenge, state, nonce를 모두 포함했다. `local-user`의 올바른 credential로 Keycloak
  callback과 `openid-client`의 code 교환·검증을 거쳐 앱 session의 사용자까지 확인했다. password 값,
  authorization code, token은 출력하거나 검증 파일에 저장하지 않았다.
- 고정 오답 password는 Keycloak login form에 남아 앱 callback으로 돌아오지 않았다. authorization
  request의 state와 nonce를 각각 변조한 두 시나리오는 callback에서 HTTP 400으로 끝났고 상세 오류를
  응답에 노출하지 않았다. 등록하지 않은 redirect URI도 Keycloak이 HTTP 400으로 거부했다.
- 앱은 Node image UID 1000, read-only root filesystem, 모든 capability drop과
  `no-new-privileges`로 실행했다. client/session/TLS private key는 필요한 service에만 read-only
  file-backed secret으로 mount했고 앱의 `docker inspect` environment에 값이 없음을 확인했다.
  앱에는 bootstrap 관리자 password를 mount하지 않았다.

비밀번호·private key·cookie·authorization code·token을 제외한 상세 산출물은
`.state/verification/p06/`에 있다.

P05에서 현재 web CA를 macOS login keychain의 SSL trust root로 승인한 뒤 새 실제 Chrome session에서
앱 A의 `Sign in with Keycloak`을 시작했다. authorization request의 `response_type=code`, 정확한 callback,
`code_challenge_method=S256`, state, nonce를 browser URL에서 확인했고 `local-user` credential을 한 번
제출한 뒤 앱 A의 `Signed in as local-user` 화면으로 돌아왔다. 인증서 경고나 TLS 검증 우회는 사용하지
않았다. 기존 자동 검증의 오답 password·변조 state/nonce·미등록 redirect 실패 결과와 합쳐 macOS P06은
`done`이며 Ubuntu 결과로 일반화하지 않는다.

아래 P07~D09 기록의 P05·P06 browser 보류 문구는 각 작업을 실행한 당시의 상태다. 현재 상태는 위
후속 Chrome 결과가 대신하며, D09 OTP 화면 자체의 Chrome 실행 여부와는 구분한다.

### Ubuntu P03 플랫폼 검증 보류 유지

P06의 macOS/Colima 결과도 네이티브 Ubuntu의 P03 또는 P06 결과로 일반화하지 않는다. Ubuntu 24.04 +
rootful Docker Engine의 기존 P03 플랫폼 검증은 계속 미실행이며 별도 실행 결과가 필요하다.

## P07 앱 B SSO와 API 인가

| 환경 | 상태 | 실제 범위 |
|---|---|---|
| macOS 26.6.2 arm64 + Colima 0.10.3 | 비브라우저 자동 검증 통과 | Node.js 24.21.0 image, `openid-client` 6.8.8, `jose` 6.2.12, Express 5.2.1 |
| 네이티브 Ubuntu 24.04 + rootful Docker Engine | 미실행 | Ubuntu P03 플랫폼 검증과 함께 별도 실행해야 함 |

P05·P06의 macOS browser CA trust·로그인 확인은 기존 결정대로 미실행 `blocked` 상태를 유지했다. P07은
그 보류를 선행 차단으로 쓰지 않고, web CA를 명시적으로 신뢰하는 Compose 진단 client로 SSO와 API
경계를 확인했다. 실행 직전 Docker runtime은 4 CPU와 8,307,167,232 bytes, Colima `MemAvailable`은
6,002,872 KiB, Docker data disk 여유는 79,889,124 KiB였다.

다음을 실행해 P07 범위만 검증했다.

```bash
cd labs/keycloak
./scripts/verify-p07.sh
```

실제 확인 결과는 다음과 같다.

- 앱 A/B는 같은 고정 Node image를 사용하지만 confidential client, 정확한 callback, HTTPS leaf,
  client/session secret과 session cookie 이름을 분리했다. 앱 B는 `127.0.0.1:30082`에만 publish하고
  web CA로 host HTTPS가 성공했으며 directory CA를 잘못 사용하면 TLS 검증이 실패했다.
- 일회성 P07 seed가 bearer-only `lab-api`, realm role `app-user`·`api-admin`, 앱 A/B의 `lab-api`
  audience mapper를 적용했다. `local-user`에는 `app-user`만 할당하고 `api-admin`은 할당하지 않았다.
  seed를 두 번 연속 실행해 중복 없이 동일한 성공 결과가 나왔다. 최초 구현에서 Keycloak image에 없는
  `awk`를 사용한 seed는 mapper 단계에서 종료됐고, 생성된 P07 객체를 멱등 갱신하는 단일 Node Admin REST
  seed로 교체한 뒤 전체 검증을 처음부터 통과했다.
- 진단 client는 앱 A에서 `local-user` credential을 한 번 제출해 Authorization Code + PKCE 로그인을
  마친 뒤 동일한 Keycloak cookie로 앱 B authorization endpoint를 호출했다. 로그인 폼이나 password
  제출 없이 앱 B callback이 즉시 돌아왔고 앱 B의 별도 session에서 같은 사용자를 확인했다.
- API는 host port 없이 Compose bridge의 `api:3000`에서만 실행했다. `jose` remote JWKS로 RS256 서명,
  고정 issuer, `lab-api` audience와 숫자 `exp`를 검증한다. 실제 요청은 무토큰 401, malformed token 401,
  유효하지만 `api-admin`이 없는 token 403, 앱 A/B의 `app-user` token 200을 각각 반환했다.
- 앱 A/B/API는 UID 1000, read-only root filesystem, 모든 capability drop,
  `no-new-privileges`로 실행했다. 앱 B secret은 필요한 service에만 read-only mount했고 inspect environment에
  값이 없었다. API에는 private secret mount가 없다.
- P03의 domain SID·alice/bob·그룹 결과, Samba/PostgreSQL named volume, P03~P06 검증 기록, 기존
  directory/web CA와 Keycloak·앱 A secret의 fingerprint가 전후 같았다. 별도 Supabase container 8개의
  실행·health·mount 상태도 같았으며 prune, reset, volume 삭제, Colima 재시작은 하지 않았다.

비밀번호·private key·cookie·authorization code·access token을 제외한 상세 산출물은
`.state/verification/p07/`에 있다. 이 비브라우저 SSO 결과는 보류 중인 P05 Admin Console/account 화면과
P06 실제 Chrome 검증을 대신하지 않으며 두 작업의 상태는 계속 `blocked`다.

### Ubuntu P03 플랫폼 검증 보류 유지

P07의 macOS/Colima 결과도 네이티브 Ubuntu의 P03 또는 P07 결과로 일반화하지 않는다. Ubuntu 24.04 +
rootful Docker Engine의 기존 P03 플랫폼 검증은 계속 미실행이며 별도 실행 결과가 필요하다.

## P08 Samba User Federation과 group→role→claim

| 환경 | 상태 | 실제 범위 |
|---|---|---|
| macOS 26.6.2 arm64 + Colima 0.10.3 | 비브라우저 자동 검증 통과 | Keycloak 26.7.3 LDAP provider/group mapper, Authorization Code + PKCE, 앱 A·API |
| 네이티브 Ubuntu 24.04 + rootful Docker Engine | 미실행 | Ubuntu P03 플랫폼 검증과 함께 별도 실행해야 함 |

P05·P06의 macOS browser CA trust·로그인과 Ubuntu P03 플랫폼 검증은 기존 `blocked`/보류 상태를
유지했다. P08은 그 항목을 선행 차단으로 쓰지 않고 web CA를 명시적으로 신뢰하는 Compose 진단 client와
실제 앱 A/API로 확인했다. Samba는 Microsoft AD DS가 아니라 AD 호환 실습 대역이며, 아래 결과도 Samba
4.19.5 container에서만 검증했다.

실행 전 앱 A/B·API·Keycloak·PostgreSQL·Samba가 모두 healthy였고, 두 named volume, domain SID
`S-1-5-21-2785298756-3808558117-572789873`, 두 CA와 기존 secret·P03~P07 검증 기록이 남아 있었다.
Colima는 4 CPU/8,307,167,232 bytes였고 시작 직전 `MemAvailable`은 5,947,492 KiB, Docker data disk
여유는 79,888,972 KiB였다. 최종 성공 실행이 기록한 값은 각각 5,949,100 KiB와 79,888,552 KiB였다.
별도 Supabase container 8개도 실행 중이며 health·mount 상태가 이전 기록과
같았다.

다음을 실행해 P08 범위만 검증했다.

```bash
cd labs/keycloak
./scripts/verify-p08.sh
```

첫 실행에서 Federation seed 두 번은 성공했지만 진단 스크립트를 `/run` 아래에 mount해 Node가 이미지의
`jose`와 `openid-client` package를 찾지 못했다. 기존 데이터나 설정을 삭제하지 않고 mount target을 앱
workdir 아래로 고친 뒤 같은 P08 검증을 처음부터 다시 실행해 전체 통과했다.

실제 확인 결과를 원본→federation→mapper→token→소비자 순서로 나누면 다음과 같다.

1. Samba 원본은 P03 기준과 동일하게 `app-users(alice,bob)`·`api-admins(alice)`였고 alice/bob LDAPS
   bind 및 domain SID가 유지됐다.
2. `samba-ad` provider는 `READ_ONLY`, import enabled, sync registration disabled였다. 연결은
   `ldaps://dc1.ad.keycloak.test:636` 하나이고 StartTLS·Kerberos는 껐다. directory CA가 Keycloak
   truststore에 있는 상태에서 full user sync가 성공했고 alice/bob의 실제 Keycloak 로그인도 성공했다.
3. `READ_ONLY` LDAP group mapper의 `fedToKeycloak` sync 뒤 Keycloak 모델에서 alice는
   `app-users`·`api-admins`, bob은 `app-users` 구성원이었다. 각 group에는 `app-user`·`api-admin` realm
   role을 따로 연결했다. seed를 연속 두 번 실행해 중복 provider/client/mapper 없이 같은 출력이 났다.
4. 별도 public 진단 client가 password grant가 아닌 Authorization Code + PKCE S256, state, nonce를
   사용했다. RS256 서명·고정 issuer·`lab-api` audience·숫자 `exp`를 검증한 access token에서 alice는
   `groups=[/app-users,/api-admins]`, `realm_access.roles=[app-user,api-admin]`; bob은
   `groups=[/app-users]`, `realm_access.roles=[app-user]`의 실습 관련 값만 확인했다.
5. 실제 앱 A 로그인과 bridge 내부 API 소비 경로에서 alice는 `/user`와 `/admin` 모두 200, bob은
   `/user` 200과 `/admin` 403이었다. 무토큰 API 요청은 401이었다. credential·cookie·authorization
   code·token은 stdout이나 검증 파일에 기록하지 않았다.

P08이 직접 건드린 client mapper/token 경계를 확인하기 위해 기존 `local-user`의 앱 A→API 경로만 다시
실행했고 `/user` 200, `/admin` 403이 유지됐다. 이미 통과한 앱 A→앱 B SSO와 P05/P06 전체 검사는
반복하지 않았다. 최종 여섯 service는 모두 healthy이며 두 volume, SID, CA·secret, P03~P07 기록과
Supabase 8개 workload의 전후 fingerprint/state가 같았다. P08 상세 산출물은 비밀값을 제외한
`.state/verification/p08/`에 있다.

### Ubuntu P03 플랫폼 검증 보류 유지

P08의 macOS/Colima 결과도 네이티브 Ubuntu의 P03 또는 P08 결과로 일반화하지 않는다. Ubuntu 24.04 +
rootful Docker Engine의 기존 P03 플랫폼 검증은 계속 미실행이며 별도 실행 결과가 필요하다.

## P09 변경·장애 시나리오

| 환경 | 상태 | 실제 범위 |
|---|---|---|
| macOS 26.6.2 arm64 + Colima 0.10.3 | 비브라우저 자동 검증 통과 | Keycloak 26.7.3, Samba 4.19.5 AD 호환 대역, 앱 A·API, Authorization Code + PKCE |
| 네이티브 Ubuntu 24.04 + rootful Docker Engine | 미실행 | Ubuntu P03 플랫폼 검증과 함께 별도 실행해야 함 |

P05·P06의 macOS browser CA trust·로그인과 Ubuntu P03 플랫폼 검증은 기존 `blocked`/보류 상태를
유지했다. P09는 그 항목을 선행 차단으로 쓰지 않았으며 password grant나 TLS 검증 우회로 사용자
browser flow를 대체하지 않았다. 일회성 관리 service의 기존 bootstrap 인증과 사용자용 Authorization
Code + PKCE를 분리했다. credential·cookie·authorization code·token은 stdout이나 검증 파일에 남기지
않았고 access/refresh token과 두 종류 cookie는 진단 process memory에서만 보관했다.

실행 직전 P08의 alice/bob 로그인, group/role/claim과 API 결과가 모두 정상임을 다시 확인했다. 여섯
service가 healthy였고 두 named volume, domain SID
`S-1-5-21-2785298756-3808558117-572789873`, 두 CA와 기존 secret·P03~P08 기록이 남아 있었다.
Colima는 4 CPU/8,307,167,232 bytes였고 최종 성공 실행 시작 시 `MemAvailable`은 5,874,328 KiB,
Docker data disk 여유는 79,887,776 KiB였다. 별도 Supabase container 8개도 이전과 같은
running/health/mount 상태였다.

다음을 실행해 P09 범위만 검증했다.

```bash
cd labs/keycloak
./scripts/verify-p09.sh
```

공통 관찰 조건은 provider `READ_ONLY`, import enabled, cache `DEFAULT`, full/changed periodic sync `-1`,
MSAD account-control mapper의 always-read-enabled `true`였다. realm은 access token lifespan 300초,
SSO idle/max 1,800/36,000초, client session override 0, refresh-token revocation `false`였다. source 변경
뒤 명시적 full/group sync와 user cache clear를 완료하고 Admin API 상태가 기대값이 된 시점에만 진단을
진행했다. 관찰 순서는 기존 JWT, 새 로그인 전 refresh, 새 로그인, 별도 기존 refresh, 앱 session이었다.

| 독립 시나리오 | 변경 반영 조건·경과 | 새 로그인 | refresh | 기존 JWT | 앱 A session |
|---|---|---|---|---|---|
| `api-admins`에서 alice 제거 | group sync + cache clear 뒤 Keycloak alice=`app-users`; 조건 대기 1,432 ms, 전체 진단 2초 | 성공. groups=`/app-users`, role=`app-user`; `/user` 200, `/admin` 403 | 새 로그인 전후 모두 200. 새 token도 같은 group/role과 API 200/403 | 만료까지 298초 남은 token으로 `/user`·`/admin` 200 | authenticated 유지. session의 기존 token으로 `/user`·`/admin` 200 |
| alice 계정 disable | Samba UAC disabled + full sync + cache clear 뒤 Keycloak enabled=false; 조건 대기 1,426 ms, 전체 진단 2초 | credential 제출 응답 HTTP 200에서 거부, callback/code 없음 | 새 로그인 전후 모두 HTTP 400 `invalid_grant` | 만료까지 299초 남은 token으로 `/user`·`/admin` 200 | authenticated 유지. session의 기존 token으로 `/user`·`/admin` 200 |
| Samba 중단 | exact container stopped 확인; 조건 대기 710 ms, LDAP 실패를 포함한 전체 진단 5초 | HTTP 400으로 거부, callback/code 없음 | 실패 로그인 전후 모두 200. 새 token에 `/app-users`,`/api-admins`와 `app-user`,`api-admin`; API 200/200 | 만료까지 294초 남은 token으로 `/user`·`/admin` 200 | authenticated 유지. session의 기존 token으로 `/user`·`/admin` 200 |

group 변경 중 bob의 새 token과 API도 직접 확인했다. bob은 groups=`/app-users`, role=`app-user`,
`/user` 200과 `/admin` 403으로 기존 판정이 유지됐다. group sync만 한 최초 시도에서는 `DEFAULT` user
cache 때문에 Admin API가 이전 alice membership을 반환했다. source를 즉시 복구한 뒤 공식 user-cache
clear를 sync 뒤 수행하도록 고쳤으며 최종 실행에서는 기대 membership을 조건으로 확인했다.

초기 구현의 두 시도는 source 변경 전 진단 준비 marker를 UID 1000 container가 host 임시 디렉터리에
쓰지 못해 중단됐다. 두 경우 모두 종료 trap이 membership·enabled·Samba health와 Keycloak 상태를
확인해 정상화했다. marker를 container의 제한된 tmpfs에 두고 container state로 기다리도록 바꿨다.
group cache를 발견한 중간 실패까지 포함해 모든 실패 경로에서 같은 복구 postcondition을 통과했다.

각 성공 시나리오 뒤 alice enabled, `api-admins(alice)`, Samba healthy, Keycloak의 alice/bob membership을
복구했다. 마지막 P08 범위 재검증은 시작 전 결과와 byte-for-byte 같았다: alice는 group/role 두 개와
API 200/200, bob은 `app-users`/`app-user`와 API 200/403, local-user는 P07 API 200/403이었다. 여섯
service는 최종 healthy이고 두 volume, SID, CA·secret, P03~P08 기록과 Supabase 8개 workload의 전후
fingerprint/state도 같았다. P09 상세 산출물은 비밀값을 제외한 `.state/verification/p09/`에 있다.

### Ubuntu P03 플랫폼 검증 보류 유지

P09의 macOS/Colima 결과도 네이티브 Ubuntu의 P03 또는 P09 결과로 일반화하지 않는다. Ubuntu 24.04 +
rootful Docker Engine의 기존 P03 플랫폼 검증은 계속 미실행이며 별도 실행 결과가 필요하다.

## P10 Compose lifecycle

| 환경 | 상태 | 실제 범위 |
|---|---|---|
| macOS 26.6.2 arm64 + Colima 0.10.3 | 보존 중단·재개와 서비스별 기동 통과 | Docker client 29.6.1/server 29.5.2, Compose 5.5.1 |
| 네이티브 Ubuntu 24.04 + rootful Docker Engine | 미실행 | Ubuntu P03 플랫폼 검증과 함께 별도 실행해야 함 |

P05·P06의 macOS browser CA trust·로그인은 기존 `blocked`, Ubuntu P03 플랫폼 검증은 보류 상태를
유지했다. P10은 이 항목을 선행 차단으로 사용하지 않았고 browser trust, kind·kubectl, Colima 설정이나
다른 workload를 변경하지 않았다. Samba는 Microsoft AD DS가 아닌 Samba 4.19.5 AD 호환 실습 대역이다.

실행 전 여섯 상시 service가 모두 healthy였고 project/network/volume의 Compose label과
`172.30.0.0/24`를 확인했다. SID는 `S-1-5-21-2785298756-3808558117-572789873`였으며 P03 디렉터리
기준과 byte-for-byte 같았다. 두 named volume, 두 CA와 기존 secret, P03~P09 검증 기록의 fingerprint도
존재했다. Colima는 4 CPU/8,307,167,232 bytes, `MemAvailable` 5,908,540 KiB, Docker data disk 여유
79,887,640 KiB였다. P09와 같은 비교 방식으로 실행 중인 Supabase container 8개의 health·mount 상태도
확인했다. 별도 exited Supabase container 하나는 P09의 실행 중 workload 비교 대상이 아니며 변경하지
않았다.

중단 전 P08/P09 정상 상태를 먼저 확인했다. alice/bob의 Authorization Code + PKCE 로그인, alice
groups/roles=`app-users,api-admins`/`app-user,api-admin`, bob=`app-users`/`app-user`, API alice
200/200·bob 200/403·local-user 200/403이 통과했다. P09 inspect도 alice enabled, bob enabled,
`READ_ONLY` provider와 기존 cache/sync/session 설정을 확인했다.

다음을 실행해 P10 범위만 검증했다.

```bash
cd labs/keycloak
./scripts/verify-p10.sh
```

실제 확인 결과는 다음과 같다.

- `status.sh`는 여섯 service를 모두 `running/healthy`로 판정했다. `stop.sh`는 exact
  `keycloak-lab` project에 `compose down`을 volume option 없이 실행했고, 이후 여섯 container와 project
  network는 없지만 두 named volume과 `.state`는 남은 조건을 확인했다.
- `resume.sh`는 기존 두 volume과 CA/secret을 요구한 뒤 `compose up --detach --wait`로 재개했다.
  Samba·PostgreSQL·Keycloak과 앱 A/B·API가 모두 healthcheck를 통과한 뒤 반환했다. 고정 sleep이나
  kind·kubectl은 사용하지 않았다.
- 재개 후 SID와 P03 디렉터리 결과, volume mount 이름이 중단 전과 같았다. P08 로그인·group/role/claim·
  API 결과와 P09 inspect 출력도 중단 전과 byte-for-byte 같았다. P03~P09 기록과 CA/secret fingerprint,
  두 volume의 label, Supabase 8개 running workload의 health·mount 상태도 전후 같았다.
- 서비스별 경로는 정확한 API container를 stopped 조건으로 만든 뒤
  `./scripts/service.sh start api`를 실행했다. Compose가 PostgreSQL·Keycloak dependency health와 API
  health를 기다렸고 API만 요청 service로 `running/healthy`가 됐다. 직후 P08 진단 결과도 중단 전과
  같았다. 최초 시도에서 POSIX shell 공통 함수가 요청 이름을 `app-b`로 덮어쓰는 문제를 발견했으며,
  상태 삭제 없이 요청 변수를 분리해 위 최종 결과로 다시 확인했다.
- `reset.sh --dry-run`은 project의 정확한 container/network, 두 volume과 삭제할 `.state` 항목을 먼저
  출력하고 아무것도 지우지 않았다. 확인 인자 없는 실행은 같은 목록을 출력한 뒤 exit 2로 거부됐고
  resource/state fingerprint가 그대로였다. 실제 확인 문자열 경로, volume 삭제, `.state` 삭제는
  실행하지 않았다. P04의 kind 파일·도구·검증 기록은 reset 제외 목록에 남았다.

P10 상세 산출물은 비밀값을 제외한 `.state/verification/p10/`에 있다. 최종 여섯 service는 healthy이며
마지막 자원 기록은 4 CPU/8,307,167,232 bytes, `MemAvailable` 5,913,376 KiB, Docker data disk 여유
79,888,052 KiB다. 빈 volume에서의 최초 시작과 실제 전체 초기화는 현재 상태 삭제를 금지한 P10 범위에서
실행하지 않았으며 P11의 명시적 빈 상태 전체 재현에서 검증해야 한다.

### Ubuntu P03 플랫폼 검증 보류 유지

P10의 macOS/Colima 결과도 네이티브 Ubuntu의 P03 또는 P10 결과로 일반화하지 않는다. Ubuntu 24.04 +
rootful Docker Engine의 기존 P03 플랫폼 검증은 계속 미실행이며 별도 실행 결과가 필요하다.

## P11 빈 상태 Compose 전체 재현

| 환경 | 상태 | 실제 범위 |
|---|---|---|
| macOS 26.6.2 arm64 + Colima 0.10.3 | 비브라우저 빈 상태 전체 재현 통과 | Colima VM Ubuntu 24.04.4 arm64, Docker client 29.6.1/server 29.5.2, Compose 5.5.1 |
| 네이티브 Ubuntu 24.04 + rootful Docker Engine | 미실행 | Ubuntu P03 플랫폼 검증 뒤 같은 P11 명령을 별도로 실행해야 함 |

P05·P06의 macOS browser CA trust·Chrome 로그인은 기존 `blocked`, Ubuntu P03 플랫폼 검증은 보류로
유지했다. P11은 browser flow, kind·kubectl, Microsoft AD DS 검증을 대신하지 않는다. 실행 전
macOS host kernel은 Darwin 25.6.0 arm64, Colima는 4 CPU/8 GiB·disk 100 GiB였고 Docker가 노출한
runtime은 Ubuntu 24.04.4 aarch64, 4 CPU, 8,307,167,232 bytes였다.

P10의 dry-run·guard만 통과한 상태에서 다음 확인 문자열을 명시해 실제 초기화와 빈 상태 재현을
실행했다.

```bash
cd labs/keycloak
./scripts/verify-p11.sh --confirm DELETE-keycloak-lab-compose-state
```

최종 성공 실행은 다음 순서와 결과를 확인했다.

1. exact `keycloak-lab` project의 여섯 container, bridge, Samba/PostgreSQL named volume과
   directory/web CA·secret·P03/P05~P10 로컬 검증 기록만 삭제됐다. project 자산과 Compose 생성 상태가
   빈 조건을 확인한 뒤 최초 시작으로 넘어갔다.
2. P04의 `.state/coredns`, 격리 kubeconfig, 고정 kind/kubectl/Compose 도구,
   `.state/verification/p04`, 추적한 `kind.yaml`·`kind/`·`k8s/` fingerprint는 reset 직후·보존 중단·
   최종 재개 뒤 모두 같았다. kind·kubectl 명령은 실행하지 않았고 P04 cluster도 다시 만들지 않았다.
3. 모든 비대상 container/network/volume을 비교했다. 실행 중인 Supabase 8개와 기존 exited Supabase
   container 하나, 별도 exited container 하나의 상태·health·mount·network, 관련 network와 volume은
   세 비교 시점에 같았다.
4. 빈 상태 `first-start.sh`는 105초에 CA·secret·두 volume과 Samba domain, PostgreSQL/Keycloak,
   앱 A/B·API, P05~P08 seed를 만들었다. reset 전 identity 파일 각각과 새 파일의 SHA-256이 달랐고 두
   volume 생성 metadata도 바뀌었다. 여섯 상시 service는 모두 `running/healthy`였다.
5. local-user가 앱 A에 credential을 한 번 제출한 뒤 앱 B는 재입력 없이 SSO했다. API는 무토큰과
   malformed token 401, 유효하지만 역할 부족 403, `app-user` 역할 200을 반환했고 RS256·issuer·audience·
   expiration 검증을 유지했다.
6. LDAPS-only `READ_ONLY` federation과 group mapper sync 뒤 alice/bob 로그인이 성공했다. alice는
   `/app-users,/api-admins` → `app-user,api-admin` → API 200/200, bob은 `/app-users` → `app-user` →
   200/403이었다. local-user의 200/403도 유지됐다.
7. alice의 별도 Authorization Code + PKCE flow에서 refresh가 HTTP 200으로 성공했다. 새 access token은
   같은 group/role, 고정 issuer·audience·expiration 검증과 API 200/200을 통과했다. token·code·cookie는
   출력이나 증거 파일에 기록하지 않았다. 실제 생성한 진단 container는 user `node`, read-only root,
   capability 전체 drop, `no-new-privileges`, 256 MiB limit, host port 없음이었고 alice password와 web CA,
   진단 script 세 bind mount만 모두 read-only로 가졌다.
8. `stop.sh` 뒤 project container/network가 없고 새 volume·CA·secret이 보존된 조건을 확인했다.
   `resume.sh` 뒤 여섯 service가 다시 healthy였으며 Samba SID
   `S-1-5-21-1132250501-802315094-551798401`, 디렉터리 결과, local SSO/API, AD login/group/API와
   refresh 출력이 중단 전과 byte-for-byte 같았다.

최종 실행의 시작 직전 `MemAvailable`은 6,066,640 KiB, Docker data disk 여유는 79,888,516 KiB였다.
idle 표본에서 Samba 219.1 MiB, PostgreSQL 58.11 MiB, Keycloak 494.8 MiB, API 24.6 MiB, 앱 A 40.9 MiB,
앱 B 24.28 MiB를 사용했다. 네 시나리오 표본의 최저 `MemAvailable`은 5,854,816 KiB였고 Keycloak의
최대 관찰값은 refresh 때 602.1 MiB였다. 재개 뒤 최종 표본은 Samba 186.4 MiB, PostgreSQL 37.05 MiB,
Keycloak 497.3 MiB, API 36.54 MiB, 앱 A 37.94 MiB, 앱 B 37.18 MiB였다. 이 표본은 기존 4 CPU/4.5 GiB
hard-limit 계약을 바꾸지 않는다.

image virtual size는 Ubuntu base 28,949,196 bytes, PostgreSQL 155,261,177 bytes, Keycloak
266,417,908 bytes, Samba 92,644,071 bytes, 앱 image 82,101,867 bytes였다. network를 끄고 local image만
사용해 잰 volume 사용량은 Samba 45,516 KiB, PostgreSQL 70,400 KiB였다. 최초 Samba build는 고정한
Ubuntu snapshot artifact를 실제 조회했으므로 준비 단계를 offline 검증으로 기록하지 않는다. 그 뒤
local SSO/API, LDAP sync, AD login/group, refresh와 재개 후 진단은 `--pull never`의 local image와 Compose
내부 endpoint만 성공 기준으로 사용했다. 상세 산출물은 비밀값을 제외한 `.state/verification/p11/`에 있다.

검증 자동화의 첫 시도는 reset 뒤 새로 생긴 directory CA serial 파일을 오류로 취급한 identity 집합
비교 때문에 멈췄다. 다음 시도는 기능상 완료했지만 비대상 bind mount에 volume 전용 `Name`을 읽는
fingerprint 경고가 있어 그 통과 판정을 최종 근거로 쓰지 않고 후검사를 고쳤다. 두 경우 모두 빈 상태 기능
흐름은 통과했고 최종 실행은 새 파일을 허용하면서 기존 identity 각각의 교체를 요구하고, 모든 mount의
source/destination을 비교하는 수정본으로 경고 없이 전체 통과했다.

### Ubuntu P03·P11 플랫폼 검증 보류 유지

네이티브 Ubuntu 24.04 + rootful Docker Engine의 P03과 P11은 계속 **미실행**이다. macOS/Colima P11
결과를 Ubuntu 결과로 일반화하지 않으며, 지원 환경 전체의 검증은 Ubuntu에서 P03부터 실제 실행할 때까지
완료로 표시하지 않는다.

## D09 복제 browser flow의 OTP MFA

| 환경 | 상태 | 실제 범위 |
|---|---|---|
| macOS 26.6.2 arm64 + Colima 0.10.3 | 비브라우저 HTML form 검증 통과 | Keycloak 26.7.3, 복제 browser flow, TOTP/HMAC-SHA1/6자리/30초 |
| 실제 macOS Chrome | D09 화면 미실행 | P05·P06 대표 로그인은 통과했지만 OTP 등록·오답·복구 화면은 다시 실행하지 않음 |
| 네이티브 Ubuntu 24.04 + rootful Docker Engine | 미실행 | Ubuntu P03 플랫폼 검증 뒤 별도 실행 필요 |

2026-09-14에 기존 여섯 Compose service가 healthy이고 Docker가 4 CPU·8,307,167,232 bytes를 노출하며
`MemAvailable`이 5,924,464 KiB인 상태에서 다음을 실행했다.

```bash
cd labs/keycloak
./scripts/verify-d09.sh
```

최종 실행은 realm 기본 `browser` flow를 `d09-browser-otp`로 복제한 뒤 required Username Password
Form과 Conditional 2FA 구조를 확인했다. 전용 public client `d09-mfa`에만 browser flow override와
PKCE S256을 적용하고, 전용 로컬 사용자에게 `CONFIGURE_TOTP` required action을 부여했다. seed를 두 번
연속 실행한 출력은 같았다.

진단 client는 실제 Keycloak HTML form을 따라 첫 password 로그인에서 Configure OTP 화면을 받고
TOTP를 등록한 뒤 callback에 도달했다. 새 인증 session에서는 고정 오답이 OTP form에서 거부되고 정상
OTP가 callback에 도달했다. 분실 복구 시나리오는 관리 API로 해당 사용자의 OTP credential 하나만
삭제하고 `CONFIGURE_TOTP`를 재부여했으며, 재등록 callback 뒤 OTP credential 하나와 required action
해제를 확인했다. 비밀번호·OTP secret/code·cookie·authorization code는 출력이나 검증 파일에 남기지
않았다. 다른 Compose service와 별도 Supabase workload의 상태도 전후 동일했다.

첫 구현은 Configure OTP form의 내부 제출 secret을 Base32 표시값으로 오인해 계산에 실패했다. 수동
등록 화면의 표시용 Base32 secret과 hidden 제출값을 구분해 고쳤다. 이후 OTP 등록 뒤 User Profile
검증이 이어지는 것을 확인해 전용 사용자의 이름·이메일을 seed에 명시했고, 최종 전체 실행은 통과했다.
이 결과는 web CA를 명시한 Compose 진단 client의 실제 form 흐름이며 보류 중인 Chrome 검증을 대신하지
않는다.

## D16 두 realm OIDC Identity Brokering

| 환경 | 상태 | 실제 범위 |
|---|---|---|
| macOS 26.6.2 arm64 + Colima 0.10.3 | 비브라우저 HTML form 검증 통과 | Keycloak 26.7.3의 두 realm, OIDC provider, first broker login |
| 실제 외부 IdP·회사 계정 | 미실행 | 동일 Keycloak의 test realm만 upstream 대역으로 사용 |
| 네이티브 Ubuntu 24.04 + rootful Docker Engine | 미실행 | Ubuntu P03 이후 별도 실행 필요 |

`./scripts/verify-d16.sh`는 `d16-upstream` realm과 confidential broker client, 전용 upstream user,
study realm의 public diagnostic client와 OIDC provider를 seed했다. seed를 두 번 연속 실행한 출력이
같았고 기존 여섯 상시 service는 최종적으로 모두 healthy였다.

진단은 study authorization request가 upstream realm 로그인으로 redirect되는 것을 확인했다. 오답
upstream password는 그 로그인 form에서 거부됐고, 정상 password는 upstream code→study broker callback→
진단 client callback으로 이어졌다. 첫 로그인 뒤 study에는 로컬 사용자 하나와 `upstream-oidc` federated
identity link 하나가 생겼다. 새 browser session의 두 번째 broker 로그인은 같은 local user ID와 link를
재사용했다. password·client secret·upstream token·cookie·authorization code는 출력하지 않았다.

첫 실행은 browser cookie를 이름만으로 저장해 두 realm의 같은 이름·다른 Path cookie를 덮어써
`invalid_code`로 실패했다. 실제 cookie Path를 보존하도록 고친 뒤에는 Keycloak server의 upstream token
endpoint 호출이 web CA를 trust하지 않아 TLS 실패했다. web CA의 public certificate를 기존 truststore
디렉터리에 추가하고 Keycloak container만 재생성한 뒤 최종 검증이 통과했다. 이 결과는 test realm을
upstream으로 쓴 OIDC brokering이며 실제 회사 IdP나 Chrome 검증 결과가 아니다.

## D18 client credentials 서비스 계정

| 환경 | 상태 | 실제 범위 |
|---|---|---|
| macOS 26.6.2 arm64 + Colima 0.10.3 | Compose 진단 통과 | Keycloak 26.7.3 service account와 기존 `lab-api` |
| 실제 browser·사용자 로그인 | 해당 없음 | client credentials에는 browser와 사용자 password를 사용하지 않음 |
| 네이티브 Ubuntu 24.04 + rootful Docker Engine | 미실행 | Ubuntu P03 이후 별도 실행 필요 |

`./scripts/verify-d18.sh`는 confidential client `d18-worker`와 service account를 멱등하게 seed했다.
Standard/Implicit/Direct Access flow와 Full Scope Allowed는 껐고 service account 역할과 client role scope
양쪽에 `app-user`만 남겼다. `lab-api` audience mapper도 전용 client에 적용했다. seed를 두 번 연속
실행한 출력은 같았고 기존 여섯 상시 service는 전후 모두 healthy였다.

진단에서 오답 client secret은 token endpoint의 HTTP 401로 거부됐다. 정상 client credentials 응답의
access token은 RS256 서명, 고정 study issuer, `lab-api` audience, 미래 `exp`를 통과했고 subject는
`service-account-d18-worker`, realm 역할은 `app-user` 포함·`api-admin` 제외였다. refresh token은
발급되지 않았다. 기존 API는 무토큰 `/user` 401, 같은 token의 `/user` 200, `/admin` 403을 반환했다.
client secret과 access token 원문은 출력이나 증거 파일에 남기지 않았다. 상세 비밀 제외 산출물은
`.state/verification/d18/`에 있다.

## D24 PostgreSQL 백업과 격리 복원

| 환경 | 상태 | 실제 범위 |
|---|---|---|
| macOS 26.6.2 arm64 + Colima 0.10.3 | DB dump·격리 복원 통과 | PostgreSQL 18.6 custom-format dump와 별도 임시 volume |
| Keycloak 애플리케이션을 복원 DB에 연결 | 미실행 | DB schema/data 검증만 수행하고 live 연결은 변경하지 않음 |
| 네이티브 Ubuntu 24.04 + rootful Docker Engine | 미실행 | Ubuntu P03 이후 별도 실행 필요 |

`./scripts/verify-d24.sh`는 기존 여섯 상시 service가 healthy인 상태에서 live `keycloak` database를
`pg_dump --format=custom --no-owner --no-privileges`로 읽었다. archive list에 `REALM` table data가
포함된 것을 확인한 뒤 같은 고정 PostgreSQL image를 network-none 일회성 container와 전용
`keycloak-lab-d24-restore` volume으로 실행해 `pg_restore --exit-on-error`로 복원했다.

source와 restore의 realm·client·user 수는 같았다. 복원 DB에서 `study/app-a`, `study/d18-worker`,
`d16-upstream/study-broker`를 직접 조회했다. dump 크기와 SHA-256은 로컬 result에 남겼지만 DB password나
row 값은 출력하지 않았다. 복원 container·volume은 성공 뒤 제거됐고 live PostgreSQL volume과 Keycloak
설정은 바뀌지 않았으며 여섯 service는 모두 healthy였다. dump는 민감한 영속 상태를 포함할 수 있어
ignore된 mode 0700 `.state/verification/d24/`에만 있으며 추적하지 않는다.
