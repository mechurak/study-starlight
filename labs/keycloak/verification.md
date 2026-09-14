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

## Ubuntu P03 플랫폼 검증 보류

네이티브 Ubuntu에서는 `decisions.md`에 고정한 Ubuntu 24.04, rootful Docker client/server 29.8.0,
Docker Compose plugin 5.5.1을 준비하고 같은 `./samba/verify-p03.sh`를 실행한다. 스크립트는 최초
provision을 확인하기 위해 기존 `keycloak-lab-samba-data` volume이 있으면 중단한다. 이 검증은 사용자가
나중에 별도로 수행하기로 했으며 현재도 **미실행**이다. macOS 결과를 Ubuntu 결과로 일반화하지 않는다.
사용자 요청에 따라 macOS/Colima의 P03 전체 통과를 선행 조건으로 P04를 진행했지만, 이 보류 항목은
Ubuntu에서 실제 실행할 때까지 유지한다.

## P04 kind에서 Samba 연결

| 환경 | 상태 | 실제 범위 |
|---|---|---|
| macOS 26.6.2 arm64 + Colima 0.10.3 | 통과 | kind v0.33.0, Kubernetes/kubectl v1.35.8, 전용 cluster·bridge·CoreDNS·진단 Pod |
| 네이티브 Ubuntu 24.04 + rootful Docker Engine | 미실행 | P03 플랫폼 검증과 별도로 실제 실행 결과를 기록해야 함 |

다음 공식 계약을 구현 근거로 확인했다.

- kind configuration의 digest 고정 node image와 loopback `extraPortMappings`, NodePort와 같은
  container port를 쓰는 규칙
- kind quick start의 이름 있는 cluster·격리 kubeconfig·`--wait`·로컬 image load 흐름
- Kubernetes의 CoreDNS ConfigMap을 통한 cluster DNS 사용자 정의와 `reload` 동작

현재 Colima profile은 CPU 2개·메모리 2 GiB·disk 100 GiB로 전체 실습 권장값인 CPU 4개·메모리
8 GiB보다 작았다. P04 직전에는 Samba 약 188 MiB와 별도 Supabase container 8개가 합계 약 736 MiB를
사용했고, Supabase의 PostgreSQL·Storage named volume과 bind mount가 있었다. Colima 자원 변경은 VM을
재시작해 이 workload들을 모두 중단시키므로 이번에는 profile을 변경하거나 삭제·초기화하지 않았다.

P04는 Keycloak·PostgreSQL·앱을 올리지 않고 128 MiB limit의 진단 Pod만 추가했다. 생성 직후 kind node는
약 575 MiB를 사용했고 `MemoryPressure=False`, `DiskPressure=False`, `PIDPressure=False`, `Ready=True`였다.
기존 Supabase container들은 계속 실행됐고 healthcheck가 있는 항목은 모두 healthy였다. 이 결과는 현재
P04 범위가 2 GiB profile에서 통과했다는 뜻일 뿐 P05 이후 전체 workload에 충분하다는 뜻이 아니다.
P05 전에 다른 workload의 허용 중단 시간을 정한 뒤 `colima stop`과 CPU 4개·메모리 8 GiB 재시작으로
증설하거나, 전체 실습을 별도 profile/runtime에서 실행해야 한다. 기존 profile이나 volume을 삭제할
필요는 없다.

기존 Samba container·named volume·directory CA와 secret을 유지한 상태에서 다음을 실행했다.

```bash
cd labs/keycloak
./kind/verify-p04.sh
```

실제 확인 결과는 다음과 같다.

- cluster `keycloak-lab`과 격리 kubeconfig의 context `kind-keycloak-lab`을 사용했다. 호스트의
  current context는 전후 모두 unset이었고 `/etc/hosts`도 바뀌지 않았다.
- control-plane은 기존 kind bridge를 유지하면서 Compose 소유 bridge `keycloak-lab`에만 추가 연결됐고,
  Samba는 `172.30.0.10`, control-plane은 `172.30.0.20`이었다. 다른 Docker network는 수정하지 않았다.
- CoreDNS의 실습 전용 hosts block에서 `dc1.ad.keycloak.test`가 `172.30.0.10`으로 해석됐다. 이후 웹
  이름 세 개도 decisions의 `172.30.0.20` 경계를 사용하도록 함께 고정했다.
- 진단 Pod에서 `172.30.0.10:636` 직접 TLS 연결, directory CA를 사용한 LDAPS 검색,
  `alice`와 `bob` bind가 성공했다.
- 같은 Pod에서 directory CA가 없는 system CA bundle로 TLS 검증이 실패했고, 고정된 오답 비밀번호로
  `alice` bind가 실패했다.
- 진단 이미지는 P03의 로컬 `keycloak-lab-samba:4.19.5-ubuntu24.04`를 node에 직접 load했고 Pod는
  `imagePullPolicy: Never`를 사용했다. 진단 명령은 cluster DNS와 `172.30.0.10:636`만 사용해 공개
  registry·DNS·서비스 endpoint 없이 실행됐다. 도구와 kind node image의 최초 준비 단계는 공식
  download/registry 접근이 필요하다.
- P03의 `before-recreate.txt`와 P04 뒤 `verify-directory` 결과를 `cmp`로 비교해 domain SID
  `S-1-5-21-2785298756-3808558117-572789873`, 사용자 `alice`·`bob`, 그룹
  `app-users(alice,bob)`·`api-admins(alice)`가 유지됐음을 확인했다.
- `30080`~`30082`의 kind port mapping은 모두 host `127.0.0.1`에만 bind됐다. Samba host port는
  추가하지 않았다.

비밀번호·개인키를 제외한 상세 실행 산출물은 `.state/verification/p04/`에 있다. 이 결과를 Ubuntu
P03 또는 Ubuntu P04의 실제 결과로 사용하지 않는다.
