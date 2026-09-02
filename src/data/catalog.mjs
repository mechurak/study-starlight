// 랜딩 카테고리와 태그는 전체 덱이 공유하는 통제 어휘다.
// 개별 덱의 metadata는 각 덱 폴더의 _deck.mjs에 둔다.
// tone은 docs/d2-authoring.md의 공통 의미 팔레트에서 고른다.

export const categories = [
	{
		id: 'infra',
		title: '쿠버네티스 · 인프라',
		desc: '시험 대비부터 온프렘 구축·운영까지 — 클러스터와 그 아래의 서버·네트워크·인증',
		tone: 'key',
	},
	{
		id: 'ai',
		title: 'AI · 데이터',
		desc: 'LLM을 서빙하고 관측하고 한 지점으로 묶는 쪽 — 강화학습과 데이터 플랫폼까지',
		tone: 'zone',
	},
	{
		id: 'app',
		title: '웹 · 애플리케이션',
		desc: '요청의 일생부터 화면과 백엔드까지, 도구가 각각 무슨 문제를 푸는지로 들어간다',
		tone: 'warn',
	},
	{
		id: 'tools',
		title: '도구 · 작업 환경',
		desc: '이 사이트를 만든 도구와, 일하는 방식 자체를 바꾸는 것들',
		tone: 'ok',
	},
];

export const tagAxes = [
	{ id: 'topic', label: '주제' },
	{ id: 'format', label: '형식' },
	{ id: 'env', label: '환경' },
];

// id는 URL에 쓰는 ASCII slug고, 표시용 label은 한국어다. 한국어 id는 NFC/NFD 정규화 차이로
// Set 비교가 조용히 어긋날 수 있고 공유 URL도 읽기 어려워지므로 쓰지 않는다.
// 덱이 실제로 여러 장을 쓰는 주제만 붙인다. 한 장에서 스치는 주제는 과다 태깅이다.
export const tags = [
	{ id: 'k8s', label: '쿠버네티스', axis: 'topic' },
	{ id: 'llm', label: 'LLM', axis: 'topic' },
	{ id: 'agent', label: 'AI 에이전트', axis: 'topic' },
	{ id: 'rl', label: '강화학습', axis: 'topic' },
	{ id: 'auth', label: '인증 · 권한', axis: 'topic' },
	{ id: 'o11y', label: '관측', axis: 'topic' },
	{ id: 'data', label: '데이터', axis: 'topic' },
	{ id: 'gpu', label: 'GPU', axis: 'topic' },
	{ id: 'frontend', label: '프론트엔드', axis: 'topic' },
	{ id: 'linux', label: '리눅스', axis: 'topic' },
	{ id: 'hands-on', label: '실습', axis: 'format' },
	{ id: 'exam', label: '시험', axis: 'format' },
	{ id: 'onprem', label: '온프렘', axis: 'env' },
	{ id: 'cloud', label: '클라우드', axis: 'env' },
];
