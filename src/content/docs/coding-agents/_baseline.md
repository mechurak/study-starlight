# Claude Code · Codex 실전 덱의 기준

이 덱을 수정하기 전에 읽는다.

## 독자·학습 결과·범위

독자는 Git·Markdown·기본 명령 실행을 알고, 자신의 프로젝트에서 Codex와 Claude Code를 함께 쓴다.
이 덱을 참고해 그 프로젝트의 AGENTS.md와 작업 지침을 개선하고, 큰 작업을 계획해 여러 세션과
도구에 걸쳐 구현·검증·인계할 수 있게 한다. 이 학습 사이트를 운영하는 법에 한정하지 않는다.
기본 경로는 공유 지침 개선 → 제품별 탐색 → 작업 계획 → 실행과 재개다.
공개 레포 사례와 monorepo는 선택 심화이며 API 개발·모델 성능 비교·전체 설정 레퍼런스는 범위 밖이다.

## 현재성 기준

2026-09-19에 공식 문서·블로그와 공개 레포의 실제 파일을 대조했다. 별도 Codex·Claude Code
세션을 실행해 자동 로딩·권한·컨텍스트 복원을 실측한 것은 아니다. 예시 서비스도 구현 실습이
아니라 설명용 가정이다. 실제 관찰과 예상 결과를 구분한다.

- OpenAI AGENTS: <https://learn.chatgpt.com/docs/agent-configuration/agents-md>
- Anthropic memory: <https://code.claude.com/docs/en/memory>
  (v2.1.277 이상에서 조건부 AGENTS 직접 로딩. 제공자·설정에 따른 예외가 있다.)
- Anthropic best practices: <https://code.claude.com/docs/en/best-practices>
  (인터뷰 → 스펙 파일 → 새 세션 구현, 완료 전 별도 컨텍스트의 계획 대조 리뷰를 근거로 인용한다.)
- Anthropic hooks: <https://code.claude.com/docs/en/hooks-guide>
- OpenAI sandbox·승인: <https://learn.chatgpt.com/docs/sandboxing>,
  <https://learn.chatgpt.com/docs/agent-approvals-security>
- OpenAI 지침 재검토: <https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra>
- OpenAI 장기 작업: <https://developers.openai.com/blog/run-long-horizon-tasks-with-codex>
  (명세·계획·실행 규칙·상태 네 파일. 스펙과 계획 분리의 근거로 인용한다.)
- OpenAI harness engineering: <https://openai.com/index/harness-engineering/>
  (약 100줄 AGENTS 목차, `docs/exec-plans/active·completed`에 진행 기록과 함께 체크인.
  직접 접근이 차단되는 환경이 있어 2차 요약과 검색 결과로 대조했다. 작업 크기 기준은 이 글이 아니라
  ExecPlan cookbook의 AGENTS 문구에서 인용한다.)
- Anthropic 장기 작업: <https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents>
- Anthropic 후속 실험: <https://www.anthropic.com/engineering/harness-design-long-running-apps>
- OpenAI ExecPlan: <https://developers.openai.com/cookbook/articles/codex_exec_plans>
  (페이지 본문에는 배너가 없고 cookbook 저장소 `registry.yaml`에 `archived: true`로 분류.
  과거 공식 사례이며 현행 필수 규격이 아니다.)

공개 레포의 관찰 근거는 public-repositories.mdx의 커밋 고정 링크로 남긴다.
지침이 있다는 사실을 생산성·실제 준수·전체 조직의 운영 방식에 대한 증거로 확대하지 않는다.

## 서술 규칙

- 프로젝트 사실·제약·완료 기준을 공유하고, 도구별 로딩과 모델별 보완책을 구분한다.
  AGENTS 정본과 CLAUDE import는 호환성을 위한 운영안이며 유일한 공식 구성은 아니다.
- 다른 프로젝트에 적용할 원리와 이 저장소의 정책을 구분한다. 이 저장소에서는 새 계획 파일을
  명시적으로 요청받았을 때만 생성하고, 네 자리 번호와 문서별 상태를 쓴다.
  실제 관리 규칙은 docs/plans/README.md를 유지한다. 덱 개선이 루트 운영 정책 변경을 뜻하지 않는다.
- 예시는 기존 업무 서비스의 CSV 내보내기를 기본으로 한다. 경로·제한값·명령은 가상임과 교체할
  값을 밝힌다. 실행 가능한 완성 앱이나 실제 통과한 테스트처럼 소개하지 않는다.
- Plan Mode·작업 문서·세션 재개를 구분한다. 다른 도구도 알아야 할 결정은 공유 가능한 곳에 둔다.
  개인 기억이나 대화 요약을 공유 정본으로 설명하지 않는다.
- 마일스톤은 검증 가능한 결과 단위다. 전체 완료를 맡겼으면 허용된 다음 작업을 이어 가고,
  새 요구·외부 행동의 권한과 구현 중의 일상적인 선택을 구분한다. 이 원칙의 본문 설명은
  work-plans의 실행 권한 절 한 곳에 두고 다른 페이지는 링크한다.
- 계획은 목표·판단 기준·현재 상태를 전달한다. 모든 클릭·명령·검토 단계의 고정 레시피로 만들지
  않는다. PRD·결정 문서·별도 로그를 일괄 생성하지 않고 기존 정본을 우선한다.
  스펙(무엇·왜·완료 판정)과 계획(순서·의존)은 역할을 구분해 설명하고, 분리는 조건이 있을 때 권한다.
- 지침은 모델이 읽는 권고이고 강제는 hook·권한·sandbox 설정이 맡는다는 구분을 유지한다.
  설정 항목 전체는 범위 밖이며 공식 문서 링크로 대신한다.
- 완료 주장 전에 별도 컨텍스트가 계획과 diff를 대조하는 리뷰 단계를 둔다. 정확성·요구 누락만
  보고하게 하고 모든 지적을 반영하라고 쓰지 않는다.
- 계획 머리의 위치 필드는 docs/plans/README.md 템플릿과 같은 `지금 위치`로 쓴다.
- 이미 로드된 AGENTS를 일반 요청마다 다시 읽으라고 하지 않는다. 하위 지침·연결 문서는
  작업 조건에 따라 읽는다. 반복 검사·승인·위임은 실제 필요와 효과로 판단한다.
- ExecPlan 비교는 work-plans에서 한 번만 설명한다. 참고 링크는 해당 주장 가까이에 둔다.

각 학습 본문은 Thesis·TermIntro와 하나의 중심 질문을 가지며 번호 없는 파일명·제목·URL을 쓴다.
옛 두 페이지의 URL·절 북마크 호환은 src/data/coding-agents-legacy-routes.json이 소유한다.
