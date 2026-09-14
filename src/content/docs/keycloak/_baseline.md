# keycloak 덱의 기준 시점과 서술 원칙

`keycloak` 덱의 버전·프로토콜 동작·운영 판단을 고치기 전에 읽는다. 다른 덱에는 해당하지 않는다.

## 이 덱의 축

덱 전체의 뼈대는 **"인증을 중앙화하고, 외부 계정과 권한이 앱의 허용 결정까지 어떻게
이어지는가"**다. 제품 메뉴를 차례로 소개하는 대신 다음 학습 흐름을 유지한다.

1. 로컬 사용자로 realm·client·OIDC 로그인과 Keycloak 세션을 먼저 이해한다.
2. 같은 realm의 앱 두 개가 Keycloak 로그인을 재사용하고, API가 access token을 검증해 인가한다.
3. Samba AD DC를 외부 사용자·그룹 원본으로 붙여 User Federation의 책임 경계를 확인한다.
4. LDAP mapper가 외부 그룹을 Keycloak 모델로, protocol mapper가 그룹·역할을 token claim으로
   옮기는 두 단계를 추적한다.
5. 기본 Compose 앱과 API가 claim을 읽어 자기 권한 모델로 바꾸고, 계정·그룹 변경과 장애의 영향이
   세션과 토큰의 수명에 따라 달라짐을 확인한다. oauth2-proxy·kube-apiserver는 후속 선택 경로다.

이 흐름을 마치면 독자는 Keycloak이 인증 시스템에서 맡는 자리, 로컬 사용자와 외부 디렉터리의
차이, OIDC 로그인과 최종 인가의 경계, 그룹이 API 권한이 되는 두 단계, 로그아웃·계정 변경·LDAP
장애가 새 로그인과 기존 접근에 미치는 차이를 설명하고 재현할 수 있어야 한다.

사용자 관리, 로그인 정책과 MFA, 앱 연결, 외부 디렉터리, 운영은 각각 다시 찾을 수 있는 문서로
나눈다. brokering과 service account는 격리된 보조 실습 결과를 재현 절차로 쓰고, SAML·oauth2-proxy·
Kubernetes OIDC는 Keycloak 전체에서의 자리와 선택 기준만 설명한다.

외부 계정·그룹 문제가 생기면 **원본 → federation → mapper → token → 소비자** 순서로 확인한다.
같은 이유로 로그아웃·권한 회수도 **Keycloak 세션**, **이미 발급된 token**, **앱 자체 세션**을
한 덩어리로 말하지 않는다.

## 컨테이너 실습의 기준과 경계

- 개인 macOS에서는 **Colima + Docker**, 회사 Ubuntu에서는 **Docker Engine**을 기본 runtime으로 쓴다.
  두 환경 모두 Keycloak·PostgreSQL·테스트 앱 A/B·API·Samba AD DC를 같은 runtime의 전용
  **Docker Compose project와 bridge**에 둔다. 기본 실습은 kind·kubectl을 요구하지 않는다.
- 실습은 로컬 계정 로그인 → 앱 A/B SSO → API의 401/403/200 → Samba 계정 로그인 → 외부 그룹의
  Keycloak·token·API 권한 반영 순서로 진행한다.
- 외부 디렉터리 본선은 LDAP/LDAPS User Federation이다. Kerberos/SPNEGO 데스크톱 SSO는 심화
  지도로 남기며 기본 재현 범위에 넣지 않는다.
- Samba는 **AD 호환 디렉터리 실습 대역**이다. 이 결과를 Microsoft AD DS나 Windows 도메인에서
  검증한 것으로 일반화하지 않는다.
- 별도 VM과 Windows Server는 요구하지 않는다. Samba를 Kubernetes Pod로 옮기거나 OpenLDAP으로
  바꾸는 것도 기본 구현이 아니다.
- 단일 Compose 환경은 학습·장애 관찰용이다. 이를 운영 HA 검증으로 서술하지 않으며, 운영 배포의
  hostname·TLS·Secret·DB·캐시·백업 경계는 별도로 설명한다.
- browser와 Compose container는 `https://keycloak.keycloak.test:30080/realms/study` 하나만 issuer로
  사용한다. host는 loopback publish와 hosts 항목, container는 Compose DNS alias와 Keycloak의 같은
  내부 TLS port `30080`으로 접근한다. 내부 전용 issuer나 TLS 검증 우회는 만들지 않는다.
- web HTTPS CA와 Samba LDAPS directory CA를 분리한다. 비밀번호·private key는 Git 제외 `.state`에서
  만들고 필요한 service에만 read-only Compose secret으로 mount한다. Samba 상태는
  `keycloak-lab-samba-data`, Keycloak 상태는 PostgreSQL 18의 `/var/lib/postgresql`에 mount한
  `keycloak-lab-postgres-data` named volume에 보존한다.
- 기본 runtime 계약은 4 logical CPU, RAM 8 GiB, 시작 직전 사용 가능 memory 5 GiB 이상, Docker data
  disk 여유 20 GiB 이상이다. service별 `cpus`·`mem_limit`과 실측값은
  `labs/keycloak/decisions.md`·`verification.md`에서 관리한다.
- 실습 명령과 설정의 원본은 `labs/keycloak/`에 둔다. 본문은 검증된 결과와 필요한 부분만 설명하고,
  사이트 검사 통과를 컨테이너 실습 성공으로 취급하지 않는다.

Samba 단독 P03, P04 kind-to-Samba 경로, Compose 기본 실습은 macOS/Colima에서 검증됐다. P11은 실제
Compose 전체 초기화 뒤 kind·kubectl 없이 로컬 SSO/API, Samba 로그인·그룹 매핑·refresh, 보존
중단·재개를 빈 상태에서 다시 재현했다. P04 파일과 당시 결과는 Kubernetes 후속 선택 실습용으로
보존하되 Compose 기본 실습의 선행 조건이나 검증 근거로 사용하지 않는다. macOS에서는 web CA trust 뒤
실제 Chrome의 Admin Console·Account Console과 앱 A Authorization Code + PKCE 로그인도 확인했다.
네이티브 Ubuntu는 **P03 플랫폼 검증부터 보류**다. macOS 결과를 Ubuntu나 Microsoft AD DS 결과로
일반화하지 않으며, 각 환경에서 실제로 재현한 범위와 예정된 명령을 구분한다.

## 다른 덱과의 경계

- 이 덱은 OAuth 2.0·OIDC를 Keycloak 운영에 필요한 깊이까지만 설명한다. 표준 전체나 범용 보안
  이론으로 넓히지 않는다.
- Samba AD DC의 사용자·그룹 seed와 LDAPS 연결은 이 덱의 실습 범위지만, Samba 자체 운영과
  Windows 도메인 관리는 다루지 않는다.
- 후속 쿠버네티스 연동에서는 **Keycloak client·claim mapping·kube-apiserver 인증**을 맡는다.
  일반 RBAC·인증서 발급은 [cka 덱](/cka/)으로 넘긴다.
- Keycloak의 Operator·hostname·캐시·세션·백업은 이 덱이 맡는다. PostgreSQL 자체의 설치·HA와
  온프렘 공통 제약은 [onprem 덱](/onprem/), 리눅스 운영은 [server 덱](/server/)으로 넘긴다.
- 앱 연동은 OIDC 네이티브·oauth2-proxy·직접 구현의 **선택 기준과 신뢰 경계**까지만 다룬다.
  프레임워크별 구현 예제로 늘리지 않는다.

경계에 걸친 내용을 고치면 링크된 덱에 같은 설명이 중복되어 자라지 않았는지 확인한다.

## 기준 시점과 확인한 사실

**2026년 8월**의 Keycloak 26.7 문서 계열 기준이다. 개념 기본값은 2026-08-12, 실습의 26.7.3 patch와
Compose 계약은 2026-09-14에 공식 출처로 확인했다. 버전이나 현재/과거 판단을 고칠 때는 표의 출처를
다시 조회한다.

| 항목 | 현재 기준 | 쓰면 안 되는 옛 기본값·과장 | 출처 |
|---|---|---|---|
| Keycloak Server | **26.7 문서 계열**, 실습 image **26.7.3**, Quarkus 배포판 | WildFly·`standalone.xml` 중심 설명 | `keycloak.org/docs/26.7.0/release_notes` · `github.com/keycloak/keycloak/releases/tag/26.7.3` |
| 기본 URL | `/realms/{realm}` — `/auth` 없음 | 모든 설치가 `/auth/realms/{realm}`라는 전제 | `keycloak.org/migration/migrating-to-quarkus` |
| Operator CR | `k8s.keycloak.org/v2beta1` | 현재 예제에 `v2alpha1` 사용 | `keycloak.org/operator/basic-deployment` |
| Realm Import CR | 새 realm **생성용**. 기존 realm을 update/delete하지 않음 | 선언을 계속 동기화하는 GitOps CR이라는 설명 | `keycloak.org/operator/realm-import` |
| 세션 저장 | 26부터 persistent user sessions가 기본 — DB 원본, 메모리 캐시 | 재시작·롤링 시 전원 로그아웃된다는 전제 | `keycloak.org/2024/12/storing-sessions-in-kc26` |
| 분산 캐시 discovery | 기본 `jdbc-ping` | 신규 구성에 `kubernetes` stack 권장 | `keycloak.org/server/caching` |
| Kubernetes | 레포 기준 **v1.35**. `AuthenticationConfiguration`은 **1.34에서 GA** | `--oidc-*` 플래그만 유일한 방식이라는 설명 | `v1-35.docs.kubernetes.io/.../authentication` · `cka/_baseline.md` |
| oauth2-proxy | **v7 문서 계열**. patch 번호는 고정하지 않음 | 헤더·로그아웃 플래그를 기억으로 단정 | `oauth2-proxy.github.io/oauth2-proxy/configuration` |

26.7의 멀티 클러스터 HA·SCIM처럼 preview인 기능은 **preview라고 붙이고 기본 설계처럼 권하지
않는다.** 다음 Keycloak minor를 기준으로 올릴 때는 release notes와 upgrading guide를 함께 본다.

## 반드시 유지할 구분

- **인증과 인가**: Keycloak은 신원을 증명하고 claim을 발급한다. 최종 허용은 앱이나 Kubernetes
  RBAC가 결정한다.
- **그룹과 역할**: AD 그룹을 Keycloak으로 가져오는 단계와, 그 값을 token claim에 싣는 protocol
  mapper 단계는 별개다. 둘을 한 번의 "그룹 매핑"으로 줄이지 않는다.
- **세션 종료와 JWT 회수**: 세션 종료는 새 발급·refresh를 막는다. 서명만 로컬 검증하는 소비자는
  이미 받은 JWT를 `exp`까지 받아들일 수 있다. not-before가 모든 OIDC 소비자에 즉시 전파된다고
  쓰지 않는다.
- **issuer와 접속 URL**: hostname이 token의 `iss`를 만든다. 외부·클러스터 내부 주소를 다르게
  설명할 때도 검증자가 보는 issuer는 정확히 하나여야 한다.
- **public client와 confidential client**: kubectl 같은 네이티브 도구는 secret을 숨길 수 없으므로
  public client + Authorization Code + PKCE다. 서버 측 앱·oauth2-proxy는 confidential client다.
- **Keycloak 로그아웃과 앱 로그아웃**: RP-initiated logout, backchannel logout, oauth2-proxy 쿠키,
  앱 자체 세션을 각각 구분한다.

## 서술·검증 규칙

번호를 제거하기 전 00~12 URL과 주요 heading bookmark는
`src/data/keycloak-legacy-routes.json` 및 `src/pages/keycloak/[legacy].astro`에서 새 질문 중심 페이지로
보낸다. 새 페이지를 분할·이름 변경할 때 이 호환 map의 target과 anchor도 함께 확인한다.

- 학습 본문 첫머리의 `<TermIntro>`와 장 끝 요약을 유지한다.
- 콘솔 메뉴 이름만 나열하지 말고 **없으면 생기는 문제 → 동작 원리 → 설정 → 점검** 순서로 쓴다.
- URL은 가능하면 고정 endpoint를 외우게 하지 말고 realm discovery 문서에서 확인하도록 안내한다.
- 버전·기본값·deprecated·preview·보안 경계 주장은 공식 Keycloak·Kubernetes·표준 문서를 붙인다.
- 설정 예시는 production 전제를 흐리지 않는다. `start-dev`, H2, 넓은 redirect URI, 전달 헤더
  무조건 신뢰를 운영 권장처럼 쓰지 않는다.
- 한 장을 고치면 [용어집](/keycloak/glossary/)과 [마무리](/keycloak/wrapup/)의 요약도
  어긋나지 않는지 확인한다.
