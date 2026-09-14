# 2. Keycloak 덱 재구성 실행 계획

작성일: 2026-09-14
상태: 진행 중
지금 위치: P02 완료 · 실습 환경 구현과 본문 개편 미착수 · 다음 P03
실행 범위: P02만 — 공식 자료에 근거한 실습 환경 결정 작성. P03 이후와 본문 개편은 제외한다.

[계획 관리 규칙](README.md)의 번호·상태·갱신·완료 절차를 따른다.

## 목표와 합의한 범위

Keycloak 전반을 이해하고, Ubuntu의 컨테이너 환경에서 외부 디렉터리 계정으로 앱에 로그인하고
권한을 부여하는 과정을 직접 재현하는 스터디 덱으로 바꾼다. 개념을 설명한 뒤 작은 실습으로
확인하고, 나중에는 증상·개념·작업 이름으로 찾아볼 수 있어야 한다.

사용자와 합의한 기본 환경은 **Ubuntu + Docker + kind + Samba AD DC**다.
Keycloak·PostgreSQL·테스트 앱·API는 kind 안에, Samba는 같은 Ubuntu 머신의 별도 Docker
컨테이너에 둔다. 별도 VM과 Windows Server는 요구하지 않는다. Samba를 kind Pod로 옮기거나
OpenLDAP으로 대체하는 것은 이 계획의 기본 구현이 아니다.

Samba는 AD 호환 디렉터리 실습에 사용한다. 결과를 Microsoft AD DS와 Windows 도메인 환경에서
검증한 것으로 서술하지 않는다. LDAP/LDAPS 연동을 본선으로 하고 Kerberos/SPNEGO를 이용한
데스크톱 SSO는 심화 범위로 남긴다.

이번 실행 범위는 P02까지다. P03 이후의 실습 환경 구현과 본문 개편은 후속 실행 요청에서 수행한다.
작업은 **작업 ID 하나씩 맡길 수 있도록** 분리했다. 후속 요청이 한 작업이면 그 작업까지,
전체 완료이면 의존 순서로 이어서 실행한다. 이 문서는 서브에이전트 생성이나 병렬 실행을 요구하지 않는다.

## 실행자가 읽을 것

매 세션 시작 시 작업 트리와 이 문서의 실행 기록을 확인한다. 필요한 지침만 읽는다.

- 공통: [AGENTS.md](../../AGENTS.md), [README.md](../../README.md), [검증 지침](../verification.md)
- Keycloak 작업 전: [현재 baseline](../../src/content/docs/keycloak/_baseline.md)
- MDX 작성 시: [콘텐츠 작성 규칙](../content-authoring.md), 대상 원본 페이지, `_deck.mjs`
- D2 작성 시: [D2 작성 규칙](../d2-authoring.md)
- 공통 실습 환경 참조: [환경 baseline](../../src/content/docs/lab-environment/_baseline.md),
  [kind 환경](../../src/content/docs/lab-environment/01-kind.mdx)

계획 문서는 계획 번호를 붙인다. 학습 페이지는 번호 없는 이름을 사용하며, 기존 CKA 개편 계획의
학습 페이지 번호 명명·커밋·전체 브라우저 순회 절차를 가져오지 않는다.
현재 baseline은 AD가 처음부터 존재하는 관리자 관점을 전제한다. P01에서 이번 합의에 맞게
수정하되, 인증/인가·두 단계 매핑·세션/토큰·issuer 구분은 유지한다.

## 완료 조건

- [ ] Ubuntu에서 별도 VM 없이 문서의 명령으로 전체 환경을 생성할 수 있다.
- [ ] 로컬 계정 로그인 → 두 앱 SSO → API 인가 → Samba 계정 로그인 → 그룹 매핑을 재현한다.
- [ ] 그룹 변경·계정 비활성화·LDAP 장애의 영향을 새 로그인/refresh/기존 JWT/앱 세션으로 구분한다.
- [ ] 중단·재시작·초기화를 구분하고, 빈 상태에서 다시 만들어 같은 결과를 얻는다.
- [ ] 사용자 관리·로그인 정책·앱 연결·외부 디렉터리·운영이 각각 찾아볼 수 있는 문서로 존재한다.
- [ ] 기존 내용의 주요 절마다 이관 목적지가 있고 옛 URL·절 북마크의 처리 결과가 남는다.
- [ ] 사이트 검사와 실제 실습 검증을 구분하고, 실행하지 못한 실습을 성공으로 기록하지 않는다.

## 기본 설계와 미확정 사항

```text
Ubuntu / Docker
├─ kind: keycloak-lab (context: kind-keycloak-lab)
│  ├─ Keycloak ── PostgreSQL
│  ├─ 앱 A / 앱 B ── API
│  └─ 실습 전용 진단 Pod
└─ Samba AD DC (별도 컨테이너 + 영속 볼륨)
          ↑
          └── Keycloak에서 LDAPS 연결
```

위 이름은 다른 실습과의 충돌을 피하기 위한 기본값이다. 필요한 경우 P02에서 한 번 확정하고
후속 작업이 임의로 바꾸지 않는다. 호스트의 기존 클러스터·DNS·CA 설정을 덮어쓰지 않는다.

| 항목 | 기본 방향 | 확정 작업 |
|---|---|---|
| 지원 환경 | Ubuntu + Docker Engine 우선. 실제 CPU 아키텍처를 기록하고 미검증 환경을 지원한다고 쓰지 않음 | P02 |
| Samba 이미지 | 출처·유지 상태·아키텍처·권한 요구를 확인. 적합한 이미지가 없으면 Ubuntu 패키지 기반 Dockerfile 작성 | P02, P03 |
| 버전 | Keycloak·PostgreSQL·kind/node·Samba·앱 의존성을 고정. `latest` 사용 금지 | P02 |
| 네트워크 | Docker 네트워크에서 kind 노드와 Samba 통신. Pod에서의 DNS와 라우팅은 별도로 검증 | P04 |
| 주소 | 공개 Keycloak issuer 하나, 브라우저/Pod에서 접근 가능한 이름, 앱 callback 주소를 함께 설계 | P02, P05 |
| TLS | HTTPS와 LDAPS의 CA 신뢰를 별도로 처리. 인증서 검증 비활성화를 완성 구성으로 채택하지 않음 | P04, P05 |
| 배포 | 기본 실습은 단일 Keycloak + PostgreSQL + 명시적 매니페스트. Operator는 운영 설명에서 다룸 | P05 |
| 테스트 앱 | 검증된 OIDC 라이브러리를 쓰는 최소 앱 하나를 A/B 두 Client로 실행하고 API 인가 확인 | P06 |
| 영속성 | Samba와 DB 데이터의 위치·수명·초기화 대상을 명시 | P03, P05, P10 |

아직 실제 컨테이너 연동은 검증하지 않았다. 특히 Docker 컨테이너 이름이 Pod에서도 자동으로
해석된다고 가정하지 않는다. 불가능한 환경 조건을 만나면 이유와 다음 조치를 기록하며,
사용자 합의 없이 VM을 추가하거나 Samba를 다른 제품으로 바꾸지 않는다.

## 산출물 배치

다음 경로 중 현재 존재하지 않는 것은 후속 작업에서 만들 **예정 경로**다.

```text
labs/keycloak/
  README.md              # 실행 진입점, 선행조건, 단계별 명령
  decisions.md           # 버전·이미지·주소·포트·자원·선택 근거
  verification.md        # 실습 환경과 실제 결과, 미검증 사항
  compose.yaml           # Samba 컨테이너와 볼륨
  kind.yaml              # 전용 클러스터 설정
  samba/                 # 이미지/초기화/테스트 사용자·그룹
  k8s/                   # DB·Keycloak·앱·API 매니페스트
  app/                   # OIDC 앱과 API의 최소 코드·의존성
  scripts/               # 생성·초기 데이터·확인·중단·정리
src/content/docs/keycloak/
  _baseline.md
  _deck.mjs
  index.mdx
  <개념 또는 작업 이름>.mdx
```

비밀번호·client secret·개인키·토큰·실제 사용자 정보는 실행 시 생성하거나 로컬 입력으로 받고
추적 파일에 저장하지 않는다. 예제 설정과 로컬 산출물 경계를 README와 ignore 규칙에 명시한다.
원본은 labs 파일에 두며 MDX에는 필요한 부분과 파일 위치를 설명한다. 사이트 독자가 파일을
어디서 받아 실행하는지도 링크한다. 저장소 파일 경로를 존재하지 않는 사이트 URL로 링크하지 않는다.

## 작은 작업의 공통 계약

1. `git status --short`와 실행 기록을 읽고, 의존 작업이 완료되었는지 확인한다.
2. 해당 작업의 입력과 지정 파일만 읽는다. 새 기능 전체를 다시 설계하지 않는다.
3. 작업 ID 하나의 범위만 수정한다. 문서 작업은 본문 한 페이지를 기본 단위로 한다.
4. 검증하고 이번 변경으로 생긴 오류를 고친다. 실패를 남긴 채 완료 표시하지 않는다.
5. 아래 기록 양식에 변경 파일·결정·검증·잔여 문제·다음 ID를 적는다. 요청한 실행 범위가
   남아 있으면 다음 작업을 이어서 수행하고, 지정된 범위를 마치면 종료한다.

사이트 콘텐츠·코드·설정 변경은 작업 완료 시 `pnpm check`를 한 번 실행한다.
계획·지침 문서만 바꾸면 `git diff --check`, diff와 참조 경로를 확인한다.
실습 코드에는 해당 단계의 실제 동작 검증을 추가한다. 사이트 빌드 통과가 실습 성공을 뜻하지 않는다.
문서 페이지 추가만으로 브라우저를 띄우지 않는다. 실제 앱 로그인·SSO·MFA 검증은 화면 동작
확인이 필요한 경우이므로 테스트 앱 A/B와 해당 Keycloak 설정으로 범위를 제한한다.

자동화 환경에 Ubuntu/Docker/브라우저가 없으면 정적 검사 결과와 미실행 검증 명령을 기록하고
`blocked`로 둔다. 특히 P11을 통과하기 전에는 실습 본문을 검증 완료 상태로 작성하지 않는다.
내용과 무관한 변경을 되돌리거나 임의로 커밋하지 않는다.

## 선행 구현 작업

모든 작업은 시작 전 공통 지침을 읽는다. 아래 입력은 추가로 필요한 파일/기록이다.
P01~P11은 순서대로 실행한다. 각 작업의 계획 기록 수정은 항상 범위에 포함된다.

| ID | 입력 | 수정 범위와 작업 | 완료 판정 |
|---|---|---|---|
| P01 | 현재 baseline, 본문 제목·주요 절, 이 계획 | baseline의 학습 축·범위 갱신. 아래 이관 표의 누락 절을 확인하여 보충 | 기존 주요 절에 목적지가 있고 사용자 합의와 baseline이 일치. 버전은 근거 없이 올리지 않음 |
| P02 | P01, 공식 배포/컨테이너/LDAP/kind/Samba 문서 | `labs/keycloak/decisions.md` 작성. 실행 환경, 고정 버전, 네트워크·주소·포트·CA·볼륨, 앱 라이브러리 선택 | 다운로드/이미지 가용성·아키텍처 확인. 선택값과 근거 URL·확인일 기록. 자원 수치는 추정/실측 구분 |
| P03 | decisions | `compose.yaml`, `samba/`, 로컬 산출물 ignore 규칙. Samba 단독 기동과 사용자·그룹 seed | 디렉터리 조회·사용자 bind 성공. 컨테이너 재생성 후 계정 유지, seed 재실행 중복 없음 |
| P04 | P03 결과, decisions | `kind.yaml`, 실습 네트워크/CA 스크립트·진단 Pod | Pod에서 Samba 이름 해석·LDAPS 검색·사용자 bind 성공. 틀린 CA/비밀번호 실패. 공개 인터넷 노출 불필요 |
| P05 | P04, Keycloak 공식 hostname/DB/컨테이너 문서 | `k8s/`의 PostgreSQL·Keycloak, 초기 Realm/로컬 계정 설정 | 브라우저 콘솔/계정 로그인, Pod의 discovery/JWKS 접근, issuer 일치. Keycloak 재생성 후 설정 유지 |
| P06 | P05, 선택한 OIDC 라이브러리 공식 문서 | `app/`, 앱 A 배포, Client seed | Authorization Code + PKCE 로그인. state/nonce/redirect 처리는 라이브러리 사용. 로그인 실패도 확인. 비밀번호 grant로 대체하지 않음 |
| P07 | P06 | 동일 앱 B 배포, API와 역할 매핑, 관련 seed | A 로그인 뒤 B에서 자격 증명 재입력 없이 로그인. API는 access token의 서명·iss·aud·exp 검증. 무토큰 401, 권한 부족 403, 허용 200 |
| P08 | P07, LDAP Federation 공식 문서 | Federation 설정/seed와 검증 명령 | READ_ONLY 기본. Samba alice/bob 로그인 성공. LDAP 그룹 가져오기 → 역할/claim 매핑 → API 결과를 단계별 확인 |
| P09 | P08 | 변경·장애 시나리오 스크립트/수동 절차, verification 기록 | 그룹 제거·계정 비활성화·AD 중단·복구에서 새 로그인/refresh/기존 토큰/앱 세션 결과와 설정값·경과 시간 기록. 복구 뒤 정상 상태 확인 |
| P10 | P03~P09 산출물 | README와 시작·상태·중단·재개·초기화 절차 | 데이터 보존 중단/재개와 데이터 삭제 초기화를 구분. 삭제 대상 이름을 출력하고 이 실습 소유 리소스만 처리. 전역 prune 금지 |
| P11 | 전체 labs 산출물 | 누락 수정, verification의 최소 실습 검증 기록 | 빈 실습 상태에서 생성 → 로컬 SSO/API → AD 로그인/그룹 → 중단·재개까지 재현. 버전·명령·성공/실패 근거 기록, 비밀값 제외 |

P11이 실습 본문 작성의 선행 조건이다. P02~P10에서 발견한 선택 변경은 decisions에 먼저 반영하고
관련 파일만 맞춘다. 컨테이너 이미지의 동작을 추측해 긴 완성 문서를 먼저 쓰지 않는다.

## 목표 목차와 페이지별 작업

D00은 P11 뒤 실행한다. `_deck.mjs`에 아래 새 그룹을 추가하되 기존 페이지가 쓰는 그룹은 유지한다.
새 페이지가 하나씩 완성될 때 자동 등록되도록 하며 빈 MDX를 미리 만들지 않는다.
기존 번호 페이지와 새 페이지의 병행 기간은 이관 중임을 index에서 짧게 밝힌다.
아래 order는 새 페이지용 예약값으로, D00에서 실제 중복이 없는지 확인한다.

각 D 작업의 입력은 공통 지침 + P11 결과 + 표의 원본 + 관련 labs 파일 + 관련 공식 문서다.
수정 범위는 **대상 MDX 한 개**, 필요한 같은 덱의 요약/링크, 실행 기록이다.
후속 페이지가 아직 없으면 링크하지 않고 생성된 다음 연결한다. 표의 파일명은 `.mdx` 생략이다.
기본 의존성은 직전 D 작업 완료다. 코드 수정이 필요하면 labs 수정·실습 재검증을 먼저 별도 작업으로
기록하고, 본문에서 작동하지 않는 설정을 임시로 설명하지 않는다.

| ID | 그룹 / order | 대상 파일과 한 가지 질문 | 재사용 원본 | 추가 완료 조건 |
|---|---|---|---|---|
| D01 | foundations / 1000 | `keycloak-overview`: Keycloak은 인증 시스템에서 무엇을 맡나 | 00-intro, 01-why | 로컬 사용자·Federation·Brokering의 큰 그림과 본선/심화 범위 |
| D02 | foundations / 1010 | `lab-setup`: 이 덱의 컨테이너 환경은 어떻게 준비하나 | labs README, 08-deploy | 공통 kind 설치 링크, 자원·주소·CA·정리 위치. 검증한 전제만 명시 |
| D03 | foundations / 1020 | `realm-and-users`: 첫 Realm과 사용자는 어떻게 만드나 | 03-structure | master와 학습 Realm 구분, 사용자 생성·비밀번호/required action·로그인 |
| D04 | login / 1030 | `oauth-oidc`: 앱 로그인의 표준 흐름은 무엇인가 | 02-oauth-oidc | OAuth/OIDC, 세 토큰, Code+PKCE를 한 로그인 흐름으로 설명 |
| D05 | login / 1040 | `clients-and-sso`: 앱 두 개를 어떻게 로그인에 연결하나 | 03-structure, 07-apps | public/confidential, redirect, 실제 A/B SSO 확인 |
| D06 | login / 1050 | `token-validation`: API는 토큰을 어떻게 검증하나 | 02-oauth-oidc | discovery/JWKS·iss/aud/exp, ID token과 access token 구분, 401/403/200 |
| D07 | access / 1060 | `groups-and-roles`: 사용자 접근 권한을 어떻게 조직하나 | 03-structure | 그룹·Realm role·Client role·최종 앱 인가 구분 |
| D08 | access / 1070 | `scopes-and-mappers`: 필요한 값만 토큰에 어떻게 싣나 | 03-structure | scope와 mapper의 역할, 최소 claim, 앱 A/B 차이 확인 |
| D09 | access / 1080 | `authentication-flows`: 로그인 조건과 MFA를 어떻게 바꾸나 | 신규 | 복제한 flow에서 OTP 설정·성공/실패·복구 검증. 기본 flow 무작정 수정 금지 |
| D10 | access / 1090 | `sessions-and-logout`: 로그아웃하면 무엇이 끝나나 | 05-sessions, 07-apps | Keycloak/앱 세션·기존 JWT 구분, 실제 A/B 로그아웃 결과 |
| D11 | directory / 1100 | `ad-and-ldap`: AD 연결 설정의 이름들은 무엇인가 | 04-ad-federation | DN/OU/bind/검색 범위, Samba와 Microsoft AD 범위 구분 |
| D12 | directory / 1110 | `samba-directory`: 테스트 디렉터리를 어떻게 준비하나 | labs samba | 사용자·그룹 seed, LDAPS·CA·영속성, 조회·bind 결과 |
| D13 | directory / 1120 | `ldap-federation`: 외부 계정으로 어떻게 로그인하나 | 04-ad-federation | READ_ONLY·import·sync·cache 구분, 성공/실패와 비밀번호 소재 |
| D14 | directory / 1130 | `directory-group-mapping`: AD 그룹이 앱 권한이 되려면 | 04-ad-federation, 07-apps | LDAP mapper와 protocol mapper를 별도로 추적, 두 사용자 접근 비교 |
| D15 | directory / 1140 | `directory-changes`: 계정 변경과 장애가 언제 반영되나 | 04-ad-federation, 05-sessions, P09 | 새 로그인/refresh/기존 JWT/앱 세션 관찰 표, 복구 절차 |
| D16 | integrations / 1150 | `identity-brokering`: 다른 IdP 로그인을 어떻게 받아들이나 | 04-ad-federation | 두 번째 테스트 Realm으로 OIDC brokering·최초 계정 연결 확인. 실제 외부 계정 불필요 |
| D17 | integrations / 1160 | `saml`: SAML 연동은 OIDC와 무엇이 다른가 | 신규 | SP/IdP·metadata/assertion·서명·선택 기준. 전체 SAML 실습은 범위 밖 |
| D18 | integrations / 1170 | `service-accounts`: 사용자 없이 서비스가 어떻게 인증하나 | 신규 | client credentials, 최소 권한, 사용자 로그인과 구분. API 허용/거부 검증 |
| D19 | integrations / 1180 | `oauth2-proxy`: OIDC를 모르는 앱은 어떻게 보호하나 | 07-apps | proxy 경계·헤더 신뢰·우회 경로·쿠키와 로그아웃. 기본 A/B 앱을 교체하지 않음 |
| D20 | integrations / 1190 | `kubernetes-oidc`: kubectl 로그인은 어떻게 연결하나 | 06-k8s-oidc | 기준 K8s 버전의 인증 설정, public client+PKCE, 인증/RBAC 구분, 복구용 관리자 접근 |
| D21 | operations / 1200 | `deployment`: 실습 배포와 운영 배포는 어떻게 다른가 | 08-deploy | Operator/직접 배포 비교, hostname·proxy·TLS·Secret, realm import 한계 |
| D22 | operations / 1210 | `storage-and-availability`: 재시작과 장애를 무엇이 견디나 | 05-sessions, 08-deploy | DB·캐시·persistent sessions 역할. 단일 kind 실습을 HA 검증으로 쓰지 않음 |
| D23 | operations / 1220 | `observability`: 인증 문제를 어디서 관찰하나 | 09-ops, 10-troubleshooting | 이벤트·관리 이벤트·로그·health/metrics, 비밀값 제외한 진단 예 |
| D24 | operations / 1230 | `backup-and-upgrade`: 설정과 데이터를 어떻게 복구하나 | 09-ops | DB 백업/복구와 realm export 차이, 버전별 업그레이드 근거, 실습 DB 복구 확인 |
| D25 | operations / 1240 | `administration-and-keys`: 관리 권한과 서명 키를 어떻게 관리하나 | 09-ops | master/위임·관리 API·키 교체/구 키 검증 기간 구분 |
| D26 | reference / 1250 | `troubleshooting`: 증상에서 어느 경계를 확인하나 | 10-troubleshooting, P09 | 증상→확인→기대 결과→복구→관련 장. 다른 장의 절차를 전부 복제하지 않음 |
| D27 | reference / 1260 | `glossary`: 용어를 어디서 다시 찾나 | 11-glossary | 새 용어와 본문 링크, 역할이 다른 용어를 합치지 않음 |
| D28 | reference / 1270 | `wrapup`: 무엇을 이해하고 재현했나 | 12-wrapup | 핵심 흐름·실습 완료표·심화 지도. 미실행 항목은 구분 |

D09/D16/D18/D24는 새 실습이 필요하므로 각각 본문 작성 전에 `D09-L`처럼 보조 작업을 만든다.
보조 작업은 labs의 해당 기능만 구현·검증하고 종료하며, 다음 세션에서 MDX를 작성한다.
D19/D20은 우선 선택 기준·구성·진단을 다루는 참조 페이지다. 실행 가능한 완성 실습으로 제공하려면
같은 방식의 보조 작업을 먼저 완료한다. Kubernetes OIDC를 검증할 때는 IdP가 같은 클러스터에
있는 부트스트랩 의존성과 관리자 복구 경로를 명시하고 기본 실습 클러스터를 무작정 재생성하지 않는다.

모든 학습 페이지는 핵심 요약 → 큰 그림 → 이 장의 질문 → 설명 → 필요한 실습/확인 → 요약 순서다.
새 페이지에 Thesis와 필요한 TermIntro를 사용하며 제목·파일·URL·본문 참조에 순서 번호를 붙이지 않는다.
표의 D 번호와 order는 작업 추적·정렬용이다. 한 페이지가 두 질문으로 커지면 보조 작업으로 분리하고
목차 표를 먼저 갱신한다. 페이지 수 자체는 완료 목표가 아니다.

## 기존 내용 이관과 옛 링크

원본 이름은 `src/content/docs/keycloak/` 기준이다. D 작업은 기존 파일을 즉시 지우지 않는다.
아래 표는 P01에서 원본의 h2와 이관 판단이 필요한 h3를 목표 목차와 대조한 계약이다.
`참고 자료`는 해당 주장을 받는 목적지로, 장 요약은 해당 목적지와 최종 `wrapup`으로 흡수한다.
목적지가 여러 개인 절은 내용을 그대로 복제하지 않고 각 페이지의 질문에 맞는 사실만 나눈다.

| 기존 파일 | 주요 절·세부 항목 | 새 목적지 |
|---|---|---|
| `index.mdx` | 구성, 전체를 관통하는 두 문장, 문제·작업으로 바로 찾기 | index 최종 구성·탐색 링크(F01), keycloak-overview, directory-group-mapping, troubleshooting |
| `00-intro.mdx` | 대상·범위 | index, keycloak-overview, lab-setup |
|  | 멘탈 모델: 통역사 / 두 번의 매핑 / 서명으로 흐르는 신뢰 | keycloak-overview / directory-group-mapping / token-validation |
|  | 기준 시점 | `_baseline.md`, keycloak-overview, deployment, backup-and-upgrade |
| `01-why.mdx` | 앱별 AD 직접 연동의 문제, 인증 중앙화, Keycloak의 자리·동급 제품 | keycloak-overview |
|  | 3개 경계·2번의 매핑 | keycloak-overview, directory-group-mapping |
| `02-oauth-oidc.mdx` | OAuth의 위임 문제와 OIDC 인증, 토큰 세 종류, Authorization Code + PKCE | oauth-oidc; access token 검증은 token-validation, refresh 수명은 sessions-and-logout |
|  | 다른 flow의 선택 기준 | oauth-oidc; client credentials는 service-accounts |
|  | JWT 서명·최소 검증 축, discovery/JWKS | token-validation |
|  | SAML의 위치 | saml |
| `03-structure.mdx` | Realm | realm-and-users |
|  | Client와 redirect/public/confidential 구분 | clients-and-sso |
|  | protocol mapper와 client scope | scopes-and-mappers |
|  | Group과 Realm/Client Role | groups-and-roles |
|  | 콘솔 메뉴와 개념의 대응 | 해당 개념 페이지; 자동화 진입점은 administration-and-keys |
| `04-ad-federation.mdx` | Federation/Brokering 비교와 비밀번호 소재 | ad-and-ldap, ldap-federation, identity-brokering |
|  | DN·OU·속성, LDAP provider·LDAPS 설정 | ad-and-ldap |
|  | Edit mode, import, sync | ldap-federation, directory-changes |
|  | LDAP 속성·그룹 mapper | directory-group-mapping |
|  | Kerberos/SPNEGO | wrapup의 심화 지도. 기본 실습에는 넣지 않음 |
|  | `kcadm.sh`·Terraform·Operator 자동화와 멱등성 | administration-and-keys, deployment |
|  | AD 연동 진단과 bind/인증서 보안 | troubleshooting, directory-changes, ad-and-ldap, observability |
| `05-sessions.mdx` | 세션·토큰 층, 수명 다이얼, refresh/offline token, 로그아웃·강제 종료 | sessions-and-logout |
|  | persistent sessions와 DB·캐시 | storage-and-availability |
| `06-k8s-oidc.mdx` | 인증서 문제, 전체 흐름, Keycloak client/mapper, API server 설정, kubelogin, RBAC, 운영 함정 | kubernetes-oidc |
| `07-apps.mdx` | 세 연동 패턴과 공통 client 체크리스트 | clients-and-sso; 비네이티브 앱 경계는 oauth2-proxy |
|  | oauth2-proxy 설정·헤더 신뢰 | oauth2-proxy |
|  | claim 전달의 다섯 고리 | scopes-and-mappers, directory-group-mapping, troubleshooting |
|  | Keycloak·proxy cookie·앱 세션 로그아웃 | sessions-and-logout, oauth2-proxy |
| `08-deploy.mdx` | dev/운영 차이, Operator/직접 배포, DB·hostname·TLS, 이미지 최적화 | lab-setup, deployment |
|  | HA·DB·캐시의 상태 경계 | storage-and-availability |
| `09-ops.mdx` | 백업과 export 차이, 업그레이드 | backup-and-upgrade |
|  | 서명 키·유출 대응, 관리 권한 위임 | administration-and-keys; 토큰 회수 한계는 sessions-and-logout |
|  | 이벤트·메트릭·로그, 운영 루틴 | observability |
| `10-troubleshooting.mdx` | 진단 사슬, 도구, 로그인·토큰·kubectl 표, 심층 진단 | troubleshooting; 관찰 도구는 observability, kubectl 고유 항목은 kubernetes-oidc |
| `11-glossary.mdx` | 인증, AD/LDAP, 프로토콜/token, Keycloak, 연동/배포 용어 | glossary와 각 용어의 본문 페이지 |
| `12-wrapup.mdx` | 전체 지도, 장별 문장, 마지막 요약 | wrapup |
|  | 구축 체크리스트 | lab-setup, deployment, storage-and-availability, wrapup의 완료표 |
|  | 사고 대응 카드 | troubleshooting |
|  | 심화 주제 | wrapup의 심화 지도와 해당 참조 페이지 |

마지막 이관은 기존 파일 하나 또는 아래 지정 범위만 처리한다. 한 번에 모든 파일을 삭제하지 않는다.

| ID | 의존성 | 범위 | 완료 판정 |
|---|---|---|---|
| F01 | D28 | index·`_deck.mjs`의 설명/최종 map, baseline의 새 참조 | 큰 그림→본선→심화, 실제 존재하는 페이지만 링크. map 표시 번호 제거 |
| F02-a~m | F01 | 00-intro~12-wrapup을 원본 하나씩: 절 이관 확인, 유입 링크 수정, 옛 URL 처리, 원본 정리 | 각 원본의 본문·구성도·타 덱 링크·옛 절 anchor를 확인하고 검사 통과 |
| F03 | F02 전체 | 미사용 그룹 제거, baseline·용어집·wrapup·전체 이관 표 감사 | 번호 없는 최종 구조, 중복 설명/고아 링크/누락 절 없음 |
| F04 | F03 | 최종 실습/문서 일치 확인, 실행 기록 | 새 변경이 실습 결과에 영향을 주면 해당 시나리오만 재검증. 전체 완료 조건 판정 |

F02 시작 시 `rg`로 저장소 전체의 옛 slug와 anchor 참조를 조사한다. 리다이렉트 구현은 현재
Astro/호스팅 구성을 먼저 확인하고 필요한 [배포 지침](../deploy.md)을 읽는다. 페이지 리다이렉트만으로
분할된 옛 anchor가 새 절로 옮겨진다고 가정하지 않는다. 가능한 경우 옛 anchor를 목적지에서 유지하고,
일대다 분할에서 불가능하면 호환 안내 페이지 등으로 목적지를 제공한다. 적용 방식과 확인한 옛 URL을
기록한다. 사이드바/검색에 호환 페이지가 학습 본문처럼 중복 등록되지 않도록 기존 구조를 확인한다.
클라이언트 리다이렉트를 새로 넣는 경우에만 해당 URL의 브라우저 동작을 최소 범위로 확인한다.

## 공식 근거의 출발점

아래는 설계·검증 때 읽을 출발점이며 고정 버전 검증을 대신하지 않는다. 구현자는 사용 버전의
릴리스 노트와 문서를 대조하고 decisions에 확인일을 남긴다.

- [Keycloak Server Administration](https://www.keycloak.org/docs/latest/server_admin/): LDAP, mapper, 세션, 로그인 정책, brokering
- [Keycloak 컨테이너](https://www.keycloak.org/server/containers): 이미지·기동
- [Keycloak hostname](https://www.keycloak.org/server/hostname): 공개 주소와 issuer
- [Keycloak 운영 배포](https://www.keycloak.org/server/configuration-production): 운영 설정
- [Keycloak Operator](https://www.keycloak.org/operator/installation): 운영 배포 선택
- [kind 구성](https://kind.sigs.k8s.io/docs/user/configuration/): 노드·포트 구성
- [Ubuntu Samba AD DC](https://ubuntu.com/server/docs/how-to/samba/provision-samba-ad-controller/): 디렉터리 구축과 확인. 이 가이드는 컨테이너 배포 검증 결과가 아님

## 실행 기록과 재개 방법

작업 상태는 `todo`, `doing`, `blocked`, `done` 중 하나다. `done`은 완료 조건과 검증을 모두 충족한
경우에만 사용한다. 아래 표에 매번 한 행을 추가하고 문서 맨 위의 다음 작업을 갱신한다.
첫 실행은 P01이며, 현재 어떤 구현도 완료한 것으로 간주하지 않는다.

| 작업 | 상태 | 변경 파일 | 검증 결과/근거 | 결정·잔여 문제 | 다음 작업 |
|---|---|---|---|---|---|
| 계획 작성 | done | 이 문서 | diff·참조 경로 확인 | 컨테이너 실행 미착수 | P01 |
| P01 | done | `src/content/docs/keycloak/_baseline.md`, 이 문서, `docs/plans/README.md` | `git diff --check`; 계획·baseline 링크와 원본/목표 slug 대조 | 합의한 학습 순서와 Ubuntu 컨테이너 경계를 baseline에 반영. 기존 index와 00~12의 주요 절 목적지 확정. 버전 유지, 실습·본문 미착수 | P02 |
| P02 | done | `labs/keycloak/decisions.md`, 이 문서 | 2026-09-14 공식 release/registry/package metadata 조회, 지정 download HTTP 200, amd64/arm64 manifest 확인; 추적 파일 `git diff --check`와 새 파일 `git diff --no-index --check`; 문서 내 공식 URL HTTP 확인. image pull·container 실행·자원 실측은 미실행 | Ubuntu 24.04와 amd64/arm64, Keycloak 26.7.3·PostgreSQL 18.6·kind v0.33.0/Kubernetes v1.35.8·Ubuntu Samba 4.19.5·Node 24 의존성을 digest/snapshot/lockfile로 고정. 동일 공개 issuer, loopback NodePort, 분리 CA, volume 수명과 추정 자원 확정. P03에서 Samba 단독 동작과 권한·volume 경계를 실제 검증 | P03 |

새 세션에 넘길 요청 예시:

```text
docs/plans/02-keycloak-rework.md를 읽고 다음 미완료 작업 ID 하나만 실행해줘.
선행 작업 결과와 관련 지침을 확인하고, 지정 범위의 수정과 검증까지 완료해.
실행하지 못한 검증은 성공으로 쓰지 말고, 계획의 실행 기록과 다음 작업을 갱신해.
커밋·푸시는 하지 마.
```
