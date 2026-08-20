# Claude Code · Codex 실전 덱의 기준

`coding-agents` 덱을 고치기 전에 읽는다.

이 덱은 Claude Code와 Codex를 실제 저장소에서 함께 쓰며 반복해서 확인할 **운영 패턴**을 모은다.
제품 기능을 나열하는 설명서가 아니라, 어떤 구성을 택할지와 어디서 실패하는지를 중심으로 쓴다.

## 현재성 기준

**2026년 8월 20일**에 다음 공식 문서를 확인했다.

- OpenAI: <https://learn.chatgpt.com/docs/agent-configuration/agents-md>
  (구 주소 `developers.openai.com/codex/guides/agents-md`는 이곳으로 308 영구 리다이렉트된다)
- Anthropic: <https://code.claude.com/docs/en/memory>
- Anthropic 기능 선택: <https://code.claude.com/docs/en/features-overview>

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

## 범위

다룬다: 프로젝트 지침, 프롬프트와 컨텍스트 관리, 계획·구현·검증 요청, 병렬 작업, 실패 복구,
도구별 기능을 함께 쓸 때의 이식 가능한 패턴.

다루지 않는다: 모델 API 개발, 범용 prompt engineering 이론, IDE 자체 사용법 전체, 각 제품의 전체 설정 레퍼런스.
