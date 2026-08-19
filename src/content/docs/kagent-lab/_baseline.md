# kagent 실습 덱의 기준

`kagent-lab` 덱을 고치기 전에 읽는다. 다른 덱에는 해당하지 않는다.

## 이 덱의 역할

전용 kind 클러스터에서 kagent를 설치하고, 선언형 Agent와 MCP tool을 만들고, A2A로 호출하고,
상태와 로그로 실패를 설명한 뒤 안전하게 지우는 **반복 가능한 입문 실습**이다.

```text
lab-environment: Docker · kind · kubectl 준비와 클러스터 일반 사용
kagent-lab:      kagent 설치 · Agent 실행 · MCP · A2A · debug · cleanup
agent-platform:  사내 catalog · ACL · approval · runtime adapter 설계
```

Docker·kind·kubectl의 운영체제별 설치 명령은 복제하지 않는다. `lab-environment` 덱으로 연결한다.
사내 포털과 제품 중립 배포 계약은 `agent-platform` 덱으로 넘긴다.

## 기준 환경과 버전

**2026년 8월 19일**에 kagent 공식 문서를 확인했다.

- kagent 공식 quickstart의 CLI 권장 경로와 `demo` profile을 사용한다.
- 확인 당시 공식 설치 문서의 기본 CLI release는 `0.9.9`다. 독자는 실행 전에 `kagent version`을 기록한다.
- Agent API는 `kagent.dev/v1alpha2`, kmcp의 `MCPServer` 예시는 `kagent.dev/v1alpha1`이다.
- 실습 클러스터 이름은 `kagent-lab`, context는 `kind-kagent-lab`, namespace는 `kagent`로 고정한다.
- 기본 모델 연결은 quickstart와 같은 OpenAI provider를 사용한다. 다른 provider는 공식 설치 문서로 연결한다.

API가 alpha이고 설치 경로가 빠르게 바뀌므로 모든 본문 페이지는 `status: review`로 둔다. 명령·CRD schema를
바꿀 때는 quickstart, API reference, release notes를 함께 다시 확인한다.

## 안전 경계

- 다른 Kubernetes cluster에서 실행하지 않는다. kagent 설치 전 `kubectl config current-context`가
  정확히 `kind-kagent-lab`인지 확인한다.
- API key 값을 문서·Git·매니페스트에 직접 적지 않는다. 환경 변수에서 설치 과정이 만드는 Secret으로 넘긴다.
- 처음 만드는 Agent에는 조회 tool만 준다. apply·delete 같은 변경 tool은 별도 승인 없이는 붙이지 않는다.
- MCP server와 BYO image는 code 실행 경계다. community image·package를 운영 cluster에서 그대로 실행하지 않는다.
- `kagent bug-report` 산출물은 외부 공유 전에 Secret, token, prompt, 내부 주소가 없는지 검사한다.
- `kagent uninstall`은 cluster 전체의 kagent resource를 지운다. 이 덱에서는 전용 kind cluster 삭제를 기본 정리로 삼는다.

## 장의 공통 형식

각 실습 장은 가능한 한 다음 순서로 쓴다.

1. 이번 장의 성공 조건
2. 실행 명령 또는 manifest
3. 기대 상태
4. 관찰 포인트
5. 실패했을 때 먼저 볼 상태·condition·로그
6. 다음 장에서 환경을 재사용할지, 지금 지울지

UI 절차만 쓰지 않는다. 같은 결과를 Kubernetes resource나 CLI에서 확인하는 방법을 함께 둔다.

