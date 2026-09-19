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
  "description": "Codex와 Claude Code를 위한 공유 지침 개선, 큰 작업의 계획·검증·세션 간 인계.",
  "category": "tools",
  "tags": [
    "agent"
  ],
  "termIntro": "required",
  "sidebar": [
    {
      "label": "프로젝트 지침",
      "pages": [
        "project-instructions",
        "instruction-discovery"
      ]
    },
    {
      "label": "작업 프로세스",
      "pages": [
        "work-plans",
        "execution-and-resume"
      ]
    },
    {
      "label": "선택 심화",
      "pages": [
        "public-repositories",
        "monorepo-instructions"
      ]
    }
  ],
  "map": [
    {
      "label": "공유",
      "href": "/coding-agents/project-instructions/",
      "title": "공유 지침",
      "tone": "key",
      "desc": "기존 레포의 명령·제약·문서 연결 개선"
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
      "desc": "작업 크기에 맞는 목표·완료 조건·상태 기록"
    },
    {
      "label": "실행",
      "href": "/coding-agents/execution-and-resume/",
      "title": "요청과 재개",
      "tone": "warn",
      "desc": "기능 구현·실패 수정·도구 간 인계와 재개"
    },
    {
      "label": "사례",
      "href": "/coding-agents/public-repositories/",
      "title": "공개 레포",
      "tone": "mute",
      "desc": "실제 지침·이슈·계획에서 필요한 방식 선택"
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
