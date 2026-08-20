# Paseo 사내 카탈로그 덱의 기준

`paseo-enterprise` 덱을 고치기 전에 읽는다. 다른 덱에는 해당하지 않는다.

## 이 덱의 축

첫 번째 축은 **"Paseo 플러그인은 개인 PC의 프런트엔드, 사내 백엔드는 권한의 정본"**이다.

- Paseo client surface: 카탈로그 탐색과 사용자 동작
- Paseo daemon-side plugin handler: OIDC 토큰과 사내 API 호출을 맡는 로컬 BFF
- Keycloak: AD 사용자를 인증하고 access token을 발급
- oauth2-proxy: 브라우저 cookie와 API Bearer token을 검증하는 앞단
- Catalog API: 개인·부서·직무별 entitlement를 계산하고 허용된 항목만 반환

두 번째 축은 **"발견·설치 권한과 실행 권한은 다르다"**다. 카탈로그에서 항목을 숨기는 것만으로
이미 내려받은 파일이나 도구의 접근을 회수할 수 없다. 민감한 tool과 dashboard backend는 실제
요청마다 다시 사용자를 인증·인가한다.

## 기준 환경

이 덱은 다음 실제 도입 시나리오에 맞춘다.

- 임직원은 각자 PC에 설치된 Paseo와 개인 daemon을 사용
- 회사가 배포한 하나의 신뢰된 Paseo plugin이 사내 카탈로그 화면을 제공
- Catalog API는 사내 온프렘 Kubernetes에 배포
- Catalog API 앞에는 oauth2-proxy가 있고 Keycloak OIDC 로그인을 강제
- Keycloak은 AD와 federation되어 사용자·그룹·부서 정보를 제공
- 카탈로그 항목은 skill, dashboard, prompt, tool 네 종류
- 브라우저 사용자는 기존 oauth2-proxy cookie flow를 계속 사용
- Paseo plugin은 별도 public client의 Device Authorization Grant로 로그인하고 Bearer token으로 API 호출

## 고정한 설계 결정

- Keycloak client는 `catalog-web`과 `paseo-catalog`으로 분리한다.
- `catalog-web`은 oauth2-proxy용 confidential client이며 callback은 사내 HTTPS 주소다.
- `paseo-catalog`은 client secret이 없는 public client다.
- Paseo의 기본 로그인은 Device Authorization Grant다. 이 흐름에는 localhost callback이 없다.
- Authorization Code + PKCE는 대안으로만 다루며, 이때만 `http://127.0.0.1` loopback redirect를 쓴다.
- oauth2-proxy는 cookie와 검증된 JWT Bearer token을 모두 받을 수 있게 구성한다.
- 최종 항목별 인가는 Catalog API가 `sub`와 entitlement로 수행한다.
- PC의 plugin과 전달 헤더는 단독 보안 경계로 신뢰하지 않는다.
- oauth2-proxy용 client secret은 PC에 배포하지 않는다.

## 범위 경계

- **다룬다:** Paseo plugin surface·RPC·attachment source·SDK, Keycloak Device Flow,
  oauth2-proxy Bearer 검증, audience·claim, Catalog API 계약, artifact 설치, 운영·회수.
- **깊게 다루지 않는다:** Keycloak/AD 최초 구축, oauth2-proxy Helm 설치 전체,
  Paseo daemon 프로토콜 구현, 각 coding agent의 skill 포맷 전체, 범용 사내 포털 개발.
- Keycloak 자체 개념과 AD federation은 `/keycloak/` 덱을 정본으로 둔다.

## 기준 시점과 공식 원문

**2026년 8월 21일** 기준으로 다음 공식 문서를 확인했다. Paseo plugin API와 oauth2-proxy 옵션은
빠르게 바뀔 수 있으므로 예제를 실제 배포에 옮길 때 사용 중인 버전 문서를 다시 확인한다.

| 영역 | 기준으로 삼은 사실 | 공식 출처 |
|---|---|---|
| Paseo plugin | React Native surface, sidebar item, schema 검증 RPC, attachment source 제공 | `paseo.sh/docs/plugins/reference` |
| plugin trust | client contribution은 Paseo app, backend contribution은 daemon 옆의 unsandboxed subprocess에서 실행 | Paseo Plugin reference |
| Paseo SDK | workspace·agent·provider·config API, agent별 `mcpServers`와 `toolPolicy` 지원 | Paseo SDK reference · Providers with the SDK |
| Keycloak | Device Authorization Grant와 native app의 `http://127.0.0.1` loopback redirect 지원 | Keycloak Server Administration · Securing applications |
| oauth2-proxy | Keycloak OIDC, `skip-jwt-bearer-tokens`, audience·group·role 검증 옵션 제공 | OAuth2 Proxy Keycloak OIDC · Configuration overview |

## 서술 규칙

- `callback`이라고 뭉뚱그리지 않고 **oauth2-proxy HTTPS callback**, **Device Flow verification**,
  **PKCE loopback redirect**를 구분한다.
- 인증(authentication)과 인가(authorization)를 같은 뜻으로 쓰지 않는다.
- 브라우저 cookie flow와 Paseo Bearer flow를 항상 함께 보여 준다.
- `X-Forwarded-*` 헤더를 사용할 때는 직접 접근 차단과 입력 헤더 제거 조건을 같이 적는다.
- 설정 예시는 출발점으로 표시하고, 배포 중인 제품 버전의 옵션 이름을 확인하도록 안내한다.
- local skill 파일의 삭제를 권한 회수로 설명하지 않는다. 민감한 실행 경로의 서버 측 재인가를 강조한다.
