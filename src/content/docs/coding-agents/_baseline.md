# Claude Code · Codex 실전 덱의 기준

`coding-agents` 덱을 고치기 전에 읽는다.

이 덱은 Claude Code와 Codex를 실제 저장소에서 함께 쓰며 반복해서 확인할 **운영 패턴**을 모은다.
제품 기능을 나열하는 설명서가 아니라, 어떤 구성을 택할지와 어디서 실패하는지를 중심으로 쓴다.

## 현재성 기준

**2026년 9월 4일**에 다음 공식 문서와 사례를 확인했다.

- OpenAI 지침 파일: <https://learn.chatgpt.com/docs/agent-configuration/agents-md>
  (구 주소 `developers.openai.com/codex/guides/agents-md`는 이곳으로 영구 리다이렉트된다)
- OpenAI 작업 방식: <https://learn.chatgpt.com/guides/best-practices>,
  <https://learn.chatgpt.com/docs/long-running-work> (ChatGPT·Codex 공용 goals 문서 — 인용할 때 주어를 Codex로 좁히지 않는다)
- OpenAI 실행 계획: <https://developers.openai.com/cookbook/articles/codex_exec_plans>
  (`PLANS.md`·ExecPlan. best-practices가 직접 링크하는, `docs/plans/`의 가장 가까운 공식 대응물)
- Anthropic 지침 파일: <https://code.claude.com/docs/en/memory>
- Anthropic 작업 방식: <https://code.claude.com/docs/en/best-practices>
- Anthropic 기능 선택: <https://code.claude.com/docs/en/features-overview>
- Anthropic monorepo 설정: <https://code.claude.com/docs/en/large-codebases>
- Anthropic compaction 뒤 남는 것: <https://code.claude.com/docs/en/context-window#what-survives-compaction>
- Anthropic 완료 조건 loop: <https://code.claude.com/docs/en/goal>
- OpenAI 장시간 작업 사례: <https://developers.openai.com/blog/run-long-horizon-tasks-with-codex>,
  <https://developers.openai.com/blog/automating-repetitive-work-at-openai-with-codex>
- Anthropic 내부 활용 사례: <https://claude.com/blog/how-anthropic-teams-use-claude-code>
- AGENTS.md 스펙 사이트: <https://agents.md/> — "가장 가까운 파일을 자동으로 읽는다"는 문구는 스펙의
  일반론이고, Codex가 실제로 어디까지 읽는지는 OpenAI 공식 문서를 따른다
- OpenAI harness engineering: <https://openai.com/index/harness-engineering/> — 2026-09-04 재확인 때
  봇 차단(403)으로 원문을 다시 읽지 못했다. 2차 자료와 일치하는 요지("짧은 지도 + 구조화된 `docs/`")만
  인용하고 세부 구조를 새로 단정하지 않는다

제품의 탐색·로딩 동작은 바뀔 수 있다. 사실을 적을 때는 본문 주장 가까이에 공식 링크를 두고,
이 덱의 권장 설계와 제품이 보장하는 동작을 구분한다. 공식 문서가 보장하지 않는 경계 사례는
"보장하지 않는다" 또는 "의존하지 않는다"로 표현하고 단정하지 않는다.

## 서술 규칙

- 각 장 첫머리에 `<TermIntro>`를 둔다.
- 큰 그림은 **공유 규칙 / 도구별 어댑터 / 강제 장치**의 세 층으로 설명한다.
- 예시는 루트와 여러 package가 있는 monorepo를 기본으로 한다. 단일 package 저장소는 그 축약형이다.
- 명령과 파일 예시는 복사해서 시작할 수 있을 정도로 구체적으로 쓰되, 특정 언어·프레임워크에 종속된 값은
  `<repo-command>` 같은 추상 표기보다 `pnpm test`처럼 알아보기 쉬운 예시를 쓰고 교체 지점을 설명한다.
- 공유 행동 규칙의 정본은 `AGENTS.md`라는 이 덱의 권장안을 유지한다. 제품 공식 표준이라는 뜻으로 쓰지 않는다.
- PRD는 현재 제품 요구, 작업 계획(`docs/plans/`)은 작업 과정과 증거, architecture·spec은 영구 기술 경계라는 역할 구분을
  유지한다. 이 구분은 공식 파일명 표준이 아니라 공식 사례를 저장소에 적용한 이 덱의 권장안이다.
- `docs/plans/`를 설명할 때는 OpenAI ExecPlan(`PLANS.md`)이 가장 가까운 공식 대응물임을 밝히고,
  **자기완결 vs 링크**, **연속 실행 vs milestone gate** 두 축의 차이를 이 덱의 선택으로 서술한다.
  1장에서 한 번 설명하고 다른 장에서 반복하지 않는다.
- 작업 단위는 "작업 계획(plan)", 파일은 "계획 문서"라고 부른다. 도구의 plan mode가 만드는 임시 plan과
  구분해서 쓴다. "배치"는 `timeline`의 옛 이름이라 사례 설명에서만 쓴다.
- `timeline` 저장소를 사례로 들 때는 그 저장소의 현재 구조와 맞춘다. 덱에서 권장하는 구조가 사례와
  달라지면 어느 쪽이 먼저 바뀌었는지 밝힌다.

## 범위

다룬다: 프로젝트 지침, PRD와 로컬 작업 문서의 수명주기, 프롬프트와 컨텍스트 관리, 계획·구현·검증 요청,
병렬 작업, 실패 복구, 도구별 기능을 함께 쓸 때의 이식 가능한 패턴.

다루지 않는다: 모델 API 개발, 범용 prompt engineering 이론, IDE 자체 사용법 전체, 각 제품의 전체 설정 레퍼런스.
