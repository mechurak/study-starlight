# lab-environment 덱의 기준

`lab-environment` 덱을 고치기 전에 읽는다. 다른 덱에는 해당하지 않는다.

## 이 덱의 역할

이 덱은 특정 기술을 설명하지 않고, 여러 덱의 hands-on 실습이 공유하는 **환경 수명주기**를 맡는다.

- 공통 원칙: 실습별 격리 단위, 이름, 현재 대상 확인, 보존과 폐기의 구분, 정리 검증
- 도구별 환경: 로컬 런타임과 CLI 설치, 생성, 상태 확인, 일시 중단, 폐기, 트러블슈팅
- 개별 덱: 필요한 CPU·메모리·디스크, 고정 버전, 적용할 매니페스트, 실습 시나리오만 설명

다른 덱에서 Docker·kind·kubectl의 일반 설치법을 다시 길게 쓰지 않는다. 이 덱의 해당 장을 링크하고,
그 실습에만 필요한 차이만 남긴다. Kubernetes가 아닌 실습 환경도 같은 수명주기 계약으로 이 덱에 추가한다.

## kind 환경의 기준과 안전 경계

**2026년 8월** 기준이며 2026-08-19에 공식 문서로 확인했다.

- kind **v0.32.0** 안정 릴리스와 kubectl 안정 릴리스 설치 경로를 사용한다.
- macOS 기본 경로는 Colima + Docker CLI다. Docker Desktop은 대안으로 함께 설명한다.
- Ubuntu는 Docker Engine 공식 apt 저장소 설치를 기본 경로로 삼는다.
- 실습 클러스터 이름은 예시에서도 반드시 명시하고, `kubectl` 예시는 `--context kind-<name>`을 붙인다.
- 삭제 전에 `kind get clusters`로 정확한 이름을 확인한다. `kind delete clusters --all`,
  `docker system prune`, Colima 전체 삭제는 일반 cleanup으로 안내하지 않는다.
- 일시 중단과 폐기를 구분한다. `kind delete cluster`는 클러스터 데이터가 필요 없을 때만 쓴다.

## 서술 규칙

- 각 본문 장 첫머리에 `<TermIntro>`를 둔다.
- 절차는 **준비 → 생성 → 확인 → 사용 → 정리 → 정리 확인** 순서로 쓴다.
- macOS와 Ubuntu에서 갈리는 명령은 `<Tabs>`로 나란히 둔다.
- 복사해서 실행하는 명령은 대상을 이름으로 제한한다. 광범위한 삭제와 암묵적인 current context를 피한다.
- 버전 숫자를 바꿀 때는 kind·Kubernetes·Docker·Colima 공식 문서를 다시 확인한다.
