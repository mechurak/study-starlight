# 2. Keycloak 덱 재구성 실행 계획

작성일: 2026-09-14
상태: 진행 중
지금 위치: P09 변경·장애 시나리오 구현과 비브라우저 검증 완료 · P05·P06 macOS browser 확인은 blocked 유지 · 다음 P10
실행 범위: Compose 기반 P09만 — 그룹 변경·계정 비활성화·LDAP 장애의 token/session 영향 구현과 비브라우저 검증·기록. P10 이후와 본문 개편은 포함하지 않는다.
보류: Ubuntu P03 플랫폼 검증 보류 — macOS/Colima 결과를 Ubuntu 결과로 일반화하지 않는다.

[계획 관리 규칙](README.md)의 번호·상태·갱신·완료 절차를 따른다.

## 목표와 합의한 범위

Keycloak 전반을 이해하고, macOS/Colima와 Ubuntu/Docker Engine 환경에서 외부 디렉터리 계정으로
앱에 로그인하고 권한을 부여하는 과정을 직접 재현하는 스터디 덱으로 바꾼다. 개념을 설명한 뒤 작은 실습으로
확인하고, 나중에는 증상·개념·작업 이름으로 찾아볼 수 있어야 한다.

개인 환경은 **macOS + Colima**, 회사 환경은 **Ubuntu + Docker Engine**이다.
Keycloak·PostgreSQL·테스트 앱 A/B·API·Samba를 같은 Docker runtime의 **Docker Compose 서비스**로
실행한다. 기본 실습은 kind·kubectl 없이 생성·검증할 수 있어야 한다. Colima가 관리하는 Linux VM 외에
별도 VM과 Windows Server는 요구하지 않으며, Samba는 AD DC 컨테이너로 유지한다.

Samba는 AD 호환 디렉터리 실습에 사용한다. 결과를 Microsoft AD DS와 Windows 도메인 환경에서
검증한 것으로 서술하지 않는다. LDAP/LDAPS 연동을 본선으로 하고 Kerberos/SPNEGO를 이용한
데스크톱 SSO는 심화 범위로 남긴다.

P05-C에서 합의한 Compose 전환을 decisions와 baseline의 계약에 반영했다. 인증·SSO·API 인가·LDAP
연동을 Compose에서 먼저 완성하고, Kubernetes 배포·kubectl OIDC는 기본 실습 완료 후 별도 요청으로
실행하는 선택 실습으로 둔다.
P04의 kind 검증은 당시 결과로 보존하며 Compose 경로의 검증을 대신하지 않는다. 네이티브 Ubuntu P03은
사용자가 나중에 별도로 수행한다. macOS/Colima P03 통과를 바탕으로 Compose 후속 작업은 진행할 수 있다.
P05의 Compose 자동 검증은 통과했고 macOS 관리자 인증이 필요한 browser CA trust·로그인만 사용자
결정으로 보류했다. P05·P06 상태는 `blocked`로 유지하지만 이 browser 보류를 P07 구현 착수의 선행
차단으로 사용하지 않는다. P07의 비브라우저 SSO/API 통과도 보류 중인 실제 Chrome 검증을 대신하지 않는다.
작업은 **작업 ID 하나씩 맡길 수 있도록** 분리했다. 후속 요청이 한 작업이면 그 작업까지,
전체 완료이면 의존 순서로 이어서 실행한다. 이 문서는 서브에이전트 생성이나 병렬 실행을 요구하지 않는다.

## 실행자가 읽을 것

매 세션 시작 시 작업 트리와 이 문서의 실행 기록을 확인한다. 필요한 지침만 읽는다.

- 공통: [AGENTS.md](../../AGENTS.md), [README.md](../../README.md), [검증 지침](../verification.md)
- Keycloak 작업 전: [현재 baseline](../../src/content/docs/keycloak/_baseline.md)
- MDX 작성 시: [콘텐츠 작성 규칙](../content-authoring.md), 대상 원본 페이지, `_deck.mjs`
- D2 작성 시: [D2 작성 규칙](../d2-authoring.md)
- 공통 실습 환경 참조: [환경 baseline](../../src/content/docs/lab-environment/_baseline.md),
  [kind 환경](../../src/content/docs/lab-environment/01-kind.mdx)의 Docker·Colima 준비 절. 기본 실습은
  kind·kubectl 설치를 요구하지 않는다.

계획 문서는 계획 번호를 붙인다. 학습 페이지는 번호 없는 이름을 사용하며, 기존 CKA 개편 계획의
학습 페이지 번호 명명·커밋·전체 브라우저 순회 절차를 가져오지 않는다.
P01에서 정한 인증/인가·두 단계 매핑·세션/토큰·issuer 구분은 유지한다. P05-C에서 baseline과
decisions를 Compose 설계에 맞췄으므로 다음 작업은 Compose 기반 P05 구현·검증이다.

## 완료 조건

- [ ] macOS에서는 Colima, Ubuntu에서는 Docker Engine으로 kind·kubectl 없이 Compose 기본 환경을 생성할 수 있다. 두 환경의 실제 검증 결과를 각각 남긴다.
- [ ] 로컬 계정 로그인 → 두 앱 SSO → API 인가 → Samba 계정 로그인 → 그룹 매핑을 재현한다.
- [ ] 그룹 변경·계정 비활성화·LDAP 장애의 영향을 새 로그인/refresh/기존 JWT/앱 세션으로 구분한다.
- [ ] 중단·재시작·초기화를 구분하고, 빈 상태에서 다시 만들어 같은 결과를 얻는다.
- [ ] 사용자 관리·로그인 정책·앱 연결·외부 디렉터리·운영이 각각 찾아볼 수 있는 문서로 존재한다.
- [ ] 기존 내용의 주요 절마다 이관 목적지가 있고 옛 URL·절 북마크의 처리 결과가 남는다.
- [ ] 사이트 검사와 실제 실습 검증을 구분하고, 실행하지 못한 실습을 성공으로 기록하지 않는다.

## 확정한 기본 설계와 미검증 사항

```text
macOS / Colima / Docker 또는 Ubuntu / Docker Engine
└─ Compose project: keycloak-lab / 전용 Docker network
   ├─ Keycloak ── PostgreSQL (named volume)
   ├─ 앱 A / 앱 B ── API
   ├─ Samba AD DC (기존 named volume, Keycloak에서 LDAPS 연결)
   └─ 실습 전용 진단 container (필요할 때 실행)
```

기존 Compose project·bridge `keycloak-lab`, Samba 주소·domain·named volume·CA·secret은 보존한다.
P05-C에서 Compose의 주소·포트·DNS·인증서 mount·DB volume·자원 계약과 P04 node 처리 절차를
확정했다. 호스트의 기존 cluster·DNS·CA 설정을 덮어쓰지 않는다.

| 항목 | 기본 방향 | 확정 작업 |
|---|---|---|
| 지원 환경 | macOS + Colima와 Ubuntu + Docker Engine. 실제 OS/runtime/CPU 아키텍처를 기록하고 환경별 검증 결과를 구분 | P02, P03 |
| Samba 이미지 | 출처·유지 상태·아키텍처·권한 요구를 확인. 적합한 이미지가 없으면 Ubuntu 패키지 기반 Dockerfile 작성 | P02, P03 |
| 버전 | Keycloak·PostgreSQL·Samba·앱의 P02 고정값 유지. kind/node는 선택 실습용으로 보존. `latest` 사용 금지 | P02, P05-C 완료 |
| 네트워크 | Compose bridge의 유일한 service alias 사용. Samba `.10`, Keycloak `.20`; DB·API·Samba host publish 없음 | P05-C 완료, P05 검증 |
| 주소 | issuer `https://keycloak.keycloak.test:30080/realms/study`. host는 loopback, container는 alias로 같은 FQDN·port 사용 | P05-C 완료, P05 검증 |
| TLS | web/directory CA 분리. public cert/CA는 read-only, private key·비밀번호는 service별 Compose secret mount | P05-C 완료, P05 검증 |
| 배포 | 단일 Keycloak + PostgreSQL을 Compose로 실행. Kubernetes·Operator는 운영 설명 및 후속 선택 실습 | P05 |
| 테스트 앱 | 검증된 OIDC 라이브러리를 쓰는 최소 앱 하나를 A/B 두 Client로 실행하고 API 인가 확인 | P06 |
| 영속성 | Samba `keycloak-lab-samba-data`; PostgreSQL 18은 `keycloak-lab-postgres-data`를 `/var/lib/postgresql`에 mount | P03, P05-C 완료, P05·P10 검증 |
| 자원 | 4 CPU/8 GiB, 시작 전 가용 memory 5 GiB, disk 여유 20 GiB. service limit 합계 4 CPU/4.5 GiB | P05-C 완료, P05·P11 실측 |

현재 P03 Samba와 P04 kind-to-Samba 경로는 macOS/Colima에서 검증했다. P05-C의 Compose 값은 문서
계약이며 Compose의 Keycloak·앱 경로와 네이티브 Ubuntu는 아직 검증하지 않았다. 불가능한 환경 조건을
만나면 이유와 다음 조치를 기록하며, 사용자 합의 없이 VM을 추가하거나 Samba를 다른 제품으로 바꾸지 않는다.

### Compose 전환 계약과 기존 환경 처리

P05-C는 다음 변경을 `labs/keycloak/decisions.md`와 Keycloak baseline에 반영한 계약 정리 작업이다.
이번 작업은 두 계약 문서와 이 계획만 변경했고 실행 환경은 변경하지 않았다.

- 현재 공개 URL·issuer·callback 이름을 유지했다. host loopback/hosts와 Compose DNS alias를 나누고
  container listener를 같은 번호로 맞춰 브라우저와 container가 같은 URL·port로 TLS 검증 및
  discovery/JWKS에 접근하게 한다. container 내부용 issuer는 따로 만들지 않는다.
- CoreDNS·NodePort·ClusterIP·PVC·Kubernetes Secret 전제를 Compose 서비스 DNS·loopback publish·
  named volume·로컬 파일 기반 secret/인증서 mount 계약으로 바꿨다. DB·API·Samba는 host에 publish하지 않는다.
- P04 node가 실제 점유한 `.20`과 host `30080`~`30082`는 P05에서 재사용한다. 단순 stop이 아니라 label·
  image·주소·port를 확인한 `keycloak-lab` 하나만 `kind delete cluster --name ... --kubeconfig ...`로
  삭제하고, `.20` owner와 port가 비었으며 Samba·volume·CA·secret·P03/P04 기록이 유지됐는지 확인한
  뒤 Compose를 시작한다. P05-C에서는 cluster를 중단·삭제하지 않았다.
- 기존 `kind.yaml`, `kind/`, 진단 Pod와 P04 기록은 선택 실습 참고로 보존한다. 기본 시작·검증·초기화는
  이 파일이나 실행 중인 kind cluster에 의존하지 않아야 한다. 향후 정확한 실습 cluster를 정리해도
  Samba named volume·로컬 CA·secret은 유지하며, 전역 prune이나 Colima 초기화는 하지 않는다.
- 실측한 Colima 2 CPU/2 GiB·가용 memory 약 278 MiB는 P05 계약을 충족하지 않는다. 기본 경로는 사용자와
  중단 시간을 합의한 별도 작업에서 default profile을 4 CPU/8 GiB로 증설하고 기존 named volume과 bind
  mount를 보존하는 것이다. 실행 중 Supabase 8개는 약 720 MiB를 쓰고 limit이 없으므로 증설 뒤에도
  가용 memory 5 GiB를 다시 확인한다. 다른 workload를 사용자 승인 없이 중단하지 않는다.

### Ubuntu P03 플랫폼 검증 보류

- [ ] Ubuntu 24.04 + rootful Docker Engine 고정 버전에서 `labs/keycloak/samba/verify-p03.sh`를 실행한다.
- macOS/Colima의 P03 통과는 Ubuntu 결과로 일반화하지 않는다. 이 보류 항목은 Compose 후속 작업을 막지 않지만
  실제 Ubuntu 실행 전에는 Ubuntu 지원 경로를 검증 완료로 표시하지 않는다.

## 산출물 배치

다음 경로 중 현재 존재하지 않는 것은 후속 작업에서 만들 **예정 경로**다.

```text
labs/keycloak/
  README.md              # 실행 진입점, 선행조건, 단계별 명령
  decisions.md           # 버전·이미지·주소·포트·자원·선택 근거
  verification.md        # 실습 환경과 실제 결과, 미검증 사항
  compose.yaml           # 기본 실습의 Samba·DB·Keycloak·앱·API 서비스와 볼륨
  kind.yaml              # P04 보존 산출물, 후속 Kubernetes 선택 실습용
  kind/                  # P04 네트워크·CA·진단 스크립트 보존, 기본 실행에는 미사용
  samba/                 # 이미지/초기화/테스트 사용자·그룹
  k8s/                   # P04 진단 Pod 보존, 추가 배포는 선택 실습 요청 시 작성
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

자동화 환경에 지원 대상 Docker runtime이나 필요한 브라우저가 없으면 정적 검사 결과와 미실행 검증 명령을 기록하고
`blocked`로 둔다. 특히 P11을 통과하기 전에는 실습 본문을 검증 완료 상태로 작성하지 않는다.
내용과 무관한 변경을 되돌리거나 임의로 커밋하지 않는다.

## 선행 구현 작업

모든 작업은 시작 전 공통 지침을 읽는다. 아래 입력은 추가로 필요한 파일/기록이다.
P01~P04와 P05-C의 기록은 보존한다. 남은 기본 작업은 P05~P11 순서로 실행한다.
P05는 macOS P03 검증 결과와 P05-C 계약을 입력으로 사용하며 P04 cluster 실행을 선행 조건으로 두지 않는다.
각 작업의 계획 기록 수정은 항상 범위에 포함된다.

| ID | 입력 | 수정 범위와 작업 | 완료 판정 |
|---|---|---|---|
| P01 | 현재 baseline, 본문 제목·주요 절, 이 계획 | baseline의 학습 축·범위 갱신. 아래 이관 표의 누락 절을 확인하여 보충 | 기존 주요 절에 목적지가 있고 사용자 합의와 baseline이 일치. 버전은 근거 없이 올리지 않음 |
| P02 | P01, 공식 배포/컨테이너/LDAP/kind/Samba 문서 | `labs/keycloak/decisions.md` 작성. 실행 환경, 고정 버전, 네트워크·주소·포트·CA·볼륨, 앱 라이브러리 선택 | 다운로드/이미지 가용성·아키텍처 확인. 선택값과 근거 URL·확인일 기록. 자원 수치는 추정/실측 구분 |
| P03 | decisions | `compose.yaml`, `samba/`, 로컬 산출물 ignore 규칙. Samba 단독 기동과 사용자·그룹 seed | 디렉터리 조회·사용자 bind 성공. 컨테이너 재생성 후 계정 유지, seed 재실행 중복 없음 |
| P04 | P03 결과, decisions의 당시 kind 계약 | 완료한 `kind.yaml`, 네트워크/CA 스크립트·진단 Pod 보존. 기본 Compose 의존성에서 제외 | 당시 macOS Pod DNS·LDAPS·bind 결과 보존. Compose 및 Ubuntu 결과로 일반화하지 않음 |
| P05-C | P03 macOS 결과, P04 자원·포트 기록, 현재 decisions/baseline, 필요한 공식 Compose·Keycloak 문서 | decisions와 baseline의 Compose 전환 계약 정리. 위 전환 항목의 주소·listener·DNS·CA·volume·자원·기존 kind 처리 확정. 배포 파일·본문 구현은 제외 | 기본 경로에 kind 의존성 없음. 동일 issuer의 host/container 접근 설계와 기존 상태 보존·포트 충돌 해소 절차 명시. 미실행 사항 구분, diff·참조 확인 |
| P05 | P05-C, P03 macOS 결과, Keycloak 공식 hostname/DB/컨테이너 문서 | `compose.yaml`에 PostgreSQL·Keycloak과 진단 container, 초기 Realm/로컬 계정·CA 스크립트 추가 | 브라우저 콘솔/계정 로그인, container의 discovery/JWKS 접근과 issuer 일치. Compose 진단에서 Samba DNS·CA 검증 LDAPS 검색·alice/bob bind·오답 CA/비밀번호 실패·외부 인터넷 없이 진단·P03 상태 유지 확인. Keycloak/DB container 재생성 후 설정 유지 |
| P06 | P05, 선택한 OIDC 라이브러리 공식 문서 | `app/`, Compose 앱 A 서비스, Client seed | Authorization Code + PKCE 로그인. state/nonce/redirect 처리는 라이브러리 사용. 로그인 실패도 확인. 비밀번호 grant로 대체하지 않음 |
| P07 | P06 | Compose 앱 B·API 서비스와 역할 매핑, 관련 seed | A 로그인 뒤 B에서 자격 증명 재입력 없이 로그인. API는 access token의 서명·iss·aud·exp 검증. 무토큰 401, 권한 부족 403, 허용 200 |
| P08 | P07, LDAP Federation 공식 문서 | Federation 설정/seed와 검증 명령 | READ_ONLY 기본. Samba alice/bob 로그인 성공. LDAP 그룹 가져오기 → 역할/claim 매핑 → API 결과를 단계별 확인 |
| P09 | P08 | 변경·장애 시나리오 스크립트/수동 절차, verification 기록 | 그룹 제거·계정 비활성화·AD 중단·복구에서 새 로그인/refresh/기존 토큰/앱 세션 결과와 설정값·경과 시간 기록. 복구 뒤 정상 상태 확인 |
| P10 | P03, P05-C~P09의 Compose 산출물 | README와 Compose 시작·상태·중단·재개·초기화 절차 | 서비스별 기동과 readiness, 데이터 보존 중단/재개 및 명시적 volume 초기화 구분. 정확한 project/리소스만 처리. 기본 cleanup에 kind 조작이나 전역 prune 없음 |
| P11 | 기본 Compose 산출물, P10 | 누락 수정, verification의 환경별 전체 실습 검증 기록 | kind·kubectl 없이 빈 실습 상태에서 생성 → 로컬 SSO/API → AD 로그인/그룹 → 중단·재개 재현. 준비 단계의 다운로드와 인터넷 없이 수행할 진단 구분. OS별 버전·자원·명령·결과 기록, Ubuntu 미실행이면 전체 검증 완료 처리하지 않음 |

P11이 실습 본문 작성의 선행 조건이다. P02~P10에서 발견한 선택 변경은 decisions에 먼저 반영하고
관련 파일만 맞춘다. 컨테이너 이미지의 동작을 추측해 긴 완성 문서를 먼저 쓰지 않는다.

Kubernetes 배포·kubectl OIDC의 실행 실습은 P11 이후 별도 요청 시 작업 ID·입력·검증 조건을 추가한다.
기본 실습의 완료 조건에는 포함하지 않는다. D20의 참조 설명과 D21의 운영 배포 비교는 유지한다.

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
| D02 | foundations / 1010 | `lab-setup`: 이 덱의 컨테이너 환경은 어떻게 준비하나 | labs README, 08-deploy | 공통 Docker·Colima 준비와 Compose 실행, 자원·주소·CA·정리 위치. kind·kubectl 불필요, 검증한 전제만 명시 |
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
| D20 | integrations / 1190 | `kubernetes-oidc`: kubectl 로그인은 어떻게 연결하나 | 06-k8s-oidc | 후속 선택 실습의 참조 설명. 기준 K8s 인증 설정, public client+PKCE, 인증/RBAC·복구 접근 구분. 기본 실습에 cluster 생성을 요구하지 않음 |
| D21 | operations / 1200 | `deployment`: 실습 배포와 운영 배포는 어떻게 다른가 | 08-deploy | Compose 기본 실습과 운영 Kubernetes·Operator/직접 배포 비교, hostname·proxy·TLS·secret·realm import 한계. K8s 실행은 선택 실습 |
| D22 | operations / 1210 | `storage-and-availability`: 재시작과 장애를 무엇이 견디나 | 05-sessions, 08-deploy | Compose named volume과 DB·캐시·persistent sessions 역할. 단일 인스턴스 실습을 HA 검증으로 쓰지 않음 |
| D23 | operations / 1220 | `observability`: 인증 문제를 어디서 관찰하나 | 09-ops, 10-troubleshooting | 이벤트·관리 이벤트·로그·health/metrics, 비밀값 제외한 진단 예 |
| D24 | operations / 1230 | `backup-and-upgrade`: 설정과 데이터를 어떻게 복구하나 | 09-ops | DB 백업/복구와 realm export 차이, 버전별 업그레이드 근거, 실습 DB 복구 확인 |
| D25 | operations / 1240 | `administration-and-keys`: 관리 권한과 서명 키를 어떻게 관리하나 | 09-ops | master/위임·관리 API·키 교체/구 키 검증 기간 구분 |
| D26 | reference / 1250 | `troubleshooting`: 증상에서 어느 경계를 확인하나 | 10-troubleshooting, P09 | 증상→확인→기대 결과→복구→관련 장. 다른 장의 절차를 전부 복제하지 않음 |
| D27 | reference / 1260 | `glossary`: 용어를 어디서 다시 찾나 | 11-glossary | 새 용어와 본문 링크, 역할이 다른 용어를 합치지 않음 |
| D28 | reference / 1270 | `wrapup`: 무엇을 이해하고 재현했나 | 12-wrapup | 핵심 흐름·실습 완료표·심화 지도. 미실행 항목은 구분 |

D09/D16/D18/D24는 새 실습이 필요하므로 각각 본문 작성 전에 `D09-L`처럼 보조 작업을 만든다.
보조 작업은 labs의 해당 기능만 구현·검증하고 종료하며, 다음 세션에서 MDX를 작성한다.
D19/D20은 우선 선택 기준·구성·진단을 다루는 참조 페이지다. 실행 가능한 완성 실습으로 제공하려면
같은 방식의 보조 작업을 먼저 완료한다. Kubernetes OIDC는 P11 이후 별도 요청 시 실행한다.
그때 IdP의 Compose/cluster 배치와 연결 경계, 같은 클러스터에 둘 경우의 부트스트랩 의존성,
관리자 복구 경로를 명시하고 기존 실습 상태를 무작정 재생성하지 않는다.

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
- [kind 구성](https://kind.sigs.k8s.io/docs/user/configuration/): P04 기록과 후속 선택 실습의 노드·포트 구성
- [Ubuntu Samba AD DC](https://ubuntu.com/server/docs/how-to/samba/provision-samba-ad-controller/): 디렉터리 구축과 확인. 이 가이드는 컨테이너 배포 검증 결과가 아님

## 실행 기록과 재개 방법

작업 상태는 `todo`, `doing`, `blocked`, `done` 중 하나다. `done`은 완료 조건과 검증을 모두 충족한
경우에만 사용한다. 아래 표에 매번 한 행을 추가하고 문서 맨 위의 다음 작업을 갱신한다.
첫 실행은 P01이었다. 미실행 실습은 구현 파일이 존재하더라도 완료한 것으로 간주하지 않는다.

| 작업 | 상태 | 변경 파일 | 검증 결과/근거 | 결정·잔여 문제 | 다음 작업 |
|---|---|---|---|---|---|
| 계획 작성 | done | 이 문서 | diff·참조 경로 확인 | 컨테이너 실행 미착수 | P01 |
| P01 | done | `src/content/docs/keycloak/_baseline.md`, 이 문서, `docs/plans/README.md` | `git diff --check`; 계획·baseline 링크와 원본/목표 slug 대조 | 합의한 학습 순서와 Ubuntu 컨테이너 경계를 baseline에 반영. 기존 index와 00~12의 주요 절 목적지 확정. 버전 유지, 실습·본문 미착수 | P02 |
| P02 | done | `labs/keycloak/decisions.md`, 이 문서 | 2026-09-14 공식 release/registry/package metadata 조회, 지정 download HTTP 200, amd64/arm64 manifest 확인; 추적 파일 `git diff --check`와 새 파일 `git diff --no-index --check`; 문서 내 공식 URL HTTP 확인. image pull·container 실행·자원 실측은 미실행 | Ubuntu 24.04와 amd64/arm64, Keycloak 26.7.3·PostgreSQL 18.6·kind v0.33.0/Kubernetes v1.35.8·Ubuntu Samba 4.19.5·Node 24 의존성을 digest/snapshot/lockfile로 고정. 동일 공개 issuer, loopback NodePort, 분리 CA, volume 수명과 추정 자원 확정. P03에서 Samba 단독 동작과 권한·volume 경계를 실제 검증 | P03 |
| P03 | blocked | `.gitignore`, `labs/keycloak/compose.yaml`, `labs/keycloak/decisions.md`, `labs/keycloak/verification.md`, `labs/keycloak/samba/`, `src/content/docs/keycloak/_baseline.md`, 이 문서, `docs/plans/README.md` | Ubuntu Samba 공식 provision·사용자 흐름과 Ubuntu snapshot/package를 대조. macOS 26.6.2 arm64 + Colima 0.10.3(Ubuntu 24.04.4 VM)에서 빈 volume으로 `verify-p03.sh` 전체 통과: arm64 image build와 Samba `2:4.19.5+dfsg-4ubuntu9.7`, AD provision, LDAPS 조회·alice/bob bind, seed 2회 재실행 결과 동일, force recreate 전후 domain SID·사용자·그룹 동일, healthy 확인. Compose config, shell 구문·실행 비트, ignore, whitespace, 금지 설정·host port 부재 검사 통과. 네이티브 Ubuntu는 **미실행** | `lab-environment` 덱대로 macOS/Colima와 Ubuntu/Docker Engine을 지원 범위로 분리. 기본 capability provision은 SYSVOL ACL `NT_STATUS_ACCESS_DENIED`로 실패했고 `security.*` xattr 근거를 decisions에 먼저 기록한 뒤 최소 `SYS_ADMIN`만 추가. `privileged=false`, 전용 bridge, Docker socket·host port 없음 확인. Ubuntu P03 플랫폼 검증은 사용자 요청으로 보류하며 macOS 결과로 일반화하지 않음. macOS P03 통과 결과를 P04 선행 조건으로 사용할 수 있음 | Ubuntu P03 플랫폼 검증 보류; P04 진행 허용 |
| P04 | done | `labs/keycloak/kind.yaml`, `labs/keycloak/kind/`, `labs/keycloak/k8s/directory-diagnostic.yaml`, `labs/keycloak/verification.md`, 이 문서, `docs/plans/README.md` | kind v0.33.0/Kubernetes·kubectl v1.35.8로 `keycloak-lab` 생성. macOS/Colima 진단 Pod에서 `dc1.ad.keycloak.test` → `172.30.0.10` 해석, `.10:636` 연결, directory CA LDAPS 검색, alice/bob bind 통과. 잘못된 CA TLS 검증과 잘못된 비밀번호 bind 실패. 로컬 load image + `imagePullPolicy: Never`로 진단 명령의 공개 endpoint 의존 없음. P03 결과와 P04 후 SID·사용자·그룹 `cmp` 일치. host current context와 `/etc/hosts` 불변, port는 loopback 한정, 다른 Docker network·Samba volume·CA/secret 유지. shell 구문·server dry-run·whitespace 통과 | Colima 2 CPU/2 GiB는 전체 권장 4 CPU/8 GiB 미달. Supabase 8개와 named volume이 있어 VM 재시작을 동반한 증설은 하지 않음. P04 직후 node 약 575 MiB, pressure 없음, 기존 healthcheck 항목 healthy. P05 전에 중단 시간 합의 후 증설 또는 별도 profile/runtime 필요. Ubuntu P03 및 P04 실제 실행은 미실행 | P05; Ubuntu P03 플랫폼 검증 보류 유지 |

### Compose 전환 계획 갱신

| 작업 | 상태 | 변경 파일 | 검증 결과/근거 | 결정·잔여 문제 | 다음 작업 |
|---|---|---|---|---|---|
| Compose 전환 계획 | done | 이 문서만 | 기존 diff·P01~P04 기록·baseline·decisions 대조, `git diff --check`와 참조 경로 확인 | 사용자 합의에 따라 기본 실습을 Compose로 전환. P04 실행 기록은 당시 결과로 보존하며 위 기록의 다음 작업은 이 행으로 갱신. decisions/baseline 및 실습 구현은 아직 이전 계약이므로 P05-C에서 먼저 정리. 실행 중인 cluster와 기존 파일·volume·CA·secret에는 변경 없음. Ubuntu P03 플랫폼 검증 보류 유지 | P05-C → P05 |
| P05-C | done | `labs/keycloak/decisions.md`, `src/content/docs/keycloak/_baseline.md`, 이 문서 | 2026-09-14 공식 Keycloak hostname/TLS/truststore/container·Docker Compose alias/port/secret/volume/down·PostgreSQL 18 volume·kind delete 문서 및 로컬 kind help 대조. Git 초기 상태 clean. P04 node/network/port, Colima 자원·disk·memory, 실행 중 Supabase와 mount/limit을 읽기 전용 조사. `git diff --check`, 변경 diff와 내부·공식 참조 경로 확인. 배포·cluster/Colima 변경·실습 검증은 미실행 | issuer와 내부 listener를 `keycloak.keycloak.test:30080` 하나로 통일하고 host loopback/hosts와 Compose alias를 분리. web/directory CA, service별 secret mount, Samba/PG18 named volume, 4 CPU/8 GiB·가용 memory 5 GiB·disk 20 GiB 계약 확정. P04 node의 `.20`·`30080`~`30082` 점유를 확인하고 exact cluster 하나의 삭제 전후 보존 절차를 기록. 현재 2 CPU/2 GiB와 Supabase 무제한 workload 때문에 P05 실제 기동 전 사용자 승인 아래 Colima 중단·증설 필요. file-backed secret의 실제 image UID read와 Compose 전체 값은 P05에서 검증. Ubuntu P03 플랫폼 검증 보류 유지 | Compose 기반 P05 |
| P05 | blocked | `labs/keycloak/compose.yaml`, `labs/keycloak/keycloak/`, `labs/keycloak/scripts/`, `labs/keycloak/samba/entrypoint.sh`, `labs/keycloak/decisions.md`, `labs/keycloak/verification.md`, 이 문서 | 사용자 승인 뒤 exact P04 cluster만 삭제하고 보존 상태 대조, default Colima를 삭제 없이 4 CPU/8 GiB로 증설. Supabase 8개 mount·health 복귀 확인. `verify-p05.sh` 전체 통과: PostgreSQL/Keycloak/Samba healthy, 동일 issuer의 container discovery/JWKS와 web CA, LDAPS 양/음성, P03 동일성, UID 1000/999/65534 secret read·read-only mount, inspect env 비노출, PG18 volume, DB/Keycloak 강제 재생성 뒤 realm·진단 유지. host `--cacert` discovery/JWKS와 local-user Authorization Code form 성공. browser는 미실행 | `study` startup import와 local-user를 추가하고 기존 realm은 skip하여 DB 상태를 보존. Samba의 보존 `smb.conf`는 private key를 새 secret target으로 idempotent하게 갱신. 2026-09-14 사용자 결정으로 macOS 관리자 인증과 Chrome Admin Console/local-user 로그인은 후속 보류. Ubuntu P03 플랫폼 검증 보류 유지, macOS 결과로 일반화하지 않음 | 후속 요청에서 macOS CA trust 승인 뒤 browser 2경로 확인; 현재 P05 범위 종료 |
| P06 | blocked | `labs/keycloak/app/`, `labs/keycloak/compose.yaml`, `labs/keycloak/keycloak/seed-app-a.sh`, `labs/keycloak/scripts/prepare-p06-state.sh`, `app-a-leaf.ext`, `verify-app-a.mjs`, `verify-p06.sh`, `labs/keycloak/decisions.md`, `labs/keycloak/verification.md`, 이 문서 | 고정 Node 24.21.0 image와 exact lockfile build·npm audit 취약점 0. 일회성 HTTPS Client seed와 재실행 일치, 앱 UID 1000·read-only secret·inspect env 비노출·loopback 30081 확인. `verify-p06.sh`에서 Authorization Code + PKCE S256 local-user 로그인과 앱 session 통과; 오답 password, 변조 state/nonce, 미등록 redirect 실패 통과. web CA를 명시해 TLS 검증 유지. 실제 Chrome은 미실행 | P05 browser 보류가 P06 구현 착수를 막지 않는다고 명시하고 앱에 bootstrap credential을 주지 않는 별도 seed service를 사용. `openid-client`가 discovery, code 교환, state·nonce·redirect 검증을 담당하며 password grant와 인증서 우회 없음. macOS keychain이 web CA를 신뢰하지 않고 root trust에는 사용자 관리자 인증이 필요하므로 browser 확인 전까지 blocked. P05도 blocked 유지. Ubuntu P03/P06 미실행 유지, macOS 결과로 일반화하지 않음 | 사용자 승인 범위에서 web CA trust 뒤 P05 browser 2경로와 P06 Chrome 앱 로그인 확인; P07은 미착수 |
| P07 | done | `labs/keycloak/app/`, `labs/keycloak/compose.yaml`, `labs/keycloak/scripts/app-b-leaf.ext`, `prepare-p07-state.sh`, `verify-p07.mjs`, `verify-p07.sh`, `labs/keycloak/decisions.md`, `labs/keycloak/verification.md`, 이 문서 | `verify-p07.sh` 전체 통과: exact `jose@6.2.12` build/audit 0, P07 seed 2회 동일, 앱 A credential 1회 뒤 앱 B password 재입력 없는 SSO, API 무토큰·malformed 401/권한 부족 403/허용 200. RS256·고정 iss/aud·필수 exp 검증, 앱 B HTTPS/secret/container hardening과 API host port·secret 부재 확인 | 앱 A/B는 같은 source image와 분리 client/session/TLS secret 사용. `lab-api` audience와 `app-user`/`api-admin` realm role을 seed하고 local-user에는 app-user만 부여. 최초 Keycloak CLI seed는 image에 없는 `awk`로 실패해 생성 객체를 보존한 채 단일 Node Admin REST seed로 교체하고 전체 재검증. 기존 두 named volume·domain·CA·secret·P03~P06 기록과 Supabase 8개 workload 상태 동일. P05·P06 browser와 Ubuntu P03은 blocked 유지하며 macOS 결과로 일반화하지 않음 | P08은 미착수; 요청된 P07 범위 종료 |
| P08 | done | `labs/keycloak/app/Dockerfile`, `seed-p08.mjs`, `labs/keycloak/compose.yaml`, `labs/keycloak/scripts/verify-p08.mjs`, `verify-p08.sh`, `labs/keycloak/decisions.md`, `labs/keycloak/verification.md`, 이 문서 | Keycloak 26.7 guide와 26.7.3 LDAP/group/OIDC mapper source·Admin sync path 대조. `verify-p08.sh` 전체 통과: LDAPS-only READ_ONLY provider와 group mapper/role/claim seed 2회 동일, alice/bob Keycloak Code+PKCE 로그인, Keycloak membership, RS256·iss·aud·exp 검증 token의 groups/realm roles, 앱 A→API alice user/admin 200·bob user 200/admin 403, 무토큰 401 | `vendor=ad`는 Samba AD 호환 schema 선택이며 Microsoft AD DS 검증이 아님. 첫 실행은 seed 뒤 진단 script mount의 Node module 탐색 실패; 데이터 삭제 없이 mount target만 고쳐 전체 재실행 통과. 직접 영향받는 local-user 앱 A→API 200/403만 재검증하고 전체 P07 SSO는 반복하지 않음. 두 volume·SID·CA·secret·P03~P07 기록과 Supabase 8개 상태 동일. P05·P06 browser와 Ubuntu P03 blocked/보류 유지 | P09는 미착수; 요청된 P08 범위 종료 |
| P09 | done | `labs/keycloak/app/Dockerfile`, `seed-p09.mjs`, `labs/keycloak/compose.yaml`, `labs/keycloak/scripts/verify-p09.mjs`, `verify-p09.sh`, `labs/keycloak/decisions.md`, `labs/keycloak/verification.md`, 이 문서 | 26.7 LDAP import/sync·session/refresh guide와 26.7.3 MSAD mapper·TokenManager·user-cache clear API 대조. `verify-p09.sh` 전체 통과: group 제거, Samba alice disable, exact Samba stop을 독립 실행하고 새 로그인·새 로그인 전후 refresh·기존 JWT·앱 session을 분리 관찰. 매 시나리오와 최종 P08 정상 상태 복구 통과 | group sync 직후 `DEFAULT` cache가 이전 membership을 반환해 공식 user-cache clear를 sync 뒤 명시. group 변경은 새/refresh token만 admin 권한 제거, disable은 새 로그인/refresh 거부, LDAP outage는 새 로그인 거부와 기존 refresh 성공을 관찰; 기존 JWT와 앱 session token은 세 경우 모두 exp 전 유지. 초기 marker 권한 실패 2회와 cache 발견 실패도 source 변경 전 또는 trap으로 복구. Samba는 Microsoft AD DS가 아닌 4.19.5 AD 호환 대역. 두 volume·SID·CA·secret·P03~P08 기록과 Supabase 8개 동일. P05·P06 browser와 Ubuntu P03 blocked/보류 유지 | P10은 미착수; 요청된 P09 범위 종료 |
