// 호환용 진입점. 전역 어휘는 catalog.mjs, 덱 metadata와 목차는 각 _deck.mjs에 있다.
// 데이터 정의는 원본 파일에 두고 loader가 파생 데이터를 만든다.
export * from './load-decks.mjs';
