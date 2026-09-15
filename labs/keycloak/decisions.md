# Keycloak 실습 환경 결정

확인일: **2026-09-15**

이 문서는 P03 이후 구현이 임의로 바꾸지 않을 실습 환경 계약이다. 원격 배포물 가용성과 실제 실행
결과를 구분하며, 환경별 실행 결과와 미검증 사항은 `labs/keycloak/verification.md`에 남긴다. P05-C에서
기본 실습을 Docker Compose로 확정했다. 2026-09-15 guided 개편에서 추적된 P04 Kubernetes 실행 자산은
제거했으며 과거 결과는 이력으로만 남긴다. 현재 실행·검증·초기화는 P04나 kind/kubectl에 의존하지 않는다.

## 2026-09-15 guided 학습 구조

- `keycloak/`의 Client·Role·Federation·Mapper JSON은 학습자가 읽고 바꾸는 단일 설정 원본이다.
- `app/`에는 앱과 API 실행 예제만 두고 seed·상세 검증은 `internal/`에 둔다.
- `guided`는 base→app-a→app-b→api→ldap→groups를 한 단계씩 적용한다. `ready`는 같은 적용 함수를
  조합해 기존 완성 환경을 유지한다.
- mode/stage는 `.state/lifecycle/`에 allowlist 값으로 atomic 기록한다. metadata 없는 기존 환경은
  완성 ready/groups로 읽으며 status는 metadata를 만들지 않는다.
- stage 승격은 metadata만으로 판정하지 않는다. 실제 Client·Role·사용자·LDAP·mapper를 공개 설정과
  대조하고, 새 guided 전진에서는 뒤 단계의 lab 소유 객체가 없는지도 확인한 뒤 성공 stage를 기록한다.
- apply는 선행 단계를 자동 생성하지 않고 자신이 소유한 설정만 재적용한다. verify는 설정을 변경하지
  않고 매번 새 로그인 cookie jar로 실제 결과를 관찰한다.
- 현재 lab은 Compose 전용이다. 아래 P04 절과 kind 버전 표는 2026-09-14의 과거 결정·실측 기록이며
  현재 사용법이나 보존 계약이 아니다.

## 지원 범위

- 개인 환경은 **64-bit macOS + Colima의 Docker runtime**, 회사 환경은 **64-bit Ubuntu 24.04 LTS +
  rootful Docker Engine**을 지원한다. Docker Desktop, Ubuntu 파생 배포판, rootless Docker,
  Windows/WSL은 기본 지원 범위가 아니다.
- CPU 아키텍처는 **linux/amd64**와 **linux/arm64**만 지원한다. macOS에서도 container는 Colima Linux
  VM의 아키텍처를 사용한다. 한 환경의 모든 이미지는 runtime과 같은 아키텍처를 쓰며
  에뮬레이션은 지원 경로로 두지 않는다.
- 기본 실습은 Compose project와 bridge 이름을 모두 `keycloak-lab`으로 고정하고 kind·kubectl을 요구하지
  않는다. P04의 cluster `keycloak-lab`, context `kind-keycloak-lab`, namespace `keycloak-lab`는 후속
  Kubernetes 선택 실습에서만 다시 사용하며 기존 cluster나 host current context를 재사용하지 않는다.
- 공통 `lab-environment` 덱은 macOS 기본 경로를 Colima, Ubuntu 기본 경로를 Docker Engine으로 둔다.
  Docker의 Ubuntu 설치 문서는 Ubuntu 24.04와 amd64/arm64를 지원한다. kind v0.33.0 릴리스도 node
  이미지의 amd64/arm64 지원과 runtime과 같은 플랫폼 사용을 명시한다.
- 단일 Keycloak·PostgreSQL Compose 환경은 학습·장애 관찰용이며 운영 지원이나 HA를 검증하지 않는다.
  Keycloak의 비 OpenShift Kubernetes 지원은 best-effort이므로 P04 kind 결과도 운영 보증으로 쓰지 않는다.

호스트 도구는 다음 버전을 재현 기준으로 삼는다. macOS의 Compose는 전역 설치 대신 checksum을 고정한
공식 standalone binary를 `.state/tools/`에 받는다. Ubuntu 설치 자체는 이 디렉터리에서 자동화하지
않으며, 두 환경의 실제 버전은 P11 시작 때 다시 기록한다.

| 환경 | 도구 | 고정 버전 | 선택 이유 |
|---|---|---|---|
| macOS | macOS / Colima | `26.6.2` / `0.10.3` | 현재 개인 Apple Silicon 환경. Colima의 Docker runtime 사용 |
| macOS | Docker CLI / Colima VM Engine | `29.6.1` / `29.5.2` | 현재 Colima 프로필에서 확인한 client와 Ubuntu 24.04 VM daemon |
| macOS | Docker Compose standalone | `5.5.1`; darwin arm64 `sha256:998735c9b6fe68a4f05895e6ea73d71ad06f9fc7046383ad89e47346781b6af5`, x86_64 `sha256:a264d61e824bf08a78867e59cdf32eb09f0aee9ecdf9f6ebfa43f76dc52880f1` | 공식 GitHub release asset을 lab 로컬에 받아 checksum 검증 |
| Ubuntu | Ubuntu | 24.04 LTS, 최신 보안 업데이트 적용 | Ubuntu의 AD DC 절과 Docker Engine이 함께 지원하는 LTS |
| Ubuntu | Docker Engine / CLI | `29.8.0` (`5:29.8.0-1~ubuntu.24.04~noble`) | 2026-09-14 Docker 공식 stable apt 저장소에서 amd64/arm64 모두 확인 |
| Ubuntu | containerd.io | `2.3.5-1~ubuntu.24.04~noble` | 위 Docker 패키지와 같은 공식 저장소의 현재 묶음 |
| Ubuntu | Docker Compose plugin | `5.5.1-1~ubuntu.24.04~noble` | P03의 Compose 실행 기준 |
| 선택 실습 | kind | `v0.33.0` | P04 재현용 고정값. Compose 기본 실습에는 미사용 |
| 선택 실습 | kubectl | `v1.35.8` | P04 cluster patch와 일치시킨 고정값. Compose 기본 실습에는 미사용 |
| 선택 실습 | Kubernetes node | `v1.35.8` | P04와 후속 Kubernetes 선택 실습용 고정값 |

## 이미지와 패키지 고정

매니페스트와 Dockerfile에는 아래 **tag와 index digest를 함께** 쓴다. tag는 사람이 버전을 읽기 위한
이름이고 digest가 실제 내용을 고정한다. 로컬에서 빌드하는 Samba와 앱 이미지도 원본 base digest와
lockfile을 바꾸지 않는 한 같은 입력을 사용한다.

| 용도 | 고정 입력 | amd64 / arm64 | 선택 근거 |
|---|---|---|---|
| Keycloak | `quay.io/keycloak/keycloak:26.7.3@sha256:ff4257d0d64efbe99ed1ddfaf07765cc3c36dc7518bf8324d41961327f441c54` | Quay OCI index에서 둘 다 확인 | 2026-08-31의 최신 stable patch이며 보안 수정 포함. Keycloak 공식 컨테이너 사용 |
| PostgreSQL | `postgres:18.6-bookworm@sha256:1c59e2c3c818eaa0f0628f695b36e7c9e362d6b219b36a54a32df645cbd7e1af` | Docker Official Image에서 둘 다 확인 | Keycloak 26.7이 지원하는 PostgreSQL 18.x의 2026-08 보안·버그 수정 patch. Alpine보다 진단 도구 호환성이 익숙한 Debian 계열 선택 |
| kind node | `kindest/node:v1.35.8@sha256:07b2536e30b803ed61d1677a79df6115f798ce64c80f9e22f6ed45afd09323c0` | kind 릴리스가 둘 다 지원한다고 명시하고 registry index에서도 확인 | tag만 쓰지 말라는 kind 릴리스 지침과 저장소의 v1.35 기준을 함께 만족 |
| Samba base | `ubuntu:24.04@sha256:224a1869083a311ef3f13648a154ba79832fbef6364d31493642ca03082da254` | Docker Official Image에서 둘 다 확인 | Ubuntu의 공식 AD DC 절과 같은 패키지 구성을 직접 재현 |
| 테스트 앱 base | `node:24.21.0-bookworm-slim@sha256:2fe369e969550cde8e867afc3fe370b260140cab4a23d467074295b42163d553` | Docker Official Image에서 둘 다 확인 | Current인 Node 26 대신 LTS인 Node 24 사용 |

### Samba 이미지 선택

Samba 프로젝트가 유지하고 Ubuntu AD DC 절과 버전·권한을 함께 보증하는 OCI 이미지는 공식 자료에서
확인하지 못했다. 따라서 community Samba 이미지를 가져오지 않고, 위 Ubuntu base에 Ubuntu archive의
`samba-ad-dc`를 설치해 `keycloak-lab-samba:4.19.5-ubuntu24.04`를 로컬 빌드한다.

- Ubuntu snapshot은 `20260913T000000Z`, suite는 `noble`, `noble-updates`, `noble-security`, component는
  `main`, `universe`로 고정한다. snapshot이 전체 의존성 그래프를 같은 시점으로 묶는다.
- Samba 관련 패키지 버전은 `2:4.19.5+dfsg-4ubuntu9.7`이다. Ubuntu package index에서 `samba`와
  `samba-common-bin`의 amd64/arm64, architecture-independent `samba-ad-dc`와
  `samba-ad-provision`의 가용성을 확인했다.
- Ubuntu 공식 절의 `samba-tool domain provision --server-role=dc --use-rfc2307
  --dns-backend=SAMBA_INTERNAL` 흐름을 container entrypoint에 옮긴다. systemd를 흉내 내지 않고
  `samba --foreground --no-process-group`을 PID 1로 실행한다.
- 컨테이너는 root로 시작하지만 `privileged`, host network, Docker socket mount는 허용하지 않는다.
  2026-09-14 Colima에서 기본 capability만 사용한 최초 provision은 SYSVOL ACL의
  `set_nt_acl_conn: fset_nt_acl returned NT_STATUS_ACCESS_DENIED`에서 실패했다. Linux `xattr(7)`은 Samba가
  쓰는 `security.*` extended attribute의 쓰기 권한에 `CAP_SYS_ADMIN`이 필요하다고 명시한다. 따라서
  이 실패를 해결하기 위한 추가 권한은 `SYS_ADMIN` 하나로 제한한다.
- 이 이미지는 Microsoft AD DS가 아니라 Samba AD 호환 디렉터리 대역이다. 파일 서버와 Windows domain
  join은 범위 밖이다.

Ubuntu snapshot 서비스는 snapshot을 최소 2년 보존할 방침이라고 설명한다. 그 기간 이후 재빌드가
필요하면 P02의 가용성 확인을 다시 수행해 새 snapshot과 package version을 결정해야 한다.

## 이름, 네트워크, 주소와 포트

[RFC 2606](https://www.rfc-editor.org/rfc/rfc2606#section-2)에 따라 `.test`는 시험용으로 예약된
이름이므로 공개 DNS나 사용자의 실제 domain에 의존하지 않는다. 여기서 `공개 issuer`는 인터넷 공개가
아니라 browser에 보이고 token의 `iss`가 되는 canonical frontend 주소라는 뜻이다.

| 대상 | 고정값 | 노출 범위 |
|---|---|---|
| Docker bridge | `keycloak-lab`, `172.30.0.0/24` | 이 실습 전용. 생성 전 기존 route/network와 겹치면 중단하고 decisions부터 변경 |
| Samba DC | container `keycloak-lab-samba`, `172.30.0.10`, `dc1.ad.keycloak.test` | bridge 내부만. host port publish 없음 |
| Keycloak | service/container `keycloak` / `keycloak-lab-keycloak`, `172.30.0.20`, alias `keycloak.keycloak.test` | HTTPS `30080`을 host `127.0.0.1:30080`에 같은 번호로 publish |
| AD realm / NetBIOS / base DN | `AD.KEYCLOAK.TEST` / `KEYCLOAK` / `DC=ad,DC=keycloak,DC=test` | Samba와 LDAP Federation 공통 |
| Keycloak realm | `study` | `master`는 bootstrap/admin 전용 |
| 공개 issuer | `https://keycloak.keycloak.test:30080/realms/study` | browser와 모든 Compose container가 같은 문자열 사용 |
| 앱 A | alias와 URL `app-a.keycloak.test:30081`, callback `https://app-a.keycloak.test:30081/callback` | HTTPS `30081`을 host loopback의 같은 번호에만 publish |
| 앱 B | alias와 URL `app-b.keycloak.test:30082`, callback `https://app-b.keycloak.test:30082/callback` | HTTPS `30082`을 host loopback의 같은 번호에만 publish |
| API | service/alias `api:3000`, audience `lab-api` | Compose bridge 내부만, browser와 host에는 publish하지 않음 |
| LDAP | `ldap://dc1.ad.keycloak.test:389` | bridge 내부 진단 전용. 완성 Federation에는 사용하지 않음 |
| LDAPS | `ldaps://dc1.ad.keycloak.test:636` | Keycloak Federation의 유일한 완성 경로 |
| PostgreSQL | service/alias `postgres:5432` | Compose bridge 내부만, host port publish 없음 |

macOS와 Ubuntu host의 `/etc/hosts`에는 관리되는 한 블록으로 세 웹 이름을 `127.0.0.1`에 연결한다.
기존 항목과 충돌하면 덮어쓰지 않고 중단한다. Compose에서는 각 웹 service에 동일한 FQDN을 유일한
network alias로 둔다. Docker의 network-scoped alias를 쓰므로 container의
`keycloak.keycloak.test`는 Keycloak service IP로, host browser의 같은 이름은 loopback으로 해석된다.
`localhost`나 `host.docker.internal`을 issuer로 섞지 않는다.

Keycloak은 TLS를 직접 종료하고 내부 HTTPS listener도 `30080`으로 바꾼다. Compose long port syntax의
`target: 30080`, `published: "30080"`, `host_ip: 127.0.0.1`을 사용한다. `KC_HOSTNAME`은
`https://keycloak.keycloak.test:30080`, `KC_HTTPS_PORT`는 `30080`으로 고정한다. HTTP listener,
reverse proxy, `proxy-headers`, `hostname-backchannel-dynamic=true`, `hostname-strict=false`는 사용하지
않는다. 앱 A/B도 각각 내부 HTTPS listener와 host publish를 `30081`/`30082`로 같게 맞춘다. 따라서
browser와 container는 URL을 다시 쓰지 않고 같은 discovery/JWKS endpoint와 issuer를 사용한다.
Keycloak management endpoint는 bridge 내부 healthcheck에만 사용하고 host에 publish하지 않는다.

### P04 kind 점유 상태와 Compose 전환

2026-09-14 P05-C의 읽기 전용 조사에서 실행 중인 `keycloak-lab-control-plane`은 Compose 소유 bridge의
`172.30.0.20`과 host loopback `30080`~`30082`를 모두 점유했다. node는 kind bridge의
`172.19.0.2`에도 연결되어 있었다. 단순 `docker stop`은 host listener는 내리지만 stopped container의
network endpoint와 `172.30.0.20` 예약을 없애지 않으므로 Compose 전환 절차로 쓰지 않는다.

P05에서 Compose service를 만들기 전에 다음 순서를 지킨다. 이번 P05-C에서는 어느 단계도 실행하지 않았다.

1. 정확한 node가 `io.x-k8s.kind.cluster=keycloak-lab` label, 고정 node image, bridge 주소 `.20`, loopback
   port mapping을 가진 단일 P04 node인지 확인한다. Samba가 `.10`에서 healthy이고
   `keycloak-lab-samba-data`, `.state/directory-ca/`, `.state/secrets/`, `.state/verification/p03/`과
   `.state/verification/p04/`가 존재하는지도 먼저 확인한다.
2. 다른 이름의 cluster나 전역 대상을 건드리지 않고 아래 명령으로 **P04 cluster 하나만** 삭제한다.

   ```bash
   KIND_EXPERIMENTAL_PROVIDER=docker \
     ./labs/keycloak/.state/tools/kind-0.33.0 delete cluster \
     --name keycloak-lab \
     --kubeconfig ./labs/keycloak/.state/kubeconfig
   ```

3. `keycloak-lab-control-plane`과 kind cluster 이름이 사라지고, `172.30.0.20`의 owner가 없으며,
   `127.0.0.1:30080`~`30082`가 비었는지 확인한다. 동시에 Compose bridge, Samba container `.10`,
   Samba named volume, directory CA와 Samba secret, P03/P04 verification 파일이 그대로인지 확인한다.
   P03 기준 파일과 `verify-directory` 결과도 다시 비교한다.
4. 위 postcondition이 모두 맞을 때만 Keycloak service가 `.20`과 세 host port를 사용한다. 실패하면
   container 강제 삭제, network disconnect, prune, Colima 초기화로 우회하지 않고 원인을 기록한다.

`kind.yaml`, `kind/`, `k8s/directory-diagnostic.yaml`과 P04 verification 기록은 그대로 남긴다. 이 파일,
kind·kubectl, 실행 중 cluster는 Compose 시작·검증·중단·초기화의 선행 조건이 아니다. 후속 Kubernetes
선택 실습은 Compose 기본 실습이 끝난 뒤 주소·포트 소유권을 다시 조정하는 별도 작업으로만 재개한다.

## HTTPS와 LDAPS 신뢰

HTTPS와 LDAPS를 같은 스위치로 취급하지 않는다. 로컬 초기화 때 서로 다른 두 root CA를 만들고,
정상적인 중단·재시작이나 container 재생성에서는 다시 만들지 않는다.

| CA | leaf | 신뢰시키는 대상 |
|---|---|---|
| `keycloak-lab-web-ca` | `keycloak.keycloak.test`, `app-a.keycloak.test`, `app-b.keycloak.test` 각각의 server certificate | macOS/Ubuntu host browser·CLI, 앱 A/B·API·진단 container |
| `keycloak-lab-directory-ca` | SAN `DNS:dc1.ad.keycloak.test`, EKU `serverAuth` | Keycloak truststore와 LDAPS 진단 container |

- root CA 유효기간은 3650일, server leaf는 365일로 고정한다. 시작·검증 스크립트는 만료와 SAN을
  확인하며, 만료가 가까워도 묵시적으로 재발급하지 않는다.
- CA private key, leaf private key, bootstrap password, client secret은
  `labs/keycloak/.state/` 아래 로컬 산출물로 만들고 Git에서 제외한다. directory는 mode `0700`,
  private key와 secret source 파일은 `0600`으로 둔다. 공개 CA certificate만 host trust와 필요한
  container에 복사하거나 read-only mount하고, private key는 이미지 layer나 Compose environment에
  넣지 않는다.
- 비밀번호와 leaf private key는 top-level `secrets.file`에서 가져와 필요한 service에만 명시적으로
  부여하고 `/run/secrets/<이름>`에 read-only mount한다. Compose의 file-backed secret은 `uid`·`gid`·
  `mode` remapping을 지원하지 않으므로 P05는 실제 service UID가 source mode를 우회하지 않고 읽을 수
  있는지 macOS/Colima에서 확인한다. 값은 `compose.yaml`, `.env`, `docker inspect`의 container environment,
  image layer에 넣지 않는다.
- PostgreSQL은 공식 이미지의 `POSTGRES_PASSWORD_FILE`로 secret을 직접 읽는다. Keycloak은 공식
  이미지가 일반 `_FILE` 규약을 제공한다고 가정하지 않고, 추적하는 좁은 entrypoint wrapper가
  `/run/secrets/`의 DB·bootstrap 비밀번호를 process 시작 직전에 읽어 environment에 넣은 뒤
  `kc.sh start`를 `exec`한다. secret 값은 command argument나 로그에 출력하지 않는다. 앱은 필요한
  client/session secret 파일을 직접 읽는다.
- Keycloak은 PEM leaf certificate와 private key secret을 각각 `KC_HTTPS_CERTIFICATE_FILE`과
  `KC_HTTPS_CERTIFICATE_KEY_FILE`의 절대 경로로 읽고 직접 TLS를 종료한다. 앱 A/B도 자기 HTTPS key만
  부여받는다. Samba의 기존 `dc1.key`도 source 파일은 보존한 채 Compose secret mount로 옮긴다.
  `curl -k`, browser 경고 무시, TLS 검증 비활성화는 성공 판정에 사용하지 않는다.
- Keycloak에는 directory CA certificate 하나만 별도 `KC_TRUSTSTORE_PATHS`의 PEM 경로로 read-only
  mount한다. 앱·API에는 web CA만 신뢰시킨다. Samba는 `tls certfile`, `tls keyfile`, `tls cafile`에
  명시적 파일을 사용한다. 서로의 CA private key를 service에 mount하거나 기본 자동 생성 self-signed
  certificate에 의존하지 않는다.

P05에서 먼저 만드는 secret과 mount 이름은 다음으로 고정한다. 같은 DB credential은 PostgreSQL과
Keycloak 두 service에만 부여하고, Samba administrator/user password는 Keycloak에 주지 않는다.

| Compose secret | `.state` source | 허용 service와 target |
|---|---|---|
| `keycloak_db_password` | `secrets/keycloak-db-password` | PostgreSQL·Keycloak `/run/secrets/keycloak_db_password` |
| `keycloak_bootstrap_admin_password` | `secrets/keycloak-bootstrap-admin-password` | Keycloak `/run/secrets/keycloak_bootstrap_admin_password` |
| `keycloak_https_key` | `web-ca/keycloak.key` | Keycloak `/run/secrets/keycloak_https_key` |
| `keycloak_local_user_password` | `secrets/keycloak-local-user-password` | Keycloak `/run/secrets/keycloak_local_user_password` |
| `samba_tls_key` | 기존 `directory-ca/dc1.key` | Samba `/run/secrets/samba_tls_key` |
| `samba_admin_password` | 기존 `secrets/samba-admin-password` | Samba와 일회성 directory 진단 container |
| `samba_alice_password` / `samba_bob_password` | 기존 `secrets/samba-alice-password` / `samba-bob-password` | Samba와 일회성 directory 진단 container |
| `app_a_client_secret` | `secrets/app-a-client-secret` | 앱 A와 일회성 Client seed container `/run/secrets/app_a_client_secret` |
| `app_a_session_secret` | `secrets/app-a-session-secret` | 앱 A `/run/secrets/app_a_session_secret` |
| `app_a_https_key` | `web-ca/app-a.key` | 앱 A `/run/secrets/app_a_https_key` |
| `app_b_client_secret` | `secrets/app-b-client-secret` | 앱 B와 일회성 P07 seed container `/run/secrets/app_b_client_secret` |
| `app_b_session_secret` | `secrets/app-b-session-secret` | 앱 B `/run/secrets/app_b_session_secret` |
| `app_b_https_key` | `web-ca/app-b.key` | 앱 B `/run/secrets/app_b_https_key` |

공개 `web-ca/ca.crt`·`web-ca/keycloak.crt`, `directory-ca/ca.crt`·`directory-ca/dc1.crt`는 secret으로
가장하지 않고 필요한 service에만 명시적 read-only bind mount한다. Keycloak의 directory CA target은
`/opt/keycloak/conf/truststores/directory-ca.crt`, HTTPS leaf target은
`/run/keycloak-lab/certs/keycloak.crt`다. P06의 앱 A는 위 세 secret만 받고, Client seed는 bootstrap
관리자 password와 앱 A client secret만 받는다. 앱 A process에는 bootstrap credential을 주지 않는다.
P07의 앱 B도 자기 key와 client/session secret만 받는다. P07 seed는 bootstrap 관리자 password와 앱 B
client secret만 받고, 앱 B process에는 bootstrap credential을 주지 않는다. API는 private secret을 받지
않고 web CA certificate만 읽어 고정 issuer의 discovery/JWKS를 검증한다.

P05의 초기 realm 파일은 `study-realm.json`이고 시작 시 `--import-realm`으로 읽는다. `study`가 이미
DB에 있으면 Keycloak의 startup import 규칙대로 건너뛰므로 container 재생성이 기존 realm을 덮어쓰지
않는다. bootstrap 관리자는 `lab-admin`, 학습용 로컬 사용자는 `local-user`
(`local-user@keycloak.test`)다. 두 password는 JSON에 넣지 않고 Keycloak UID 1000의 wrapper가 각각의
file-backed secret을 읽어 process 환경으로 넘기며, 추적 JSON에는 환경 변수 placeholder만 둔다.
import에 포함한 `local-user`에는 `default-roles-study`를 명시한다. 이 composite가 제공하는 account
client의 기본 역할이 없으면 OIDC 앱 로그인은 성공해도 Account Console REST가 401을 반환한다.

## 데이터와 볼륨 수명

| 상태 | 저장 위치 | container 재생성 / 기본 `compose down` | P04 kind 삭제 | 명시적 전체 초기화 |
|---|---|---|---|---|
| Samba domain DB·SYSVOL | Docker named volume `keycloak-lab-samba-data` → `/var/lib/samba` | 유지 | 유지 | 명시적 확인 뒤 삭제 |
| Samba 설정 | image/template에서 생성, domain 생성 후 volume 상태와 일치 여부 확인 | 재생성 | 영향 없음 | 재생성 |
| PostgreSQL / Keycloak 상태 | Docker named volume `keycloak-lab-postgres-data` → `/var/lib/postgresql` | 유지 | 영향 없음 | 명시적 확인 뒤 삭제 |
| 앱 A/B session | 각 app container memory | 삭제 | 영향 없음 | 삭제 |
| CA·leaf·로컬 secret 원본 | `labs/keycloak/.state/` | 유지 | 유지 | 명시적 확인 뒤 삭제 |
| Compose secret mount | `.state` source에서 service별 read-only `/run/secrets/` mount | container와 함께 재생성 | 영향 없음 | source 삭제 때 소멸 |
| P04 파일·검증 기록 | 추적한 `kind.yaml`·`kind/`·`k8s/`와 `.state/verification/p04/` | 영향 없음 | 유지 | 기본 Compose 초기화 대상 아님 |

PostgreSQL 18 official image는 기본 `PGDATA`가 `/var/lib/postgresql/18/docker`이고 image volume root가
`/var/lib/postgresql`로 바뀌었으므로 named volume은 반드시 parent `/var/lib/postgresql`에 mount한다.
`/var/lib/postgresql/data`나 version 하위만 임의로 mount해 anonymous volume을 만들지 않는다.

일시 중단은 Docker Engine 또는 실습 container를 멈출 뿐 named volume과 `.state`를 지우지 않는다.
`docker compose down`은 `--volumes` 없이 사용한다. `down --volumes`, `docker system prune`,
`kind delete clusters --all`, 이름 없는 volume 일괄 삭제는 금지한다. 전체 초기화는 실행 전 정확한
project/container/network와 `keycloak-lab-postgres-data`, `keycloak-lab-samba-data`, `.state`를 각각
출력하고 사용자가 선택한 상태만 삭제한다. Compose 기본 초기화는 P04 파일·검증 기록을 삭제하지 않는다.

Samba의 핵심 상태는 `/var/lib/samba`에 유지하고 `/var/cache/samba`와 log는 재생성 가능 상태로 본다.
P03은 container 재생성 뒤 domain SID와 seed 사용자·그룹이 같은지 확인해 이 경계가 충분한지 검증했다.
P04 kind 삭제 전후에도 같은 결과를 확인하며, 부족하면 새 volume을 추가하기 전에 실제 변경 파일을
확인해 이 표를 고친다.

## Samba 테스트 디렉터리

P03의 seed는 실제 개인정보 대신 아래 고정된 시험용 이름만 만든다. 비밀번호는
`labs/keycloak/.state/secrets/`에 최초 한 번 무작위로 생성하며 seed를 다시 실행하거나 container를
재생성할 때 바꾸지 않는다.

| 개체 | 고정값 | 용도 |
|---|---|---|
| 사용자 | `alice` (`Alice Admin`) | `app-users`, `api-admins` 구성원. 로그인과 관리자 API 권한 경로 확인 |
| 사용자 | `bob` (`Bob Reader`) | `app-users` 구성원. 로그인은 되지만 관리자 API 권한은 없는 경로 확인 |
| 그룹 | `app-users` | 두 외부 사용자의 앱 로그인 허용 그룹 |
| 그룹 | `api-admins` | `alice`만 속하는 API 관리자 역할 원본 |

Samba container는 Compose의 기본 capability 집합에 위에서 확인한 `SYS_ADMIN`만 추가한다.
`privileged`, host network, Docker socket mount는 사용하지 않는다. 검증 스크립트는 실제 container의
`Privileged=false`, 전용 network와 `CapAdd=[CAP_SYS_ADMIN]`, Docker socket 부재를 확인한다.

## 테스트 앱과 API

앱 A와 B는 **하나의 Node.js/Express 소스 이미지**를 서로 다른 confidential client 설정으로 두 번
배포한다. UI framework나 Keycloak 전용 adapter를 추가하지 않는다.

| 의존성 | 고정 버전 | 책임 |
|---|---|---|
| Node.js | `24.21.0` LTS | Web Crypto와 fetch를 제공하는 runtime |
| `openid-client` | `6.8.8` | discovery, Authorization Code callback, PKCE S256, state·nonce 검증, token 요청 |
| `express` | `5.2.1` | 앱 A/B와 작은 API의 HTTP routing |
| `express-session` | `1.19.0` | code verifier/state/nonce와 앱 session. 단일 container memory store는 실습 전용 |
| `jose` | `6.2.12` | API의 고정 discovery `jwks_uri` 기반 서명과 `iss`, `aud`, `exp` 검증 |

P06은 매 로그인마다 `openid-client`로 PKCE verifier/challenge, state, nonce를 생성해 server-side session에
보관하고 callback에서 모두 검증한다. 앱이 protocol parameter나 JWT signature를 직접 구현하지 않는다.
P07 API는 신뢰한 issuer의 discovery/JWKS만 사용하고 access token의 허용 algorithm도 고정한다.
`jku` 같은 token header가 임의 JWKS 위치를 선택하게 하지 않는다. 무토큰 401, 유효하지만 권한 부족
403, 허용 200을 구분한다.

P07은 앱 A/B가 같은 server source와 image를 사용하되 client ID·callback·cookie·client/session/TLS
secret은 각각 분리한다. 앱 A에서 받은 access token은 memory session 안에만 두고 앱의 `/api/*` 경로가
bridge 내부 `http://api:3000`으로 전달한다. browser나 host에 token endpoint를 추가하지 않는다. 앱 B
로그인은 앱 A 로그인 때 생긴 Keycloak SSO cookie를 재사용하되 앱 B 자체 session cookie는 별도로 만든다.

Keycloak에는 bearer-only client `lab-api`, realm role `app-user`·`api-admin`, 앱 A/B 각각의
`oidc-audience-mapper`를 둔다. mapper는 access token의 `aud`에 `lab-api`만 추가하고 ID token audience를
바꾸지 않는다. P07의 로컬 기준 사용자는 `app-user`만 부여받아 `/user`는 200, `/admin`은 403이 된다.
P08은 Samba 그룹을 이 역할로 옮기고 별도 `groups` claim mapper를 추가한다. API는 `jose`의 고정 RS256
remote JWKS 검증에 `issuer=https://keycloak.keycloak.test:30080/realms/study`, `audience=lab-api`를
넘기고 숫자 `exp` claim도 필수로 확인한다. API는 Compose bridge에만 두고 host port를 publish하지 않는다.

P07 seed는 Node의 단일 프로세스에서 master realm의 built-in `admin-cli`로 bootstrap 관리자 인증을 한
뒤 Admin REST를 호출한다. 관리자 password와 짧은 access token은 process memory에만 있고 출력·파일로
남기지 않는다. 앱 B/API client, 역할, 역할 할당, audience mapper는 존재 수를 확인해 생성하거나 정확한
추적값으로 갱신하며 두 번 연속 실행 결과가 같아야 한다. 이 관리자 bootstrap 흐름은 앱 A/B의 Direct
Access Grants를 켜는 것이 아니다.

P08 User Federation은 provider `samba-ad` 하나를 `READ_ONLY`, `importEnabled=true`,
`syncRegistrations=false`로 둔다. 연결 URL은 `ldaps://dc1.ad.keycloak.test:636` 하나이며 StartTLS와
Kerberos를 끈다. Keycloak service의 기존 `KC_TRUSTSTORE_PATHS`가 directory CA만 읽으므로 LDAP
certificate 검증을 우회하거나 web CA와 섞지 않는다. bind credential은 기존 Samba Administrator
password를 일회성 P08 seed에만 mount해 Admin REST로 저장하고, 실행 중 Keycloak·앱·API container에는
그 source secret을 mount하지 않는다.

provider의 `vendor=ad`, `sAMAccountName`, `objectGUID`, `group`·`member` 설정은 Samba AD DC가 제공하는
AD 호환 LDAP schema를 선택하기 위한 값이다. 이 실습은 Samba 대역에서만 검증하며 Microsoft AD DS나
Windows domain에서 같은 결과를 확인했다는 뜻이 아니다. 26.7.3 provider factory가 provider 생성 시
기본 attribute mapper를 추가하는 동작도 그대로 사용한다.

LDAP `lab-groups` mapper는 `CN=Users,DC=ad,DC=keycloak,DC=test`에서 `app-users`와 `api-admins`만
filter하고 `member`의 DN membership을 `READ_ONLY`로 읽는다. 두 그룹은 최상위 Keycloak group으로
동기화하며 `app-users`에는 realm role `app-user`, `api-admins`에는 `api-admin`을 연결한다. LDAP group을
Keycloak 모델로 가져오는 이 단계와 token claim 출력은 분리한다. 후자는 앱 A/B와 P08 진단 client의
`oidc-group-membership-mapper`가 access token `groups`에 full path를 싣고, 기본 realm role mapper가
group에 연결된 역할을 `realm_access.roles`에 싣는다. 기존 P07 audience mapper의 `lab-api`는 유지한다.

P08 seed는 provider·LDAP mapper·두 group role mapping·세 client의 protocol mapper를 이름과 provider
종류로 하나만 찾고 생성 또는 갱신한다. 이어서 공식 Admin REST의 full user sync와
`fedToKeycloak` mapper sync를 호출하며, 두 번 연속 실행 결과가 같아야 한다. 관리자 password·bind
credential·관리 token은 process memory에만 두고 출력이나 검증 파일에 기록하지 않는다.

앱 A Client seed는 별도 일회성 Compose service가 Keycloak의 HTTPS 관리 API에 web CA truststore를
명시하고 적용한다. confidential client `app-a`는 정확한 callback 하나만 허용하고 Standard Flow와
PKCE S256만 사용한다. Implicit Flow, Direct Access Grants(password grant), service account는 끈다.
seed는 같은 client가 있으면 동일한 추적 설정과 로컬 client secret으로 갱신하고, 중복 client가 있으면
임의로 하나를 고르지 않고 실패한다. 관리자 password와 client secret 값은 명령 인자나 추적 JSON에
넣지 않고 각 container의 file-backed secret에서 읽는다.

`package.json`은 exact version을 쓰고 `package-lock.json`을 추적하며 image build는 `npm ci`를 사용한다.
두 앱의 session과 secret은 서로 분리한다. memory session store는 재시작 때 로그인 상태가 사라지는 것을
의도한 단일 container 실습 선택이며 운영 권장으로 서술하지 않는다.

## 자원 예산

기본 Compose runtime 계약은 **4 logical CPU, RAM 8 GiB, 시작 직전 사용 가능 memory 5 GiB 이상,
Docker data filesystem의 사용 가능 disk 20 GiB 이상**이다. 각 service에는 Compose `cpus`와
`mem_limit`을 실제 container limit으로 둔다. Keycloak 공식 container가 limit의 70%를 max heap으로
계산하고 작은 production-ready 배포에 2 GiB limit을 권하는 점을 Keycloak 값의 근거로 삼는다.

| 구성요소 | `cpus` | `mem_limit` | 구분 |
|---|---:|---:|---|
| Keycloak 1 container | `1.5` | `2g` | 공식 memory 권장 반영, Compose 실측 전 |
| PostgreSQL 1 container | `0.5` | `512m` | 소량 realm/session용 추정, Compose 실측 전 |
| 앱 A/B/API 각 1 container | 각 `0.25` | 각 `256m` | 최소 Node 앱. P06/P07 Compose hard limit 적용 |
| Samba container | `1.0` | `1g` | P03에 적용해 macOS/Colima 통과; 관찰 idle 약 184 MiB |
| 일회성 진단 container | `0.25` | `256m` | 실행할 때만 사용, P05 실측 전 |
| 합계 | `4.0` | `4.5 GiB` | hard limit 합계. 동시에 항상 사용하는 양이라는 뜻은 아님 |

2026-09-14 P05-C 조사 당시 default Colima는 2 CPU/2 GiB, swap 0, 사용 가능 memory 약 278 MiB,
Docker data disk 여유 약 77 GiB였다. 실행 중인 P04 node는 약 541 MiB, Samba는 약 184 MiB였다.
별도 Supabase container 8개가 약 720 MiB를 사용했고 모두 CPU·memory limit이 없었다. Supabase의
PostgreSQL·Storage named volume과 Studio bind mount도 존재한다. 따라서 disk는 기준을 만족하지만 현재
CPU·memory는 P05를 시작할 수 있는 계약을 만족하지 않는다.

P05 실제 기동 전에 P04 cluster를 위 절차로 정리하고 default Colima를 4 CPU/8 GiB로 증설하는 것이
기본 경로다. Colima stop/start는 Samba와 Supabase를 함께 중단시키므로 사용자의 중단 시간 승인을 받은
별도 작업에서만 수행하고 `colima delete`, volume 삭제, reset은 하지 않는다. 재시작 뒤 Samba·Supabase
named volume과 bind mount가 유지됐는지 확인한다. 다른 profile/runtime을 쓰려면 Samba volume과
`.state`를 검증 가능한 방식으로 이관하는 새 결정이 필요하므로 P05에서 즉석 우회하지 않는다.

증설 뒤에도 P05/P11 시작 직전에 실행 중인 다른 workload와 `MemAvailable`을 다시 확인한다. Supabase가
실행 중이어도 5 GiB 가용 memory 조건을 만족하면 진행할 수 있지만, limit이 없어 조건을 만족하지 못하거나
검증 중 압박이 생기면 사용자 승인 없이 중단하지 않는다. 해당 workload의 유지/일시 중단을 결정받거나
P05를 blocked로 기록한다.

P11에서는 실행한 환경과 아키텍처를 명시하고 idle 안정화 뒤와 로그인/refresh/LDAP sync 시나리오 중에
`docker stats --no-stream`, `/proc/meminfo`의 `MemAvailable`, image/volume disk 사용량을 기록한다. 이 표의
추정치와 관찰값을 나란히 남기며 한 아키텍처나 macOS 결과를 Ubuntu 실측으로 일반화하지 않는다.

## 2026-09-14 가용성 확인

아래 확인은 P02에서 원격 배포물의 존재와 metadata를 확인한 것이다. P03의 macOS/Colima 실제 Samba
결과는 `verification.md`에 분리했으며, 네이티브 Ubuntu와 Keycloak 로그인은 아직 실행하지 않았다.

- Keycloak GitHub release API의 latest가 `26.7.3`(2026-08-31)이었고 tarball URL은 HTTP 200,
  SHA-256은 `77657f30b7e90d70f727712ce1c967f430fd6a5e9f458d32d8c6df0635345f47`이었다. Quay manifest는
  위 index digest와 linux/amd64·linux/arm64 platform manifest를 반환했다.
- kind GitHub release API의 latest가 `v0.33.0`(2026-08-26)이었다. linux/amd64와 linux/arm64 binary
  URL은 HTTP 200이었고 SHA-256은 각각 `aee6151561422756b764a4ae28e7f44cda5af5a9eead3cc9985112b1de8d8e0d`,
  `20022bee6cfcd5086cb7234d218e3454e6090022f2a8f55d1fa7fcf42c3867a2`였다.
- v1.35.8 kubectl의 linux/amd64·linux/arm64 URL은 HTTP 200이었고 공식 checksum은 각각
  `874d5e72dbb819f43cff16bcd1e4f8bac5b7f2361fe1e55049b0a6c676fb0cbf`,
  `cc749967b62f4422260bc9c0aa7a7c55f45175ae38cb8d95767b5d2b7e04c1fd`였다.
- Docker Hub tag API에서 PostgreSQL, Ubuntu, Node, kind node의 위 index digest와 amd64/arm64
  platform이 active인 것을 확인했다. Quay와 Docker Hub가 반환한 서명/attestation용 unknown platform은
  지원 아키텍처로 세지 않았다.
- Ubuntu package index가 Samba `2:4.19.5+dfsg-4ubuntu9.7`의 amd64/arm64를 표시했고
  `20260913T000000Z` snapshot의 `noble-updates/Release`는 HTTP 200이었다.
- npm registry metadata의 latest와 tarball HTTP 200을 `openid-client@6.8.8`, `jose@6.2.12`,
  `express@5.2.1`, `express-session@1.19.0` 각각 확인했다. 실제 dependency tree는 P06의 lockfile과
  P07에서 추가한 exact `jose@6.2.12` 항목이 고정한다.

digest와 platform을 조회한 정확한 metadata endpoint는
[Keycloak Quay manifest](https://quay.io/v2/keycloak/keycloak/manifests/26.7.3),
[PostgreSQL tag](https://hub.docker.com/v2/repositories/library/postgres/tags/18.6-bookworm),
[kind node tag](https://hub.docker.com/v2/repositories/kindest/node/tags/v1.35.8),
[Ubuntu tag](https://hub.docker.com/v2/repositories/library/ubuntu/tags/24.04),
[Node tag](https://hub.docker.com/v2/repositories/library/node/tags/24.21.0-bookworm-slim)이다.

## 2026-09-14 P05-C 계약 근거 확인

P05-C는 배포하지 않고 공식 문서와 현재 runtime을 읽기 전용으로 대조했다.

- Docker Compose의 network alias는 같은 network의 다른 container가 service의 대체 hostname으로
  사용하며, long port syntax는 `host_ip`, `published`, `target`을 분리한다. 이를 근거로 host와 bridge에서
  같은 FQDN·port를 쓰는 계약을 정했다.
- Compose secret은 service별로 부여되어 `/run/secrets/`에 read-only file로 mount된다. file source의
  `uid`·`gid`·`mode` remapping 제한은 P05의 실제 image UID 검증 항목으로 남겼다.
- named volume은 custom `name`을 그대로 사용하며, 일반 `docker compose down`은 named volume을
  지우지 않고 `--volumes`가 명시됐을 때 삭제한다. PostgreSQL 18 official image의 volume root 변경도
  확인해 DB volume target을 `/var/lib/postgresql`로 확정했다.
- Keycloak의 full `hostname` URL은 frontend URL을 고정하지만 listener port를 바꾸지 않는다. 따라서
  `KC_HOSTNAME`과 별도로 `KC_HTTPS_PORT=30080`을 정했고, PEM certificate/key와 추가 PEM truststore path를
  공식 옵션으로 사용한다.
- kind 공식 삭제 명령과 로컬 v0.33.0 help의 `--name`·`--kubeconfig`를 대조했다. 현재 node의 실제 label,
  network endpoint와 port binding을 확인해 P04 하나만 대상으로 한 전환 명령과 전후 검사를 정했다.
- 현재 Docker context는 `colima`, client/server는 29.6.1/29.5.2였고 default profile은 2 CPU/2 GiB였다.
  P04 node와 Samba, 별도 Supabase 8개가 실행 중이었으며 어떤 container, cluster, network, volume,
  Colima 설정도 변경하지 않았다. host `/etc/hosts`에는 아직 세 웹 이름이 없으므로 P05에서 기존 항목
  충돌 검사와 관리 block 추가·복구 절차가 필요하다.

## 2026-09-14 P08 LDAP·mapper 근거 확인

- Keycloak 26.7 Server Administration Guide는 LDAP provider의 `READ_ONLY` edit mode에서 mapped user
  attribute와 password update를 허용하지 않고, LDAPS URL에는 server-side truststore가 필요하다고
  설명한다. `Import Users`가 켜지면 최초 조회·로그인이나 full sync로 사용자를 로컬 DB에 가져오되
  인증 때 LDAP password를 검증한다.
- 같은 26.7 guide는 Group Mapper가 LDAP group과 user-group membership을 Keycloak group 모델로
  전파하고, realm role은 기본적으로 access token의 `realm_access` claim에 들어간다고 구분한다.
- 고정 26.7.3 `LDAPStorageProviderFactory` source에서 `useTruststoreSpi` 기본값 `always`, `READ_ONLY`
  기본 처리, provider 생성 시 attribute mapper 생성, full sync 전 mapper sync 동작을 대조했다.
- 고정 26.7.3 `GroupLDAPStorageMapperFactory` source에서 import-enabled parent의 `READ_ONLY` mode가 LDAP와
  DB group mapping을 읽되 새 join을 LDAP에 쓰지 않는 동작, `member` query 전략, `fedToKeycloak` sync
  지원을 대조했다. `GroupMembershipMapper` source에서는 full group path를 access token claim으로
  출력하는 설정을 확인했다.

## 2026-09-14 D09 MFA 실습 결정

D09는 realm 기본 `browser` flow를 직접 수정하지 않고 `d09-browser-otp`로 복제한다. 전용 public
client `d09-mfa`의 browser flow binding override에만 복제 flow를 연결해 기존 앱 A/B 로그인에 영향을
주지 않는다. 복제한 26.7.3 기본 flow의 required Username Password Form과 Conditional 2FA를 확인하고,
전용 로컬 사용자 `d09-mfa-user`에 `CONFIGURE_TOTP` required action을 부여한다. client는 정확한 진단
callback 하나와 Authorization Code + PKCE S256만 허용하며 implicit·Direct Access Grants·service
account는 끈다.

검증은 Keycloak 26.7.3 기본 OTP policy인 TOTP/HMAC-SHA1/6자리/30초를 seed 단계에서 확인한 뒤 시작한다.
첫 로그인에서 비밀번호 다음 Configure OTP 화면과 callback 완료, 새 로그인에서 오답 OTP 거부와 정상
OTP callback을 구분한다. 분실 복구는 관리 API로 해당 사용자의 OTP credential 하나만 삭제하고
`CONFIGURE_TOTP`를 다시 부여한 뒤 재등록과 callback, 최종 OTP credential 하나를 확인한다. OTP secret,
code, password, cookie, authorization code는 process memory에만 두고 검증 파일에 기록하지 않는다.
이 자동화는 web CA를 명시적으로 신뢰하는 Compose 진단 client의 실제 HTML form 흐름이며 보류 중인
macOS Chrome 검증을 대신하지 않는다.

근거는 Keycloak 26.7 Server Administration Guide의 authentication flow 복제 권고, 기본 browser
flow의 Conditional 2FA·OTP Form 구조, Configure OTP required action과 credential 복구 절차다.

## 2026-09-14 D16 Identity Brokering 실습 결정

D16은 같은 Keycloak instance의 두 번째 `d16-upstream` realm을 외부 OIDC IdP 대역으로 쓴다. 실제
회사 IdP나 소셜 계정을 요구하지 않으면서 study realm→upstream authorization→study broker callback의
표준 경계를 확인할 수 있다. upstream에는 confidential `study-broker` client와 완전한 profile을 가진
전용 사용자 하나만 두고, study에는 public `d16-broker-diagnostic` client와 `upstream-oidc` provider를
둔다. 두 client는 Authorization Code를 사용하고 진단 client는 PKCE S256을 요구한다.

provider는 upstream issuer·authorization/token/UserInfo/JWKS URL을 같은 HTTPS origin으로 검증하고
`syncMode=IMPORT`, `storeToken=false`, 기본 `first broker login` flow를 쓴다. 최초 로그인은 고유한 외부
사용자를 study의 로컬 broker user로 만들고 federated identity 하나를 연결해야 하며, 두 번째 로그인은
같은 local user/link를 재사용해야 한다. 같은 email/username의 기존 계정을 자동 연결하는 시나리오는
보안상 별도 선택이므로 이 실습에 넣지 않는다.

Keycloak server가 자기 HTTPS endpoint를 upstream IdP로 호출하므로 기존 directory CA뿐 아니라 public
web CA도 `/opt/keycloak/conf/truststores/`에 read-only mount했다. `KC_TRUSTSTORE_PATHS`는 그 디렉터리를
읽는다. 두 CA와 leaf SAN이 분리된 구조는 유지되며 private key는 추가로 공유하지 않는다. 첫 실행에서
token endpoint TLS가 web CA를 신뢰하지 못해 실패한 사실을 근거로 이 변경을 적용했고 Keycloak container만
재생성해 DB·Samba volume과 기존 realm을 보존한 뒤 전체 D16 검증을 다시 통과했다.

## 2026-09-14 P09 변경·장애 관찰 결정

P09는 provider 설정을 바꾸지 않고 P08의 `READ_ONLY`, `importEnabled=true`, `cachePolicy=DEFAULT`,
`fullSyncPeriod=-1`, `changedSyncPeriod=-1`을 관찰 조건으로 고정한다. 주기 sync가 모두 꺼져 있으므로
Samba 변경 뒤에는 full user sync 또는 `fedToKeycloak` group mapper sync를 명시적으로 호출한다.
26.7 가이드가 설명하는 import DB와 user cache를 같은 것으로 취급하지 않는다. 실제 26.7.3에서 group
sync 직후 현재 노드의 Admin API가 이전 membership을 반환한 것을 확인했으므로, P09 관리 절차는 sync가
성공한 뒤 공식 `POST /admin/realms/study/clear-user-cache`를 호출하고 기대한 user/group 상태를 조건으로
확인한다. 이는 provider를 `NO_CACHE`로 바꾸는 설계 변경이 아니다.

Samba `userAccountControl`은 자동 생성된 `msad-user-account-control-mapper`가 읽는다. 현재 mapper의
`always.read.enabled.value.from.ldap=true`를 확인했고, Samba에서 alice를 disable한 뒤 full sync와 cache
clear로 Keycloak `enabled=false`가 된 경우만 비활성화 시나리오 관찰을 시작한다. 26.7.3 mapper source는
import 시 `ACCOUNTDISABLE`을 Keycloak enabled 값에 반영한다. refresh 경로의 `TokenManager`는 현재
session user가 disabled면 `invalid_grant`를 반환한다. 반면 API가 이미 발급된 JWT의 서명·issuer·audience·
expiration만 로컬 검증하는 P07 계약은 바꾸지 않으므로, 계정 disable 자체가 기존 JWT를 회수한다고
서술하지 않는다.

관찰 당시 realm 값은 access token 300초, SSO session idle 1,800초/max 36,000초, client session
idle/max override 0, refresh-token revocation/rotation false였다. P09 진단 client는 Authorization Code +
PKCE로 얻은 access/refresh token을 process memory에만 보관한다. 앱 A는 P06/P07 설계대로 refresh token을
저장하지 않고 memory session에 access token을 보관하므로, 앱 `/session`의 로그인 상태와 그 session이
기존 token으로 호출한 API 결과를 따로 기록한다.

Samba 중단 시나리오는 정확한 `keycloak-lab-samba` container만 stop하고 stopped 조건을 확인한다.
고정 26.7.3와 위 `DEFAULT` cache 구성에서는 LDAP 비밀번호 검증이 필요한 새 로그인은 실패했지만,
중단 전에 만들어진 두 client session의 refresh는 실패한 새 로그인 전후 모두 성공했고 기존
group/role claim을 다시 발급했다. 이 결과는 단일 Keycloak node와 Samba 4.19.5 AD 호환 실습 대역에서
관찰한 cache/session 동작이며 Microsoft AD DS, 다른 cache policy, cache eviction 뒤 또는 다중 node의
일반 보장이 아니다.

각 시나리오는 별도 변경 전 token·refresh·앱 session을 만들고, source/Keycloak 조건 확인 뒤
`기존 JWT → refresh → 새 로그인 → 별도 기존 refresh → 앱 session` 순서로 관찰한다. 성공 여부와 무관하게
Samba health, alice enabled, `api-admins(alice)`, full/group sync와 user cache clear까지 복구한 뒤 다음
시나리오를 시작한다. 고정 sleep은 readiness나 state 결과로 사용하지 않고 health·container state·
명시적 marker와 Admin API 상태를 deadline 안에서 poll하는 데만 사용한다.

## 2026-09-14 P10 Compose lifecycle 결정

기본 lifecycle은 `compose.yaml`과 project name `keycloak-lab`을 항상 함께 지정한다. 상시 service는
`samba`, `postgres`, `keycloak`, `api`, `app-a`, `app-b` 여섯 개로 고정하며, lifecycle 전에는 같은
이름의 container·network·volume이 Compose label과 기대 service/subnet을 소유하는지 확인한다. 알 수 없는
project container나 이름만 같은 외부 resource가 있으면 자동 정리하지 않고 중단한다. kind·kubectl은
Compose 시작·상태·중단·재개의 입력이나 정리 대상으로 사용하지 않는다.

최초 시작은 두 named volume과 project network가 없을 때만 허용한다. 분리 CA와 file-backed secret을
기존 prepare script로 만든 뒤 Samba·PostgreSQL·Keycloak의 health를 기다리고, P06~P08의 멱등 seed를
적용한 다음 앱 A/B·API health까지 기다린다. 기존 volume이 있으면 새 identity로 덮어쓰지 않고 보존
재개 경로를 사용한다. 단, 최초 시작 도중 실패하면 `.state/lifecycle/first-start-in-progress` marker가
있는 exact project만 같은 명령으로 이어서 멱등 초기화할 수 있고 성공 뒤 marker를 제거한다. 최초 빈
상태 재현은 현재 P03~P09 상태 삭제가 필요한 P11 범위이므로 P10에서는 구현과 Compose config/shell
검증만 하고 실행하지 않는다.

보존 중단은 exact project의 `compose down`을 `--volumes` 없이 실행한다. container와 project network는
제거하지만 `keycloak-lab-samba-data`, `keycloak-lab-postgres-data`와 `.state`는 남긴다. 재개와 서비스별
기동은 `compose up --detach --wait`를 사용하며, 별도 고정 sleep 없이 Compose healthcheck가 readiness를
판정한다. 서비스별 기동은 여섯 이름만 받고 선언된 Compose 의존성까지 올린다. 앱의 memory session은
container와 함께 사라지지만 Samba SID와 Keycloak DB/Federation은 volume에 보존된다.

명시적 Compose 전체 초기화는 실행 전에 project label이 일치하는 정확한 container, `keycloak-lab`
network, 두 named volume과 삭제할 `.state` entry를 모두 출력한다. P04 선택 실습의 추적 파일과
`.state/coredns`, `.state/kubeconfig`, `.state/tools`, `.state/verification/p04`는 이 초기화 대상에서
제외한다. dry-run은 출력만 하고, 실제 삭제는 고정 확인 문자열
`DELETE-keycloak-lab-compose-state`가 있어야 진행한다. 일반 중단에는 이 경로를 사용하지 않으며
`down --volumes`, 전역 prune/삭제, Colima reset/delete, kind 조작은 lifecycle에 넣지 않는다.

## 2026-09-14 P11 빈 상태 전체 재현 결정

P11은 P10과 같은 확인 문자열을 다시 요구하는 `verify-p11.sh` 하나에서만 실제 Compose 초기화를
수행한다. 이 명령은 실행 전 P10 보존 결과를 요구하고, `reset.sh --dry-run` 뒤
`reset.sh --confirm DELETE-keycloak-lab-compose-state`를 호출한다. 최초 실행이나 재검증 중 실패했더라도
이전 P10 보존 결과를 P11 로컬 증거에 복사해 두므로 같은 guarded 절차로만 다시 시작할 수 있다.

삭제 후에는 project container·network·두 named volume과 Compose 생성 `.state`가 모두 사라졌는지
먼저 확인한다. 동시에 `.state/coredns`, `.state/kubeconfig`, `.state/tools`,
`.state/verification/p04`와 추적한 `kind.yaml`·`kind/`·`k8s/`를 파일 fingerprint로 비교한다. 모든
비대상 Docker container는 실행 여부·health·mount·network, 모든 비대상 network와 volume은 driver·
subnet·label을 reset 직후, 보존 중단 시점, 최종 재개 뒤에 비교한다. 따라서 P11 성공은 실행 중인
Supabase만이 아니라 기존 exited container와 그 자산도 바뀌지 않은 조건을 포함한다. P04 자산이 없는
환경에서는 부재 상태 자체를 비교하며, optional kind 실습을 Compose P11의 선행 조건으로 만들지 않는다.

빈 상태의 `first-start.sh`는 CA·leaf key·password/client/session secret과 Samba/PostgreSQL volume을
새로 만들고 P05~P08 seed를 readiness 순서로 적용한다. reset 전후에는 기존 identity 파일 각각의
SHA-256이 바뀌고 volume 생성 metadata가 바뀌었는지 확인하되 값 자체는 기록하지 않는다. 정상적인
`stop.sh`·`resume.sh`에서는 새 identity와 volume metadata, Samba SID와 디렉터리 결과가 그대로인지
확인한다. P11 전체 초기화는 P03·P05~P10의 로컬 상세 증거를 의도대로 지우므로 P10 보존 요약만 P11
증거에 복사하고, 과거의 검증 사실은 추적한 `verification.md`와 계획 실행 기록에 보존한다.

P11의 로컬 SSO/API와 Samba 로그인·group→role→claim은 기존 P07/P08 진단을 그대로 사용한다. refresh는
P08의 public 진단 client로 alice의 Authorization Code + PKCE 로그인을 새로 수행하고 refresh token으로
받은 access token의 RS256 서명·고정 issuer·`lab-api` audience·`exp`, group/role과 API 200/200을
검증하는 `p11-diagnostic`을 추가했다. 이 service는 Samba alice password 하나와 web CA만 읽고,
read-only root filesystem·전체 capability drop·`no-new-privileges`·256 MiB limit을 유지한다.

최초 image pull/build와 Samba image의 고정 snapshot package 준비는 인터넷이 필요할 수 있는 준비
단계다. 실제 macOS 실행에서도 Samba build의 고정 remote `ADD`가 snapshot artifact를 조회했다. 이후
P07/P08/P11 진단과 반복 LDAP sync에는 `--pull never`를 적용해 로컬 image만 사용하고, 성공 판정은
Compose DNS의 Keycloak·앱·API·Samba endpoint만 사용한다. volume 사용량 측정 container도
`--network none --pull never`로 격리한다. 이 경계를 offline image 준비까지 검증했다는 뜻으로
확대하지 않는다.

자원은 최초 시작 직후 idle, 로컬 SSO/API, LDAP sync, AD 로그인·group claim, refresh와 최종 재개 뒤에
`docker stats --no-stream` 및 `MemAvailable`로 관찰한다. image virtual size와 두 volume의 실제 사용량도
별도로 기록한다. 이 측정은 macOS/Colima arm64 한 환경의 단일 표본이며 Compose hard limit을 낮추거나
Ubuntu 자원값으로 일반화하는 근거로 쓰지 않는다.

## D18 서비스 계정 경계

자동화 주체는 사람의 password나 browser session을 재사용하지 않고 전용 confidential client
`d18-worker`의 service account와 `client_credentials` grant를 사용한다. Standard Flow, Implicit Flow,
Direct Access Grants와 Full Scope Allowed는 끈다. client secret은 `.state/secrets/`에서 실행 시 생성하며
추적 파일이나 진단 출력에 넣지 않는다.

최종 token 역할은 service account에 부여한 역할과 client role scope의 교집합으로 제한한다. 두 경계에
`app-user`만 두고 `api-admin`은 제거한다. `lab-api` audience mapper를 client에 직접 적용하며 API는 기존
RS256·고정 issuer·audience·expiration 검증 뒤 endpoint별 역할을 검사한다. 이 구성은 secret 기반
service account의 최소 예제이며 플랫폼 workload identity나 key rotation을 검증한 결과는 아니다.

## D24 데이터베이스 백업·복원 경계

Keycloak 영속 상태의 복구 원본은 PostgreSQL database로 둔다. D24는 실행 중인 DB에 custom-format
`pg_dump`를 수행하고, 같은 고정 PostgreSQL image의 network-none 일회성 container와 전용 volume에
`pg_restore --exit-on-error`로 복원한다. live PostgreSQL volume이나 Keycloak 연결 설정은 변경하지 않는다.

복원 판정은 archive에 `REALM` table data가 있고 source/restore의 realm·client·user 수가 같으며,
`study/app-a`, `study/d18-worker`, `d16-upstream/study-broker`가 복원 DB에 존재하는 조건이다. dump에는
credential 등 민감한 DB 상태가 포함될 수 있으므로 ignore된 `.state/verification/d24/`에 mode 0700으로
두고 추적·공유하지 않는다. 검증 뒤 임시 container와 volume은 제거한다. realm export는 구성 이관
보조물이며 이 DB 복구 검증을 대신하지 않는다.

## 공식 근거

- Keycloak: [26.7.3 release](https://github.com/keycloak/keycloak/releases/tag/26.7.3),
  [downloads](https://www.keycloak.org/downloads.html),
  [container](https://www.keycloak.org/server/containers),
  [supported configurations](https://www.keycloak.org/server/supported-configurations),
  [hostname](https://www.keycloak.org/server/hostname),
  [TLS](https://www.keycloak.org/server/enabletls),
  [production](https://www.keycloak.org/server/configuration-production),
  [truststore](https://www.keycloak.org/server/keycloak-truststore),
  [database](https://www.keycloak.org/server/db),
  [26.7 LDAP/AD](https://www.keycloak.org/docs/26.7.0/server_admin/#_ldap),
  [26.7.3 LDAP provider factory](https://github.com/keycloak/keycloak/blob/26.7.3/federation/ldap/src/main/java/org/keycloak/storage/ldap/LDAPStorageProviderFactory.java),
  [26.7.3 LDAP group mapper factory](https://github.com/keycloak/keycloak/blob/26.7.3/federation/ldap/src/main/java/org/keycloak/storage/ldap/mappers/membership/group/GroupLDAPStorageMapperFactory.java),
  [26.7.3 MSAD account control mapper](https://github.com/keycloak/keycloak/blob/26.7.3/federation/ldap/src/main/java/org/keycloak/storage/ldap/mappers/msad/MSADUserAccountControlStorageMapper.java),
  [26.7.3 OIDC group mapper](https://github.com/keycloak/keycloak/blob/26.7.3/services/src/main/java/org/keycloak/protocol/oidc/mappers/GroupMembershipMapper.java),
  [26.7.3 refresh validation](https://github.com/keycloak/keycloak/blob/26.7.3/services/src/main/java/org/keycloak/protocol/oidc/TokenManager.java),
  [Admin REST user cache clear](https://www.keycloak.org/docs-api/latest/rest-api/index.html#_post_adminrealmsrealmclear_user_cache),
  [26.7.3 user-storage Admin client paths](https://github.com/keycloak/keycloak/blob/26.7.3/js/libs/keycloak-admin-client/src/resources/userStorageProvider.ts)
- kind/Kubernetes: [kind v0.33.0 release](https://github.com/kubernetes-sigs/kind/releases/tag/v0.33.0),
  [kind quick start](https://kind.sigs.k8s.io/docs/user/quick-start/),
  [kind configuration](https://kind.sigs.k8s.io/docs/user/configuration/),
  [Kubernetes v1.35.8 release](https://github.com/kubernetes/kubernetes/releases/tag/v1.35.8),
  [NodePort](https://kubernetes.io/docs/concepts/services-networking/service/#type-nodeport)
- Ubuntu/Docker/Samba: [Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/),
  [Compose services·network alias·port·자원](https://docs.docker.com/reference/compose-file/services/),
  [Compose secrets](https://docs.docker.com/compose/how-tos/use-secrets/),
  [Compose named volumes](https://docs.docker.com/reference/compose-file/volumes/),
  [Compose down](https://docs.docker.com/reference/cli/docker/compose/down/),
  [image digests](https://docs.docker.com/engine/containers/run/#image-digests),
  [Ubuntu image](https://hub.docker.com/_/ubuntu),
  [Ubuntu snapshot service](https://snapshot.ubuntu.com/),
  [Ubuntu Samba AD DC](https://ubuntu.com/server/docs/how-to/samba/provision-samba-ad-controller/),
  [noble-updates Samba package](https://packages.ubuntu.com/noble-updates/samba),
  [Ubuntu xattr(7)](https://manpages.ubuntu.com/manpages/noble/man7/xattr.7.html),
  [Samba TLS parameters](https://www.samba.org/samba/docs/current/man-html/smb.conf.5.html)
- macOS runtime: [Colima](https://github.com/abiosoft/colima),
  [Docker Compose v5.5.1](https://github.com/docker/compose/releases/tag/v5.5.1)
- PostgreSQL/Node/app: [PostgreSQL 18.6 release](https://www.postgresql.org/docs/release/18.6/),
  [PostgreSQL official image](https://hub.docker.com/_/postgres),
  [Node release status](https://nodejs.org/en/about/previous-releases),
  [Node official image](https://hub.docker.com/_/node),
  [`openid-client`](https://github.com/panva/openid-client),
  [`openid-client` code flow example](https://github.com/panva/openid-client/blob/v6.8.8/examples/oauth.ts),
  [`jose` remote JWKS](https://github.com/panva/jose/blob/v6.2.12/docs/jwks/remote/functions/createRemoteJWKSet.md),
  [npm lockfile](https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json)
