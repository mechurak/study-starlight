# Keycloak 실습 환경 결정

확인일: **2026-09-14**

이 문서는 P03 이후 구현이 임의로 바꾸지 않을 실습 환경 계약이다. 아직 컨테이너를 만들거나
실행하지 않았으며, 아래의 가용성 확인은 원격 공식 배포처에 한정된다. 실제 기동 결과와 자원 실측은
`labs/keycloak/verification.md`에 별도로 남긴다.

## 지원 범위

- 실행 호스트는 **64-bit Ubuntu 24.04 LTS + rootful Docker Engine**이다. Ubuntu 파생 배포판,
  rootless Docker, Docker Desktop, macOS, Windows/WSL은 기본 지원 범위가 아니다.
- CPU 아키텍처는 **linux/amd64**와 **linux/arm64**만 지원한다. 한 환경의 모든 이미지와 kind node는
  호스트와 같은 아키텍처를 사용하며 에뮬레이션은 지원 경로로 두지 않는다.
- 클러스터 이름은 `keycloak-lab`, kubectl context는 `kind-keycloak-lab`, Kubernetes namespace는
  `keycloak-lab`로 고정한다. 기존 cluster와 current context를 재사용하지 않는다.
- Docker의 Ubuntu 설치 문서는 Ubuntu 24.04와 amd64/arm64를 지원한다. kind v0.33.0 릴리스도 node
  이미지의 amd64/arm64 지원과 호스트와 같은 플랫폼 사용을 명시한다.
- Keycloak의 비 OpenShift Kubernetes 지원은 best-effort다. 이 kind 환경은 학습·장애 관찰용이며
  Keycloak의 운영 지원 또는 HA를 검증하는 환경이 아니다.

호스트 도구는 다음 버전을 P11의 재현 기준으로 삼는다. Ubuntu 설치 자체를 이 디렉터리에서 자동화하지
않으며, 실제 설치 버전은 P11 시작 때 다시 기록한다.

| 도구 | 고정 버전 | 선택 이유 |
|---|---|---|
| Ubuntu | 24.04 LTS, 최신 보안 업데이트 적용 | Ubuntu의 AD DC 절과 Docker Engine이 함께 지원하는 LTS |
| Docker Engine / CLI | `29.8.0` (`5:29.8.0-1~ubuntu.24.04~noble`) | 2026-09-14 Docker 공식 stable apt 저장소에서 amd64/arm64 모두 확인 |
| containerd.io | `2.3.5-1~ubuntu.24.04~noble` | 위 Docker 패키지와 같은 공식 저장소의 현재 묶음 |
| Docker Compose plugin | `5.5.1-1~ubuntu.24.04~noble` | P03의 Compose 실행 기준 |
| kind | `v0.33.0` | 현재 stable tagged release |
| kubectl | `v1.35.8` | cluster patch와 일치시켜 version skew 변수를 없앰 |
| Kubernetes node | `v1.35.8` | 저장소의 Kubernetes v1.35 학습 기준을 유지하면서 kind v0.33.0이 제공하는 최신 1.35 patch 사용 |

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
  P03에서 추가 capability가 실제로 필요하면 실패 근거와 최소 capability를 이 문서에 먼저 반영한다.
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
| kind control plane의 bridge 주소 | `172.30.0.20` | P04에서 node container를 전용 bridge에 연결. 기존 주소 충돌 시 중단 |
| AD realm / NetBIOS / base DN | `AD.KEYCLOAK.TEST` / `KEYCLOAK` / `DC=ad,DC=keycloak,DC=test` | Samba와 LDAP Federation 공통 |
| Keycloak realm | `study` | `master`는 bootstrap/admin 전용 |
| 공개 issuer | `https://keycloak.keycloak.test:30080/realms/study` | browser와 Pod가 반드시 같은 문자열 사용 |
| 앱 A | `https://app-a.keycloak.test:30081`, callback `/callback` | host loopback에만 publish |
| 앱 B | `https://app-b.keycloak.test:30082`, callback `/callback` | host loopback에만 publish |
| API | service `lab-api.keycloak-lab.svc.cluster.local:3000`, audience `lab-api` | ClusterIP만, browser에는 직접 노출하지 않음 |
| LDAP | `ldap://dc1.ad.keycloak.test:389` | bridge 내부 진단 전용. 완성 Federation에는 사용하지 않음 |
| LDAPS | `ldaps://dc1.ad.keycloak.test:636` | Keycloak Federation의 유일한 완성 경로 |
| PostgreSQL | service `postgres.keycloak-lab.svc.cluster.local:5432` | ClusterIP만 |

`kind.yaml`은 control-plane의 container port `30080`~`30082`를 같은 host port로 매핑하고
`listenAddress: 127.0.0.1`로 제한한다. Kubernetes Service도 같은 번호를 명시적 NodePort로 쓴다.
세 번호는 기본 NodePort 범위의 정적 할당 band(`30000`~`30085`) 안에 있다. ingress controller나
host-wide reverse proxy를 추가하지 않는다.

Ubuntu host의 `/etc/hosts`에는 세 웹 이름을 `127.0.0.1`로 연결한다. 전용 cluster의 CoreDNS에는
세 웹 이름을 `172.30.0.20`, DC 이름을 `172.30.0.10`으로 연결한다. 그 결과 browser와 Pod는 같은
Keycloak URL과 issuer를 사용하고, Pod의 token/discovery/JWKS 요청은 node의 NodePort로 돌아온다.
Docker container 이름이 Pod DNS에서 자동으로 해석된다고 가정하지 않는다. P04는 DNS, route,
NodePort hairpin, LDAPS를 각각 검증해야 한다.

`KC_HOSTNAME`은 공개 issuer의 base인 `https://keycloak.keycloak.test:30080` 전체 URL로 고정하고
`hostname-backchannel-dynamic`과 `hostname-strict=false`는 사용하지 않는다. `KC_HOSTNAME`은 listener
port를 바꾸지 않으므로 Keycloak Pod는 TLS `8443`, Service는 `8443`을 NodePort `30080`으로 전달한다.

## HTTPS와 LDAPS 신뢰

HTTPS와 LDAPS를 같은 스위치로 취급하지 않는다. 로컬 초기화 때 서로 다른 두 root CA를 만들고,
정상적인 중단·재시작이나 Pod/container 재생성에서는 다시 만들지 않는다.

| CA | leaf | 신뢰시키는 대상 |
|---|---|---|
| `keycloak-lab-web-ca` | `keycloak.keycloak.test`, `app-a.keycloak.test`, `app-b.keycloak.test` 각각의 server certificate | Ubuntu host browser/CLI와 앱 A/B의 Node runtime |
| `keycloak-lab-directory-ca` | SAN `DNS:dc1.ad.keycloak.test`, EKU `serverAuth` | Keycloak truststore와 LDAPS 진단 client |

- root CA 유효기간은 3650일, server leaf는 365일로 고정한다. 시작·검증 스크립트는 만료와 SAN을
  확인하며, 만료가 가까워도 묵시적으로 재발급하지 않는다.
- CA private key, leaf private key, bootstrap password, client secret은
  `labs/keycloak/.state/` 아래 로컬 산출물로 만들고 Git에서 제외한다. directory는 mode `0700`,
  private key와 secret 파일은 `0600`으로 둔다. 공개 CA certificate만 ConfigMap/host trust에 복사하고
  private key는 ConfigMap이나 이미지 layer에 넣지 않는다.
- Keycloak의 HTTPS leaf/key는 Kubernetes Secret으로 mount하고 Keycloak이 직접 TLS를 종료한다.
  앱 A/B도 각 HTTPS Secret을 사용한다. `curl -k`, browser 경고 무시, TLS 검증 비활성화는 성공
  판정에 사용하지 않는다.
- Keycloak에는 directory CA certificate를 별도 truststore path로 mount한다. Samba는 `tls certfile`,
  `tls keyfile`, `tls cafile`에 명시적 파일을 사용한다. 기본 자동 생성 self-signed certificate에
  의존하지 않는다.

## 데이터와 볼륨 수명

| 상태 | 저장 위치 | Pod/container 재생성 | kind cluster 삭제 | 명시적 전체 초기화 |
|---|---|---|---|---|
| Samba domain DB·SYSVOL | Docker named volume `keycloak-lab-samba-data` → `/var/lib/samba` | 유지 | 유지 | 삭제 |
| Samba 설정 | image/template에서 생성, domain 생성 후 volume 상태와 일치 여부 확인 | 재생성 | 영향 없음 | 재생성 |
| PostgreSQL / Keycloak 상태 | PVC `keycloak-postgres-data` | 유지 | 삭제 | 삭제 |
| 앱 A/B session | Pod memory | 삭제 | 삭제 | 삭제 |
| CA·leaf·로컬 secret 원본 | `labs/keycloak/.state/` | 유지 | 유지 | 삭제 |
| Kubernetes Secret/ConfigMap | 전용 namespace | 유지 | 삭제 | 삭제 |

일시 중단은 Docker Engine 또는 실습 container를 멈출 뿐 volume과 `.state`를 지우지 않는다.
`docker compose down`은 `--volumes` 없이 사용한다. 전체 초기화만 cluster, 위 이름의 Samba volume,
전용 network, `.state`를 삭제하며, 실행 전에 정확한 대상 목록을 출력한다. `docker system prune`,
`kind delete clusters --all`, 이름 없는 volume 일괄 삭제는 사용하지 않는다.

Samba의 핵심 상태는 `/var/lib/samba`에 유지하고 `/var/cache/samba`와 log는 재생성 가능 상태로 본다.
P03은 container 재생성 뒤 domain SID와 seed 사용자·그룹이 같은지 확인해 이 경계가 충분한지 검증한다.
부족하면 새 volume을 추가하기 전에 실제 변경 파일을 확인해 이 표를 고친다.

## 테스트 앱과 API

앱 A와 B는 **하나의 Node.js/Express 소스 이미지**를 서로 다른 confidential client 설정으로 두 번
배포한다. UI framework나 Keycloak 전용 adapter를 추가하지 않는다.

| 의존성 | 고정 버전 | 책임 |
|---|---|---|
| Node.js | `24.21.0` LTS | Web Crypto와 fetch를 제공하는 runtime |
| `openid-client` | `6.8.8` | discovery, Authorization Code callback, PKCE S256, state·nonce 검증, token 요청 |
| `express` | `5.2.1` | 앱 A/B와 작은 API의 HTTP routing |
| `express-session` | `1.19.0` | code verifier/state/nonce와 앱 session. 단일 Pod memory store는 실습 전용 |
| `jose` | `6.2.12` | API의 고정 discovery `jwks_uri` 기반 서명과 `iss`, `aud`, `exp` 검증 |

P06은 매 로그인마다 `openid-client`로 PKCE verifier/challenge, state, nonce를 생성해 server-side session에
보관하고 callback에서 모두 검증한다. 앱이 protocol parameter나 JWT signature를 직접 구현하지 않는다.
P07 API는 신뢰한 issuer의 discovery/JWKS만 사용하고 access token의 허용 algorithm도 고정한다.
`jku` 같은 token header가 임의 JWKS 위치를 선택하게 하지 않는다. 무토큰 401, 유효하지만 권한 부족
403, 허용 200을 구분한다.

`package.json`은 exact version을 쓰고 `package-lock.json`을 추적하며 image build는 `npm ci`를 사용한다.
두 앱의 session과 secret은 서로 분리한다. memory session store는 재시작 때 로그인 상태가 사라지는 것을
의도한 단일 Pod 실습 선택이며 운영 권장으로 서술하지 않는다.

## 자원 예산

아래 값은 **P02 설계 추정치**이며 실측이 아니다. 호스트 권장은 4 logical CPU, RAM 8 GiB,
사용 가능 disk 20 GiB다. Keycloak 공식 sizing의 base memory 1250 MB와 container memory limit의 70%를
heap으로 쓰는 동작을 하한 근거로 삼되, 공식 수치는 대규모 운영 sizing 출발점이지 이 실습의 측정값이
아니다.

| 구성요소 | request 또는 예상 하한 | limit 또는 예산 | 구분 |
|---|---:|---:|---|
| Keycloak 1 Pod | CPU `500m`, memory `1250Mi` | CPU `1500m`, memory `2Gi` | 공식 memory 하한을 반영한 실습 설정안, 미실측 |
| PostgreSQL 1 Pod | CPU `100m`, memory `256Mi` | CPU `500m`, memory `512Mi` | 소량 realm/session용 추정, 미실측 |
| 앱 A/B/API 각 1 Pod | CPU `50m`, memory `64Mi` | CPU `250m`, memory `256Mi` | 최소 Node 앱 추정, 미실측 |
| Samba container | CPU 약 `100m`, memory 약 `256Mi` idle 예상 | CPU 1, memory `1Gi` 예산 | 추정, 미실측 |
| kind control plane·system Pod | CPU `0.5`~`1`, memory `0.8`~`1.5Gi` 예상 | 별도 container limit 없음 | 추정, 미실측 |

P11에서는 amd64 또는 arm64 Ubuntu 호스트를 명시하고 idle 안정화 뒤와 로그인/refresh/LDAP sync 시나리오
중에 `docker stats --no-stream`, Pod별 CPU·memory, image/volume disk 사용량을 기록한다. metrics-server가
실제로 설치된 경우에만 `kubectl top` 결과를 쓴다. 이 표의 추정치와 관찰값을 나란히 남기며, 한
아키텍처의 결과를 다른 아키텍처 실측으로 일반화하지 않는다.

## 2026-09-14 가용성 확인

아래 확인은 원격 배포물의 존재와 metadata를 확인한 것이다. image pull/build, Ubuntu container 실행,
Samba provision, Keycloak 로그인은 실행하지 않았다.

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
  `express@5.2.1`, `express-session@1.19.0` 각각 확인했다. 실제 dependency tree는 P06에서 생성하는
  lockfile이 고정한다.

digest와 platform을 조회한 정확한 metadata endpoint는
[Keycloak Quay manifest](https://quay.io/v2/keycloak/keycloak/manifests/26.7.3),
[PostgreSQL tag](https://hub.docker.com/v2/repositories/library/postgres/tags/18.6-bookworm),
[kind node tag](https://hub.docker.com/v2/repositories/kindest/node/tags/v1.35.8),
[Ubuntu tag](https://hub.docker.com/v2/repositories/library/ubuntu/tags/24.04),
[Node tag](https://hub.docker.com/v2/repositories/library/node/tags/24.21.0-bookworm-slim)이다.

## 공식 근거

- Keycloak: [26.7.3 release](https://github.com/keycloak/keycloak/releases/tag/26.7.3),
  [downloads](https://www.keycloak.org/downloads.html),
  [container](https://www.keycloak.org/server/containers),
  [supported configurations](https://www.keycloak.org/server/supported-configurations),
  [hostname](https://www.keycloak.org/server/hostname),
  [production](https://www.keycloak.org/server/configuration-production),
  [truststore](https://www.keycloak.org/server/keycloak-truststore),
  [LDAP/AD](https://www.keycloak.org/docs/latest/server_admin/#_ldap)
- kind/Kubernetes: [kind v0.33.0 release](https://github.com/kubernetes-sigs/kind/releases/tag/v0.33.0),
  [kind quick start](https://kind.sigs.k8s.io/docs/user/quick-start/),
  [kind configuration](https://kind.sigs.k8s.io/docs/user/configuration/),
  [Kubernetes v1.35.8 release](https://github.com/kubernetes/kubernetes/releases/tag/v1.35.8),
  [NodePort](https://kubernetes.io/docs/concepts/services-networking/service/#type-nodeport)
- Ubuntu/Docker/Samba: [Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/),
  [image digests](https://docs.docker.com/engine/containers/run/#image-digests),
  [Ubuntu image](https://hub.docker.com/_/ubuntu),
  [Ubuntu snapshot service](https://snapshot.ubuntu.com/),
  [Ubuntu Samba AD DC](https://ubuntu.com/server/docs/how-to/samba/provision-samba-ad-controller/),
  [noble-updates Samba package](https://packages.ubuntu.com/noble-updates/samba),
  [Samba TLS parameters](https://www.samba.org/samba/docs/current/man-html/smb.conf.5.html)
- PostgreSQL/Node/app: [PostgreSQL 18.6 release](https://www.postgresql.org/docs/release/18.6/),
  [PostgreSQL official image](https://hub.docker.com/_/postgres),
  [Node release status](https://nodejs.org/en/about/previous-releases),
  [Node official image](https://hub.docker.com/_/node),
  [`openid-client`](https://github.com/panva/openid-client),
  [`openid-client` code flow example](https://github.com/panva/openid-client/blob/v6.8.8/examples/oauth.ts),
  [`jose` remote JWKS](https://github.com/panva/jose/blob/v6.2.12/docs/jwks/remote/functions/createRemoteJWKSet.md),
  [npm lockfile](https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json)
