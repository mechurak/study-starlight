// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import starlightThemeRapide from 'starlight-theme-rapide';
import mermaid from 'astro-mermaid';
import { topics } from './src/data/decks.mjs';

export default defineConfig({
	// 커스텀 도메인. canonical 링크와 sitemap이 전부 이 값으로 생성된다.
	// 기본 도메인(study-starlight.pages.dev)도 살아 있지만, 여기를 커스텀 도메인으로 둬야
	// 양쪽 다 canonical이 이쪽을 가리켜 검색엔진이 한 주소로 모은다.
	site: 'https://study.upggu.com',
	vite: {
		build: {
			// Mermaid의 파서 코어가 약 662kB다. 그보다 커지는 새 회귀는 계속 경고한다.
			chunkSizeWarningLimit: 700,
		},
	},
	integrations: [
		// astro-mermaid는 starlight보다 먼저 와야 ```mermaid 펜스를 가로챈다.
		mermaid({ autoTheme: true }),
		starlight({
			title: 'Study Note',
			defaultLocale: 'root',
			locales: {
				root: { label: '한국어', lang: 'ko' },
			},
			customCss: [
				// 한글 폰트 — dynamic subset이라 페이지에 쓰인 글자의 조각만 내려받는다.
				'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css',
				'./src/styles/custom.css',
			],
			components: {
				// 검색 결과에 덱 이름을 표시하기 위한 Pagefind meta 주입 — 파일 안 주석 참고.
				MarkdownContent: './src/components/layout/MarkdownContent.astro',
				// 덱 목록을 드롭다운으로 접는다.
				Sidebar: './src/components/layout/Sidebar.astro',
				// 헤더에 "[사이드바 토글] Study Note / <현재 덱>".
				SiteTitle: './src/components/layout/SiteTitle.astro',
			},
			plugins: [
				starlightThemeRapide(),
				starlightSidebarTopics(topics, {
					// 랜딩 페이지는 어느 topic에도 속하지 않는다.
					exclude: ['/'],
				}),
			],
		}),
	],
});
