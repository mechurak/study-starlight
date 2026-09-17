# Claude Code · Codex 실전 덱의 기준

이 덱을 수정하기 전에 읽는다.

## 독자·학습 결과·범위

독자는 Git·Markdown·기본 명령 실행을 알지만 이 사이트와 공유 지침 설계는 처음인 동료다.
단일 저장소에서 공유 규칙을 만들고, 작은 학습 덱을 요청·리뷰·검증·재개할 수 있게 한다.
기본 경로는 공유 지침 → 지침 탐색 → 작업 계획 → 실행과 재개이며 monorepo는 선택 심화다.
API 개발, 모델 성능 비교, 제품별 전체 설정·권한 레퍼런스는 범위 밖이다.

## 현재성 기준

2026-09-18에 다음 공식 근거와 저장소 파일을 대조했다. 별도 Codex·Claude Code 세션을
실행해 자동 로딩·권한·컨텍스트 복원을 실측한 것은 아니다. 본문은 문서가 보장하는 핵심 경계와
직접 확인하는 방법을 설명한다. 모델별 성향·요금제별 기본 권한처럼 이 학습 경로에 불필요하고
변하기 쉬운 세부 단정은 두지 않는다.

- OpenAI AGENTS: <https://learn.chatgpt.com/docs/agent-configuration/agents-md>
- Anthropic memory: <https://code.claude.com/docs/en/memory>
- Anthropic best practices: <https://code.claude.com/docs/en/best-practices>
- OpenAI ExecPlan: <https://developers.openai.com/cookbook/articles/codex_exec_plans>
  (원문 archived 표시. 자기완결 계획의 과거 공식 사례로 인용한다.)

## 서술 규칙

공유 지침·도구별 어댑터·검사 장치를 구분한다. AGENTS를 공유 정본으로 두는 것은 이 덱의 운영안이다.
제품 탐색·import 동작과 이 저장소의 선택을 혼동하지 않는다. 실제 세션 로드를 확인하지 않았다면
문서 확인이라고 쓴다. 개인 기억·대화의 요약이 저장소 정본을 대체한다고 설명하지 않는다.

예시는 단일 사이트가 기본이다. 가상 package와 명령은 가상임과 교체할 값을 명시한다.
작은 작업에 PRD·changelog·decision 문서를 일괄 생성하지 않는다. 계획은 docs/plans/README.md를 따른다.
ExecPlan 비교는 work-plans에서 한 번만 설명한다. 마일스톤은 작업·검증·기록의 단위이며
실행 범위는 사용자 요청으로 정한다. 전체 완료이면 허용된 다음 작업을 이어 간다.

각 학습 본문은 Thesis·TermIntro와 하나의 중심 질문을 가지며 번호 없는 파일명·제목·URL을 쓴다.
옛 두 페이지의 URL·절 북마크 호환은 src/data/coding-agents-legacy-routes.json이 소유한다.
