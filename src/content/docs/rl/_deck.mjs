// 덱 단위 metadata와 구조. 페이지 소속·순서는 각 MDX frontmatter에 있다.
export default {
	"navOrder": 1200,
	"catalogOrder": 1400,
	"label": "강화학습",
	"title": "강화학습",
	"icon": "setting",
	"aliases": [
		"Reinforcement Learning",
		"RL"
	],
	"description": "MDP부터 PPO·오프라인 RL까지, 그리고 시스템 트레이딩과 피지컬 AI(로봇)에 어떻게 쓰이는가.",
	"category": "ai",
	"tags": [
		"rl"
	],
	"termIntro": "required",
	"groups": [
		{
			"id": "intro",
			"label": "시작"
		},
		{
			"id": "mdp",
			"label": "문제를 세우기"
		},
		{
			"id": "value-based",
			"label": "알고리즘"
		},
		{
			"id": "reward",
			"label": "실전 공통"
		},
		{
			"id": "market",
			"label": "시스템 트레이딩"
		},
		{
			"id": "robot",
			"label": "피지컬 AI — 로봇"
		},
		{
			"id": "career",
			"label": "마무리"
		}
	],
	"map": [
		{
			"label": "0~1장",
			"href": "/rl/00-intro/",
			"title": "시작",
			"tone": "key",
			"desc": "범위와 기준 시점 · 2026년의 강화학습 지형 · 언제 강화학습을 쓰고 언제 안 쓰나",
			"note": "이 문제가 정말 강화학습 문제인가"
		},
		{
			"label": "2~3장",
			"href": "/rl/02-mdp/",
			"title": "문제를 세우기",
			"tone": "zone",
			"desc": "MDP 다섯 요소 · 부분 관측 · 할인율 · 가치와 벨만 방정식 · 탐색과 활용",
			"note": "현실을 어떻게 상태·행동·보상으로 옮기나"
		},
		{
			"label": "4~7장",
			"href": "/rl/04-value-based/",
			"title": "알고리즘",
			"tone": "warn",
			"desc": "Q러닝과 DQN · 정책 경사와 액터-크리틱 · PPO와 SAC · 오프라인 RL과 모델 기반",
			"note": "무엇을 언제 고르나 — 샘플이 싼가 비싼가"
		},
		{
			"label": "8~10장",
			"href": "/rl/08-reward/",
			"title": "실전 공통",
			"tone": "bad",
			"desc": "보상 설계와 리워드 해킹 · 학습 파이프라인과 디버깅 · 평가와 재현성",
			"note": "왜 안 되는가, 그리고 잘된 걸 어떻게 아는가"
		},
		{
			"label": "11~13장",
			"href": "/rl/11-market/",
			"title": "시스템 트레이딩",
			"tone": "ok",
			"desc": "시장이 환경으로서 특이한 점 · 상태·행동·보상 설계와 백테스트 · 체결·마켓메이킹·배분",
			"note": "어디까지가 실전이고 어디부터가 논문인가"
		},
		{
			"label": "14~16장",
			"href": "/rl/14-robot/",
			"title": "피지컬 AI (로봇)",
			"tone": "key",
			"desc": "연속 제어와 sim-to-real · 대규모 병렬 시뮬레이션 스택 · 모방학습과 VLA",
			"note": "왜 로봇에서는 RL이 실제로 굴러가나"
		},
		{
			"label": "17~19장",
			"href": "/rl/17-career/",
			"title": "마무리",
			"tone": "mute",
			"desc": "직무 지형과 갖춰야 할 스택 · 학습 경로와 포트폴리오 · 용어 사전 · 전체 요약"
		}
	]
};
