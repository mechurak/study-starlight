// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSidebarTopics from 'starlight-sidebar-topics';
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
			title: '스터디 노트',
			defaultLocale: 'root',
			locales: {
				root: { label: '한국어', lang: 'ko' },
			},
			customCss: ['./src/styles/custom.css'],
			plugins: [
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
