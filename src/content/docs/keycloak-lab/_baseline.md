# keycloak-lab 덱의 기준과 경계

`keycloak-lab` 덱의 실습 절차·환경 계약·검증 범위를 고치기 전에 읽는다. 다른 덱에는 해당하지 않는다.

## 이 덱의 역할

[Keycloak 덱](/keycloak/)의 개념을 Docker Compose 환경에서 순서대로 재현하는 **guided 실습 덱**이다.
개념 설명은 다시 늘리지 않고 Keycloak 덱을 링크한다. 이 덱은 어떤 파일을 읽고 어떤 설정을 바꾸며
어떤 결과가 달라지는지에 집중한다.

```text
keycloak:      인증 생태계 · OIDC · client · token · 디렉터리 · 연동 · 운영 개념
keycloak-lab:  Compose 환경 준비 · 코드 지도 · client 로그인 · SSO/API · Samba · LDAP 로그인 · group 권한
```

실습 순서는 guided stage와 같다: base → app-a → app-b → api → ldap → groups. 페이지는
환경 준비, 로컬 로그인과 SSO, 외부 디렉터리의 세 그룹으로 묶고 각 페이지는 다음 stage로 링크한다.

버전·프로토콜 동작·운영 판단의 기준 표와 "반드시 유지할 구분"은 `keycloak/_baseline.md`가 정본이다.
같은 사실을 두 baseline에 복제하지 않고, 이 덱은 실습 환경 계약과 검증 범위만 관리한다.

## 서술 규칙

- 실습 덱이므로 `<TermIntro>`는 의무가 아니다. 기존 페이지의 `<TermIntro>`는 유지하되 새 절에서는
  쓰는 자리 바로 앞에서 용어를 풀어 설명한다.
- 정답 설정만 보여 주지 않고 무엇을 적용했을 때 로그인·token·API 결과가 어떻게 달라지는지를 남긴다.
- 실습 명령과 설정의 원본은 `labs/keycloak/`이다. 본문은 검증된 결과와 필요한 부분만 설명하고,
  사이트 검사 통과를 컨테이너 실습 성공으로 취급하지 않는다.
- 페이지를 나누거나 이름을 바꾸면 Keycloak 덱의 "이어 간다" 링크와 `labs/keycloak/README.md`의
  사이트 링크, `src/data/keycloak-legacy-routes.json`의 target도 함께 확인한다.

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
- 실습 명령과 설정의 원본은 `labs/keycloak/`에 둔다. 학습자는 `keycloak/`의 공개 JSON과 `app/` 코드를
  읽고 바꾸며, 환경 준비·Admin REST 적용·검증은 `internal/`로 분리한다. 빈 상태의 `guided`는
  base→app-a→app-b→api→ldap→groups를 진행하고 기존 인자 없는 시작은 완성 `ready` 환경을 만든다.
  stop/resume은 기록된 stage까지만 복원하며 설정을 다시 seed하지 않는다. 본문은 검증된 결과와 필요한 부분만 설명하고,
  사이트 검사 통과를 컨테이너 실습 성공으로 취급하지 않는다.

Samba 단독 P03과 Compose 기본 실습은 macOS/Colima에서 검증됐다. P11은 실제 Compose 전체 초기화 뒤
로컬 SSO/API, Samba 로그인·그룹 매핑·refresh, 보존 중단·재개를 빈 상태에서 다시 재현했다. 과거 P04의
kind-to-Samba 실행 결과는 이력일 뿐이며 해당 추적 자산은 제거됐다. 현재 lab은 Compose 전용이고 P04를
선행 조건이나 검증 근거로 사용하지 않는다. macOS에서는 web CA trust 뒤
실제 Chrome의 Admin Console·Account Console과 앱 A Authorization Code + PKCE 로그인도 확인했다.
네이티브 Ubuntu는 **P03 플랫폼 검증부터 보류**다. macOS 결과를 Ubuntu나 Microsoft AD DS 결과로
일반화하지 않으며, 각 환경에서 실제로 재현한 범위와 예정된 명령을 구분한다.

