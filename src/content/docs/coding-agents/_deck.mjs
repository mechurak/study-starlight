export default {
  "navOrder": 2100,
  "catalogOrder": 2100,
  "label": "Claude Code · Codex",
  "title": "Claude Code · Codex 실전",
  "icon": "pencil",
  "aliases": [
    "코딩 에이전트",
    "Coding Agents",
    "AGENTS.md",
    "CLAUDE.md"
  ],
  "description": "두 코딩 에이전트를 같은 저장소에서 쓰는 법 — 지침 계층, 컨텍스트, 작업 요청과 검증 패턴.",
  "category": "tools",
  "tags": [
    "agent"
  ],
  "termIntro": "required",
  "groups": [
    {
      "id": "project-instructions",
      "label": "프로젝트 지침"
    },
    {
      "id": "development-process",
      "label": "작업 프로세스"
    },
    {
      "id": "advanced",
      "label": "선택 심화"
    }
  ],
  "map": [
    {
      "label": "공유",
      "href": "/coding-agents/project-instructions/",
      "title": "공유 지침",
      "tone": "key",
      "desc": "단일 저장소의 AGENTS 정본과 CLAUDE 어댑터"
    },
    {
      "label": "탐색",
      "href": "/coding-agents/instruction-discovery/",
      "title": "지침 탐색",
      "tone": "mute",
      "desc": "실행 위치와 제품별 자동 로딩 경계"
    },
    {
      "label": "계획",
      "href": "/coding-agents/work-plans/",
      "title": "목표와 증거",
      "tone": "ok",
      "desc": "실행 범위·현재 위치·검증 기록"
    },
    {
      "label": "실행",
      "href": "/coding-agents/execution-and-resume/",
      "title": "요청과 재개",
      "tone": "warn",
      "desc": "작은 덱 요청부터 리뷰·실패 수정·재개까지"
    },
    {
      "label": "심화",
      "href": "/coding-agents/monorepo-instructions/",
      "title": "Monorepo 경계",
      "tone": "zone",
      "desc": "규칙이 달라지는 package에만 추가 지침"
    }
  ]
};
