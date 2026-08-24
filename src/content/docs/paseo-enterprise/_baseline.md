# Paseo 사내 카탈로그 덱의 기준

`paseo-enterprise` 덱을 고치기 전에 읽는다. 다른 덱에는 해당하지 않는다.

## 이 덱의 축

첫 번째 축은 **"배포 단위는 회사가 빌드한 Paseo 사내 빌드 하나, 권한의 정본은 사내 백엔드"**다.

- Paseo 사내 빌드: upstream Paseo에 최소 패치를 얹어 회사가 빌드·서명한 데스크톱 앱.
  인스톨러 하나에 데몬·앱·동봉 plugin·사내 CA·프록시 기본값이 들어간다
- 동봉 plugin: 카탈로그 surface와 daemon-side handler를 제공하는, 빌드에 포함된 회사 코드
- Keycloak: AD 사용자를 인증하고 access token을 발급
- oauth2-proxy: 브라우저 cookie와 API Bearer token을 검증하는 앞단
- Catalog API: 개인·부서·직무별 entitlement를 계산하고 허용된 항목만 반환

두 번째 축은 **"발견·설치 권한과 실행 권한은 다르다"**다. 카탈로그에서 항목을 숨기는 것만으로
이미 내려받은 파일이나 도구의 접근을 회수할 수 없다. 민감한 tool과 dashboard backend는 실제
요청마다 다시 사용자를 인증·인가한다.

세 번째 축은 **"포크가 아니라 upstream 릴리스 태그 위의 최소 패치 세트"**다. config로 끌 수
있는 것은 config로 끄고, 소스 패치는 물리적으로 제거해야 하는 표면에만 쓴다. 패치가 얇을수록
upstream 추적 비용이 줄어든다.

## 이 방향을 고른 이유 (2026-08-24 결정)

처음에는 upstream Paseo를 그대로 쓰고 회사 plugin을 별도 배포하는 구조였다. 다음 이유로
사내 빌드로 전환했다.

- Paseo plugin은 공식적으로 experimental이며 "not designed for distribution yet"이다
  (Plugin quickstart). 설치가 로컬 경로 + `npm install` 기반이라 비개발자에게
  Paseo·Node·사내 npm registry·plugin 설치를 각각 안내해야 했다
- 보안 환경(사내 프록시·사설 CA)의 세팅을 사용자에게 맡길 수 없다 — 인스톨러에 굽는다
- 원격 접속·모바일 페어링·relay는 지원하지 않기로 했다 — 사내 빌드에서 제거·비활성한다

## 기준 환경

이 덱은 다음 실제 도입 시나리오에 맞춘다.

- 임직원은 회사가 MDM·Software Center로 배포한 **Paseo 사내 빌드 인스톨러 하나**만 설치한다.
  사용자 PC에 Node·npm·사내 npm registry 세팅을 요구하지 않는다
- 카탈로그 화면은 사내 빌드에 동봉된 plugin이 제공하며 기본 활성화되어 있다.
  그 외 plugin의 로드는 차단된다
- agent CLI(Claude Code·Codex 등)는 인스톨러가 설치하고, 로그인은 관리 설정
  (Claude Code managed settings, Codex `config.toml`)으로 회사 조직·workspace SSO에 고정한다.
  사용자에게 남는 것은 브라우저 AD SSO 인증 한 번이고, 문서는 예외 상황 FAQ만 맡는다
- 비개발자에게 폴더를 고르게 하지 않는다 — 인스톨러가 기본 project 폴더를 등록하고,
  동봉 plugin이 작업 단위 workspace를 자동 생성한다. 기본 홈·사이드바까지 갈아엎는 요구는
  코어 패치 전환 기준의 발동 사례로 다룬다
- 사내 CA 신뢰, 프록시 기본값, Catalog API 주소, Keycloak client 설정은 빌드·인스톨러가 프로비저닝한다
- relay 페어링·모바일 접속·원격 데몬 접속·bundled web UI는 config로 끄고, 페어링 UI 표면은 패치로 제거한다
- Catalog API는 사내 온프렘 Kubernetes에 배포
- Catalog API 앞에는 oauth2-proxy가 있고 Keycloak OIDC 로그인을 강제
- Keycloak은 AD와 federation되어 사용자·그룹·부서 정보를 제공
- 카탈로그 항목은 skill, dashboard, prompt, tool 네 종류이며 artifact는 npm이 아니라
  **Catalog API가 직접 전달**한다
- 브라우저 사용자는 기존 oauth2-proxy cookie flow를 계속 사용
- 동봉 plugin은 별도 public client의 Device Authorization Grant로 로그인하고 Bearer token으로 API 호출

## 고정한 설계 결정

- **Paseo는 AGPLv3다.** 수정·사내 배포는 사내 OSS 컴플라이언스 검토를 선결 조건으로 하고,
  배포 범위는 같은 법인 임직원 PC로 한정한다. 계열사·협력사 확대는 별도 재검토 사항이다
- upstream **릴리스 태그에 버전을 고정**하고, 회사 변경은 그 위의 패치 세트로 관리한다.
  upstream 자동 업데이트 대신 사내 업데이트 채널을 운영한다
- 카탈로그 구현은 **동봉 plugin이 기본**이다. plugin API를 쓰면 코어 패치가 얇아진다.
  코어 직접 통합은 surface 범위를 넘는 요구(첫 화면 교체, 로그인 전 앱 잠금, 기본 UI 대규모
  제거)가 생긴 부분에만 쓴다
- **동봉 plugin 외의 plugin 로드는 allowlist 패치로 차단한다.** config의 전역 plugin 스위치는
  동봉 plugin까지 함께 꺼서 이 용도로 못 쓴다
- Keycloak client는 `catalog-web`과 `paseo-catalog`으로 분리한다.
- `catalog-web`은 oauth2-proxy용 confidential client이며 callback은 사내 HTTPS 주소다.
- `paseo-catalog`은 client secret이 없는 public client다.
- 기본 로그인은 Device Authorization Grant다. 이 흐름에는 localhost callback이 없다.
- Authorization Code + PKCE는 대안으로만 다루며, 이때만 `http://127.0.0.1` loopback redirect를 쓴다.
- oauth2-proxy는 cookie와 검증된 JWT Bearer token을 모두 받을 수 있게 구성한다.
- 최종 항목별 인가는 Catalog API가 `sub`와 entitlement로 수행한다.
- PC의 사내 빌드와 전달 헤더는 단독 보안 경계로 신뢰하지 않는다.
- oauth2-proxy용 client secret은 PC에 배포하지 않는다.

## 범위 경계

- **다룬다:** 사내 빌드의 패치·config 경계, 동봉 plugin surface·RPC·attachment source·SDK,
  Keycloak Device Flow, oauth2-proxy Bearer 검증, audience·claim, Catalog API 계약,
  artifact 설치, 빌드 파이프라인·업데이트 채널·운영·회수.
- **깊게 다루지 않는다:** Keycloak/AD 최초 구축, oauth2-proxy Helm 설치 전체,
  Paseo daemon 프로토콜 내부 구현, 각 coding agent의 skill 포맷 전체, 범용 사내 포털 개발,
  AGPL 법률 해석 자체(검토 주체는 사내 컴플라이언스).
- Keycloak 자체 개념과 AD federation은 `/keycloak/` 덱을 정본으로 둔다.

## 기준 시점과 공식 원문

**2026년 8월 24일** 기준으로 다음을 확인했다. Paseo는 빠르게 바뀌므로 upstream 버전을 올릴 때
사용 중인 태그의 문서·config schema를 다시 확인한다.

| 영역 | 기준으로 삼은 사실 | 공식 출처 |
|---|---|---|
| Paseo 라이선스 | AGPLv3 (서드파티 컴포넌트는 각자 라이선스) | `github.com/getpaseo/paseo` LICENSE |
| Paseo 구조 | 데스크톱 앱이 데몬을 번들해 별도 설치 없이 실행. monorepo `packages/`에 app·cli·client·desktop·plugin·protocol·relay·server 분리 | Paseo README · GitHub repo |
| plugin 배포 상태 | experimental, "not designed for distribution yet", 로컬 경로 + `npm install` 설치 | `paseo.sh/docs/plugins` |
| plugin trust | client contribution은 Paseo app, backend contribution은 daemon 옆의 unsandboxed subprocess에서 실행 | Paseo Plugin reference |
| config.json | `daemon.relay.enabled`·`features.webUi.enabled`·전역 plugin 스위치·listen 주소 등을 파일로 제어, `paseo reload` 적용 | `paseo.sh/docs/configuration` |
| Paseo SDK | workspace·agent·provider·config API, agent별 `mcpServers`와 `toolPolicy` 지원 | Paseo SDK reference · Providers with the SDK |
| provider 전제 | native provider(Claude Code·Codex·OpenCode·Pi)는 해당 CLI가 설치·인증된 뒤 동작. Gemini CLI 등은 ACP 카탈로그 | `paseo.sh/docs/supported-providers` |
| workspace 구조 | project → workspace → session. project는 git repo가 아니어도 되는 임의 디렉터리, workspace는 local·worktree isolation, CLI·SDK로 생성 | `paseo.sh/docs/workspaces` |
| Claude Code 관리 설정 | managed settings(파일·MDM·서버 관리)의 `forceLoginMethod`·`forceLoginOrgUUID`로 로그인 방식·조직 고정, 사용자 설정보다 우선 | `code.claude.com/docs/en/settings-reference` |
| Codex 관리 설정 | `config.toml`의 `forced_login_method`·`forced_chatgpt_workspace_id`로 회사 workspace SSO 강제 | `developers.openai.com/codex/auth` |
| Keycloak | Device Authorization Grant와 native app의 `http://127.0.0.1` loopback redirect 지원 (2026-08-21 확인) | Keycloak Server Administration · Securing applications |
| oauth2-proxy | Keycloak OIDC, `skip-jwt-bearer-tokens`, audience·group·role 검증 옵션 제공 (2026-08-21 확인) | OAuth2 Proxy Keycloak OIDC · Configuration overview |

## 서술 규칙

- "포크"라고 뭉뚱그리지 않는다. **사내 빌드(upstream 태그 + 최소 패치)**로 부르고,
  기능을 뺄 때는 **config로 끄는 것**과 **패치로 제거하는 것**을 구분해 적는다.
- `callback`이라고 뭉뚱그리지 않고 **oauth2-proxy HTTPS callback**, **Device Flow verification**,
  **PKCE loopback redirect**를 구분한다.
- 인증(authentication)과 인가(authorization)를 같은 뜻으로 쓰지 않는다.
- 브라우저 cookie flow와 Paseo Bearer flow를 항상 함께 보여 준다.
- `X-Forwarded-*` 헤더를 사용할 때는 직접 접근 차단과 입력 헤더 제거 조건을 같이 적는다.
- 설정 예시는 출발점으로 표시하고, 배포 중인 제품 버전의 옵션 이름을 확인하도록 안내한다.
- local skill 파일의 삭제를 권한 회수로 설명하지 않는다. 민감한 실행 경로의 서버 측 재인가를 강조한다.
