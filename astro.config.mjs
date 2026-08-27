// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import starlight from '@astrojs/starlight';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import starlightThemeRapide from 'starlight-theme-rapide';
import starlightImageZoom from 'starlight-image-zoom';
import astroD2 from 'astro-d2';
import { topics } from './src/data/decks.mjs';

export default defineConfig({
	// 커스텀 도메인. canonical 링크와 sitemap이 전부 이 값으로 생성된다.
	// 기본 도메인(study-starlight.pages.dev)도 살아 있지만, 여기를 커스텀 도메인으로 둬야
	// 양쪽 다 canonical이 이쪽을 가리켜 검색엔진이 한 주소로 모은다.
	site: 'https://study.upggu.com',
	// starlight-image-zoom 0.15는 Astro 7의 Sätteri를 아직 지원하지 않는다.
	markdown: { processor: unified() },
	integrations: [
		// 다이어그램 integration은 starlight보다 먼저 와야 D2 코드 펜스를 가로챈다.
		astroD2({
			layout: 'elk',
			pad: 40,
			theme: { default: '0', dark: '200' },
			// Cloudflare Pages에 D2 바이너리를 설치하지 않고 WASM 기반 D2.js로 생성한다.
			experimental: { useD2js: true },
		}),
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
				starlightImageZoom(),
				starlightThemeRapide(),
				starlightSidebarTopics(topics, {
					// 랜딩 페이지는 어느 topic에도 속하지 않는다.
					exclude: ['/'],
				}),
			],
		}),
	],
});
