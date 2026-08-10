// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import starlightThemeRapide from 'starlight-theme-rapide';
import mermaid from 'astro-mermaid';

// 덱 하나 = topic 하나. 새 덱을 추가할 때는
//   1) src/content/docs/<덱이름>/ 에 페이지를 넣고
//   2) 아래 topics 배열에 항목을 추가한다.
export default defineConfig({
	// 커스텀 도메인. canonical 링크와 sitemap이 전부 이 값으로 생성된다.
	// 기본 도메인(study-starlight.pages.dev)도 살아 있지만, 여기를 커스텀 도메인으로 둬야
	// 양쪽 다 canonical이 이쪽을 가리켜 검색엔진이 한 주소로 모은다.
	site: 'https://study.upggu.com',
	integrations: [
		// astro-mermaid는 starlight보다 먼저 와야 ```mermaid 펜스를 가로챈다
		mermaid({ autoTheme: true }),
		starlight({
			title: 'Study Note',
			defaultLocale: 'root',
			locales: {
				root: { label: '한국어', lang: 'ko' },
			},
			customCss: [
				// 한글 폰트 — dynamic subset이라 페이지에 쓰인 글자의 조각만 내려받는다
				'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css',
				'./src/styles/custom.css',
			],
			components: {
				// 검색 결과에 덱 이름을 표시하기 위한 Pagefind meta 주입 — 파일 안 주석 참고
				MarkdownContent: './src/components/MarkdownContent.astro',
				// 덱 목록을 드롭다운으로 접는다 (starlight-sidebar-topics의 override를 대체)
				Sidebar: './src/components/Sidebar.astro',
				// 헤더에 "[사이드바 토글] Study Note / <현재 덱>"
				SiteTitle: './src/components/SiteTitle.astro',
			},
			plugins: [
				starlightThemeRapide(),
				starlightSidebarTopics(
					[
						{
							label: 'CKA',
							link: '/cka/',
							icon: 'open-book',
							items: [
								'cka',
								{
									label: '시험 소개',
									items: ['cka/00-intro', 'cka/01-exam'],
								},
								{
									label: '기초',
									items: ['cka/02-architecture', 'cka/03-kubectl'],
								},
								{
									label: 'Workloads & Scheduling (15%)',
									items: [
										'cka/04-pods',
										'cka/05-workloads',
										'cka/06-config',
										'cka/07-scheduling',
										'cka/08-autoscaling',
									],
								},
								{
									label: 'Services & Networking (20%)',
									items: [
										'cka/09-services',
										'cka/10-dns',
										'cka/11-ingress-gateway',
										'cka/12-networkpolicy',
									],
								},
								{
									label: 'Storage (10%)',
									items: ['cka/13-storage'],
								},
								{
									label: 'Cluster Architecture (25%)',
									items: [
										'cka/14-rbac',
										'cka/15-cluster-lifecycle',
										'cka/16-helm-kustomize',
										'cka/17-extensions',
									],
								},
								{
									label: 'Troubleshooting (30%)',
									items: ['cka/18-troubleshooting'],
								},
								{
									label: '시험 대비',
									items: ['cka/19-exam-strategy', 'cka/20-wrapup'],
								},
							],
						},
						{
							label: 'CKA 실습',
							link: '/cka-udemy/',
							icon: 'pencil',
							items: [
								'cka-udemy',
								{
									label: '워크로드와 스케줄링',
									items: [
										'cka-udemy/01-basics',
										'cka-udemy/02-workloads',
										'cka-udemy/03-pod-config',
										'cka-udemy/04-scheduling',
									],
								},
								{
									label: '네트워킹',
									items: [
										'cka-udemy/05-services-dns',
										'cka-udemy/06-ingress-netpol',
									],
								},
								{
									label: '스토리지와 보안',
									items: ['cka-udemy/07-storage', 'cka-udemy/08-security'],
								},
								{
									label: '클러스터 운영',
									items: [
										'cka-udemy/09-cluster-lifecycle',
										'cka-udemy/10-troubleshooting',
									],
								},
							],
						},
						{
							label: '온프렘 쿠버네티스',
							link: '/onprem/',
							icon: 'server',
							items: [
								'onprem',
								{
									label: '시작',
									items: ['onprem/00-intro', 'onprem/01-why'],
								},
								{
									label: '기반',
									items: ['onprem/02-foundation'],
								},
								{
									label: '바깥으로 여는 길',
									items: [
										'onprem/03-gateway',
										'onprem/04-tls-dns',
										'onprem/05-identity',
									],
								},
								{
									label: '상태를 맡는 것들',
									items: ['onprem/06-minio', 'onprem/07-cnpg'],
								},
								{
									label: '관측',
									items: [
										'onprem/08-observability',
										'onprem/09-prometheus',
										'onprem/10-loki',
										'onprem/11-tempo',
										'onprem/12-grafana',
									],
								},
								{
									label: '배포와 복구',
									items: [
										'onprem/13-gitops',
										'onprem/14-secrets',
										'onprem/15-backup',
									],
								},
								{
									label: '운영',
									items: ['onprem/16-ops'],
								},
								{
									label: '마무리',
									items: ['onprem/17-glossary', 'onprem/18-wrapup'],
								},
							],
						},
						{
							label: '웹 개발 일반',
							link: '/web/',
							icon: 'rocket',
							items: [
								'web',
								{
									label: '시작',
									items: ['web/00-intro', 'web/01-request', 'web/02-rendering'],
								},
								{
									label: '지형',
									items: ['web/03-landscape'],
								},
								{
									label: '도구 사슬',
									items: [
										'web/04-runtime',
										'web/05-package',
										'web/06-bundler',
										'web/07-vite',
									],
								},
								{
									label: '품질과 규모',
									items: ['web/08-quality', 'web/09-monorepo'],
								},
								{
									label: '서비스가 되기까지',
									items: ['web/10-backend', 'web/11-security', 'web/12-deploy'],
								},
								{
									label: '마무리',
									items: ['web/13-glossary', 'web/14-wrapup'],
								},
							],
						},
						{
							label: '프론트엔드',
							link: '/frontend/',
							icon: 'laptop',
							items: [
								'frontend',
								{
									label: '시작',
									items: ['frontend/00-intro', 'frontend/01-landscape'],
								},
								{
									label: 'Next.js — 실행 환경',
									items: [
										'frontend/02-rsc',
										'frontend/03-routing',
										'frontend/04-boundary',
										'frontend/05-data',
										'frontend/06-cache',
										'frontend/07-mutation',
										'frontend/08-performance',
									],
								},
								{
									label: 'Tailwind CSS — 스타일 언어',
									items: [
										'frontend/09-css-history',
										'frontend/10-tailwind',
										'frontend/11-tailwind-practice',
										'frontend/12-tokens',
									],
								},
								{
									label: 'shadcn/ui — 컴포넌트',
									items: [
										'frontend/13-shadcn',
										'frontend/14-shadcn-setup',
										'frontend/15-component-anatomy',
										'frontend/16-asset',
									],
								},
								{
									label: '시스템으로 만들기',
									items: [
										'frontend/17-design-system',
										'frontend/18-a11y',
										'frontend/19-forms-state',
									],
								},
								{
									label: '마무리',
									items: ['frontend/20-patterns', 'frontend/21-wrapup'],
								},
							],
						},
						{
							label: 'shadcn/ui',
							link: '/shadcn/',
							icon: 'puzzle',
							items: [
								'shadcn',
								{
									label: '준비',
									items: ['shadcn/00-intro', 'shadcn/01-what-is-shadcn'],
								},
								{
									label: '테마라는 그릇',
									items: ['shadcn/02-theme', 'shadcn/03-setup'],
								},
								{
									label: '리소스 하나씩',
									items: [
										'shadcn/04-color',
										'shadcn/05-shape',
										'shadcn/06-typography',
										'shadcn/07-component',
										'shadcn/08-icon-font',
									],
								},
								{
									label: '테마 다루기',
									items: [
										'shadcn/09-dark',
										'shadcn/10-make-theme',
										'shadcn/11-registry',
									],
								},
								{
									label: '마무리',
									items: ['shadcn/12-glossary', 'shadcn/13-wrapup'],
								},
							],
						},
						{
							label: 'Keycloak',
							link: '/keycloak/',
							icon: 'seti:lock',
							items: [
								'keycloak',
								{
									label: '시작',
									items: ['keycloak/00-intro', 'keycloak/01-why'],
								},
								{
									label: '프로토콜',
									items: ['keycloak/02-oauth-oidc'],
								},
								{
									label: 'Keycloak 들여다보기',
									items: [
										'keycloak/03-structure',
										'keycloak/04-ad-federation',
										'keycloak/05-sessions',
									],
								},
								{
									label: '연동',
									items: ['keycloak/06-k8s-oidc', 'keycloak/07-apps'],
								},
								{
									label: '배포와 운영',
									items: [
										'keycloak/08-deploy',
										'keycloak/09-ops',
										'keycloak/10-troubleshooting',
									],
								},
								{
									label: '마무리',
									items: ['keycloak/11-glossary', 'keycloak/12-wrapup'],
								},
							],
						},
						{
							label: 'Kafka',
							link: '/kafka/',
							icon: 'random',
							items: [
								'kafka',
								{
									label: '시작',
									items: ['kafka/00-intro', 'kafka/01-why'],
								},
								{
									label: '핵심 모델',
									items: ['kafka/02-log', 'kafka/03-cluster'],
								},
								{
									label: '읽고 쓰기',
									items: [
										'kafka/04-producer',
										'kafka/05-consumer',
										'kafka/06-semantics',
									],
								},
								{
									label: '설계',
									items: ['kafka/07-topic-design', 'kafka/08-ecosystem'],
								},
								{
									label: '온프렘 배포와 운영',
									items: [
										'kafka/09-deploy',
										'kafka/10-ops',
										'kafka/11-troubleshooting',
									],
								},
								{
									label: '마무리',
									items: ['kafka/12-glossary', 'kafka/13-wrapup'],
								},
							],
						},
						{
							label: '서버 관리 일반',
							link: '/server/',
							icon: 'linux',
							items: [
								'server',
								{
									label: '준비',
									items: ['server/00-intro', 'server/01-shell'],
								},
								{
									label: '이 서버는 무엇인가',
									items: [
										'server/02-hardware',
										'server/03-storage',
										'server/04-process',
									],
								},
								{
									label: '서비스와 로그',
									items: ['server/05-systemd', 'server/06-logs'],
								},
								{
									label: '네트워크',
									items: [
										'server/07-network',
										'server/08-connectivity',
										'server/09-proxy',
									],
								},
								{
									label: '사용자와 접근',
									items: ['server/10-users', 'server/11-audit'],
								},
								{
									label: '운영과 보안',
									items: ['server/12-packages', 'server/13-security'],
								},
								{
									label: '마무리',
									items: [
										'server/14-playbook',
										'server/15-glossary',
										'server/16-wrapup',
									],
								},
							],
						},
						{
							label: 'Supabase',
							link: '/supabase/',
							icon: 'seti:db',
							items: [
								'supabase',
								{
									label: '시작',
									items: ['supabase/00-intro', 'supabase/01-why'],
								},
								{
									label: '기반 — Postgres와 개발 환경',
									items: [
										'supabase/02-architecture',
										'supabase/03-start',
										'supabase/04-postgres',
									],
								},
								{
									label: '핵심 — 데이터와 권한',
									items: [
										'supabase/05-data-api',
										'supabase/06-auth',
										'supabase/07-rls',
									],
								},
								{
									label: '주변 제품',
									items: [
										'supabase/08-storage',
										'supabase/09-realtime',
										'supabase/10-edge-functions',
										'supabase/11-extensions',
									],
								},
								{
									label: '애플리케이션 통합',
									items: ['supabase/12-vercel', 'supabase/13-nextjs'],
								},
								{
									label: '운영과 규모',
									items: ['supabase/14-ops', 'supabase/15-perf-cost'],
								},
								{
									label: '마무리',
									items: ['supabase/16-patterns', 'supabase/17-wrapup'],
								},
							],
						},
						{
							label: 'Starlight',
							link: '/starlight/',
							icon: 'star',
							items: [
								'starlight',
								{
									label: '시작',
									items: ['starlight/00-intro', 'starlight/01-landscape'],
								},
								{
									label: '기반',
									items: ['starlight/02-astro', 'starlight/03-starlight'],
								},
								{
									label: '콘텐츠',
									items: [
										'starlight/04-mdx',
										'starlight/05-components',
										'starlight/06-custom',
									],
								},
								{
									label: '글쓰기와 운영',
									items: ['starlight/07-writing', 'starlight/08-pipeline'],
								},
								{
									label: '마무리',
									items: ['starlight/09-wrapup'],
								},
							],
						},
					],
					{
						// 랜딩 페이지는 어느 topic에도 속하지 않는다
						exclude: ['/'],
					},
				),
			],
		}),
	],
});
