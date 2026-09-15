# lab-environment 덱의 기준

`lab-environment` 덱을 고치기 전에 읽는다. 다른 덱에는 해당하지 않는다.

## 이 덱의 역할

이 덱은 여러 기술 덱에서 반복해서 필요한 **실습 환경 준비와 정리 방법**을 운영체제·도구별로 모은다.

- 도구별 환경: 로컬 runtime과 CLI 준비, 생성, 상태 확인, 일시 중단, 삭제, 트러블슈팅
- 같은 도구의 운영체제별 차이는 한 장 안에서 각 소제목의 탭으로 나란히 보여 준다.
- 운영체제와 무관하게 같은 명령은 별도 공통 장으로 빼지 않고 해당 도구 장에 이어서 설명한다.
- 개별 덱: 필요한 CPU·메모리·디스크, 고정 버전, 적용할 매니페스트, 실습 시나리오만 설명

다른 덱에서 Docker·kind·kubectl·Helm의 일반 준비법을 다시 길게 쓰지 않는다. 이 덱의 준비 장을
링크하고 그 실습에만 필요한 차이만 남긴다. Kubernetes가 아닌 실습 환경도 앞으로 이 덱에 추가한다.

## kind 환경의 기준과 안전 경계

**2026년 8월** 기준이며 2026-08-20에 공식 문서로 확인했다.

- macOS 기본 경로는 Colima + Docker CLI다. Docker Desktop은 대안으로 함께 설명한다.
- Ubuntu는 Docker Engine 공식 apt 저장소 설치를 기본 경로로 삼는다.
- Docker·kind·kubectl 설치 명령을 본문에 복제하지 않는다. 공식 문서의 정확한 설치 절을 링크하고,
  독자가 현재 명령과 지원 버전을 그곳에서 확인해 실행하도록 한다.
- kubectl shell 설정은 공식 quick reference와 운영체제별 설치 문서를 따른다. `k` alias를 소개하되,
  문서의 cluster 조작 예시는 대상이 명확하도록 `kubectl --context kind-<name>`을 유지한다.
- 실습 클러스터 이름은 예시에서도 반드시 명시하고, `kubectl` 예시는 `--context kind-<name>`을 붙인다.
- 사내 CA는 클러스터 생성 직후 workload 설치 전에 kind 노드에 추가한다. 클러스터를 다시 만들면 재적용해야
  하며, CA trust와 `HTTP_PROXY`·`HTTPS_PROXY`·`NO_PROXY` 설정을 같은 문제로 설명하지 않는다.
- 삭제 전에 `kind get clusters`로 정확한 이름을 확인한다. `kind delete clusters --all`,
  `docker system prune`, Colima 전체 삭제는 일반 cleanup으로 안내하지 않는다.
- 일시 중단과 폐기를 구분한다. `kind delete cluster`는 클러스터 데이터가 필요 없을 때만 쓴다.

## Helm CLI의 기준과 안전 경계

**2026년 8월** 기준이며 2026-08-19에 Helm 공식 문서와 installer를 확인했다.

- Helm 설치 명령이나 installer script를 본문에 복제하지 않는다. 운영체제별 탭에서 Helm 공식 설치
  문서로 연결하고, 독자가 현재 major와 설치 방법을 그곳에서 확인해 실행하도록 한다.
- Helm 명령에는 가능한 한 `--kube-context`를 붙여 대상 cluster를 고정한다.
- Helm CLI 삭제와 cluster의 `helm uninstall`을 구분한다. 일반 cleanup에서 다른 release를 함께 지우지 않는다.

## Docker Compose와 브라우저 확인의 기준과 안전 경계

**2026년 9월** 기준이며 2026-09-15에 keycloak-lab에서 검증된 절차를 일반화했다.

- Compose 장은 runtime·Compose plugin·buildx plugin 준비 확인과 회사 프록시 대응만 다룬다. 실습별 자원
  계약, project 이름, 시작·중단·초기화 스크립트, `CORP_CA_FILE` 같은 변수의 실제 처리 방식은 각 실습 덱이 맡는다.
- 회사 프록시는 image pull(daemon `proxies`)과 image build(shell 프록시 변수)를 구분해 설명하고, TLS 재서명
  proxy의 CA는 build 단계에만 신뢰시키며 완성 image에 넣지 않는 원칙을 유지한다.
- 브라우저 장은 hosts 항목·프록시 예외·로컬 CA 등록·제거를 다루며, hostname·port·CA 파일 경로·nickname은
  예시 값(`example.test`, `example-lab-ca`)으로 두고 실습 덱이 실제 값을 지정한다.
- CA 등록은 선택으로 서술한다. 인증서 경고를 넘기면 동작한다는 사실을 지우지 않는다.
- 검증 범위: macOS의 Colima·buildx 준비, keychain 등록·삭제, Chrome 로그인은 keycloak-lab에서 실제 확인했다.
  Ubuntu의 NSS DB 등록·삭제는 명령 경로만 제공하며 미실행이다. Ubuntu에서는 회사 프록시 예외 추가 뒤
  브라우저 접속만 확인했다.

## 서술 규칙

- 각 본문 장 첫머리에 `<TermIntro>`를 둔다.
- Compose·브라우저 장의 운영체제 탭도 `<Tabs syncKey="operating-system">`와 `macOS`·`Ubuntu` label을 그대로 쓴다.
- kind 장의 목차는 **Docker → Colima(macOS) → kubectl → kind**처럼 다시 찾기 쉬운 도구 이름으로 구성하고,
  각 도구 안에서는 설치 → 준비 확인 순서를 지킨다. 이후 생성 → 확인 → 사용 → 운영체제별 중단 탭 → 정리 → 정리 확인으로 이어 간다.
- 복사해서 실행하는 명령은 대상을 이름으로 제한한다. 광범위한 삭제와 암묵적인 current context를 피한다.
- 외부 설치 링크를 바꿀 때는 kind·Kubernetes·Docker·Colima·Helm 공식 문서의 anchor까지 다시 확인한다.
