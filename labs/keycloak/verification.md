# Keycloak 실습 검증 기록

확인일: **2026-09-14**

실제 실행한 환경과 아직 실행하지 않은 환경을 분리한다. 비밀번호·개인키와 긴 원본 로그는 기록하지
않으며, 로컬 상세 산출물은 Git에서 제외한 `labs/keycloak/.state/verification/`에 둔다.

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

## P03 재개 조건

네이티브 Ubuntu에서는 `decisions.md`에 고정한 Ubuntu 24.04, rootful Docker client/server 29.8.0,
Docker Compose plugin 5.5.1을 준비하고 같은 `./samba/verify-p03.sh`를 실행한다. 스크립트는 최초
provision을 확인하기 위해 기존 `keycloak-lab-samba-data` volume이 있으면 중단한다. 미실행 상태에서는
P03을 `done`으로 바꾸거나 P04를 시작하지 않는다.
