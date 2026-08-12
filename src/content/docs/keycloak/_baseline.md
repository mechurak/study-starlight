# keycloak 덱의 기준 시점과 서술 원칙

`keycloak` 덱의 버전·프로토콜 동작·운영 판단을 고치기 전에 읽는다. 다른 덱에는 해당하지 않는다.

## 이 덱의 축

덱 전체의 뼈대는 **"인증을 중앙화하고, 각 소비자가 그 결과를 어디까지 신뢰하는가"**다.
제품 메뉴를 차례로 소개하는 대신 다음 흐름을 유지한다.

1. AD가 사용자·그룹의 원본이다.
2. Keycloak이 로그인·세션을 맡고 OIDC 토큰을 발급한다.
3. protocol mapper가 그룹·역할을 token claim으로 옮긴다.
4. 앱·oauth2-proxy·kube-apiserver가 claim을 읽어 자기 권한 모델로 바꾼다.

문제가 생기면 이 흐름을 **원본 → federation → mapper → token → 소비자** 순서로 확인한다.
같은 이유로 로그아웃·권한 회수도 **Keycloak 세션**, **이미 발급된 token**, **앱 자체 세션**을
한 덩어리로 말하지 않는다.

## 다른 덱과의 경계

- 이 덱은 OAuth 2.0·OIDC를 Keycloak 운영에 필요한 깊이까지만 설명한다. 표준 전체나 범용 보안
  이론으로 넓히지 않는다.
- 쿠버네티스 연동에서는 **Keycloak client·claim mapping·kube-apiserver 인증**을 맡는다.
  일반 RBAC·인증서 발급은 [cka 덱](/cka/)으로 넘긴다.
- Keycloak의 Operator·hostname·캐시·세션·백업은 이 덱이 맡는다. PostgreSQL 자체의 설치·HA와
  온프렘 공통 제약은 [onprem 덱](/onprem/), 리눅스 운영은 [server 덱](/server/)으로 넘긴다.
- 앱 연동은 OIDC 네이티브·oauth2-proxy·직접 구현의 **선택 기준과 신뢰 경계**까지만 다룬다.
  프레임워크별 구현 예제로 늘리지 않는다.

경계에 걸친 내용을 고치면 링크된 덱에 같은 설명이 중복되어 자라지 않았는지 확인한다.

## 기준 시점과 확인한 사실

**2026년 8월** 기준이다. 아래는 2026-08-12에 공식 출처로 확인했다.
버전이나 현재/과거 판단을 고칠 때는 표의 출처를 다시 조회한다.

| 항목 | 현재 기준 | 쓰면 안 되는 옛 기본값·과장 | 출처 |
|---|---|---|---|
| Keycloak Server | **26.7.0**, Quarkus 배포판 | WildFly·`standalone.xml` 중심 설명 | `keycloak.org/docs/26.7.0/release_notes` · 다운로드 페이지 |
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

- 학습 본문 첫머리의 `<TermIntro>`와 장 끝 요약을 유지한다.
- 콘솔 메뉴 이름만 나열하지 말고 **없으면 생기는 문제 → 동작 원리 → 설정 → 점검** 순서로 쓴다.
- URL은 가능하면 고정 endpoint를 외우게 하지 말고 realm discovery 문서에서 확인하도록 안내한다.
- 버전·기본값·deprecated·preview·보안 경계 주장은 공식 Keycloak·Kubernetes·표준 문서를 붙인다.
- 설정 예시는 production 전제를 흐리지 않는다. `start-dev`, H2, 넓은 redirect URI, 전달 헤더
  무조건 신뢰를 운영 권장처럼 쓰지 않는다.
- 한 장을 고치면 [용어집](/keycloak/11-glossary/)과 [마무리](/keycloak/12-wrapup/)의 요약도
  어긋나지 않는지 확인한다.
