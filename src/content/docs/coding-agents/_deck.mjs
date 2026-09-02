// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
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
		}
	],
	"map": [
		{
			"label": "0장",
			"href": "/coding-agents/00-project-instructions/",
			"title": "프로젝트 지침",
			"tone": "key",
			"desc": "`AGENTS.md`를 공유 정본으로 두고 `CLAUDE.md`를 얇은 어댑터로 만드는 monorepo 구조",
			"note": "두 도구가 같은 규칙을 읽되, 서로 다른 하위 폴더 탐색 방식도 놓치지 않게 하려면"
		},
		{
			"label": "1장",
			"href": "/coding-agents/01-development-process/",
			"title": "AI 개발 프로세스",
			"tone": "ok",
			"desc": "PRD·`AGENTS.md`·`docs/batches/`의 역할을 나누고 마일스톤마다 구현·검증·기록을 닫는 흐름",
			"note": "현재 제품 정본을 흐리지 않고 긴 작업을 새 세션에서도 이어 가려면"
		}
	]
};
