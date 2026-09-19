import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveDeckSidebar } from '../src/data/deck-sidebar.mjs';
import { deckConfigSchema } from '../src/data/deck-schema.mjs';

const configFile = 'sample/_deck.mjs';
const pagesByName = new Map(['intro', 'advanced/setup', 'wrapup'].map((name) => [
	name, { slug: `sample/${name}`, file: `/docs/sample/${name}.mdx` },
]));
const resolve = (sidebar) => resolveDeckSidebar(sidebar, pagesByName, configFile);

test('배열의 그룹·페이지 순서를 보존하고 하위 폴더 경로를 연결한다', () => {
	const result = resolve([
		{ label: '먼저', pages: ['wrapup', 'intro'] },
		{ label: '나중', pages: ['advanced/setup'] },
	]);
	assert.deepEqual(result.navigation, [
		{ label: '먼저', items: ['sample/wrapup', 'sample/intro'] },
		{ label: '나중', items: ['sample/advanced/setup'] },
	]);
	assert.deepEqual(result.pages.map(({ file }) => file), [
		'/docs/sample/wrapup.mdx', '/docs/sample/intro.mdx', '/docs/sample/advanced/setup.mdx',
	]);
});

test('같은 그룹·다른 그룹 어디에서든 중복 등록을 거부한다', () => {
	assert.throws(() => resolve([{ label: '기본', pages: ['intro', 'intro'] }]), /intro.*중복/u);
	assert.throws(() => resolve([
		{ label: '기본', pages: ['intro'] }, { label: '심화', pages: ['intro'] },
	]), /intro.*중복/u);
});

test('실제 파일이 목차에서 빠지면 누락된 경로를 알려 준다', () => {
	assert.throws(() => resolve([{ label: '기본', pages: ['intro'] }]), /등록되지 않은.*advanced\/setup, wrapup/u);
});

test('없는 페이지와 자동 추가되는 덱 index의 명시적 등록을 거부한다', () => {
	for (const name of ['missing', 'index']) {
		assert.throws(() => resolve([{ label: '기본', pages: [name] }]), /본문 MDX가 없습니다/u);
	}
});

test('빈 목차·빈 그룹·빈 라벨·옛 그룹 필드를 거부한다', () => {
	for (const sidebar of [
		[], [{ label: '기본', pages: [] }], [{ label: '', pages: ['intro'] }],
		[{ id: 'basics', label: '기본', pages: ['intro'], allowEmpty: true }],
	]) {
		assert.equal(deckConfigSchema.shape.sidebar.safeParse(sidebar).success, false);
	}
});

test('페이지 참조는 확장자 없는 덱 상대 경로만 받는다', () => {
	for (const name of ['/intro', '../intro', 'intro.mdx', 'intro/', 'a//b', 'a\\b']) {
		assert.equal(deckConfigSchema.shape.sidebar.safeParse([{ label: '기본', pages: [name] }]).success, false);
	}
	assert.equal(deckConfigSchema.shape.sidebar.safeParse([
		{ label: '기본', pages: ['intro', 'advanced/setup'] },
	]).success, true);
});
