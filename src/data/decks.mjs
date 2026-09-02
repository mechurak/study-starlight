// 호환용 진입점. 전역 어휘는 catalog.mjs, 덱 metadata는 각 _deck.mjs,
// 페이지 소속과 순서는 MDX frontmatter에 있고 loader가 파생 데이터를 만든다.
export * from './load-decks.mjs';
