import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	deckCategoryIds,
	deckDefinitions,
	deckTagFacets,
	termIntroDeckSlugs,
	topicPageSlugs,
} from '../src/data/decks.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docsRoot = path.join(repositoryRoot, 'src/content/docs');
const errors = [];

function walk(directory) {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = path.join(directory, entry.name);
		return entry.isDirectory() ? walk(fullPath) : [fullPath];
	});
}

function relative(file) {
	return path.relative(repositoryRoot, file);
}

function slugFor(file) {
	const slug = path
		.relative(docsRoot, file)
		.replace(/\.mdx$/, '')
		.replace(/\/index$/, '')
		.split(path.sep)
		.join('/');
	return slug === 'index' ? '' : slug;
}

function frontmatterKeys(source, file) {
	const lines = source.split(/\r?\n/);
	if (lines[0] !== '---') {
		errors.push(`${relative(file)}: frontmatter가 없습니다.`);
		return new Set();
	}
	const end = lines.indexOf('---', 1);
	if (end === -1) {
		errors.push(`${relative(file)}: frontmatter 닫는 구분자가 없습니다.`);
		return new Set();
	}
	return new Set(
		lines
			.slice(1, end)
			.map((line) => line.match(/^([A-Za-z][A-Za-z0-9_-]*):/u)?.[1])
			.filter(Boolean),
	);
}

function checkHeadingsAndFences(source, file) {
	let fence;
	for (const [index, line] of source.split(/\r?\n/).entries()) {
		if (/^\s*```(?:promql|logql|traceql)$/u.test(line)) {
			errors.push(`${relative(file)}:${index + 1}: 지원하지 않는 펜스 언어 대신 text를 사용하세요.`);
		}
		const marker = line.match(/^\s*(```+|~~~+)/u)?.[1];
		if (marker) {
			if (!fence) fence = marker[0];
			else if (marker[0] === fence) fence = undefined;
			continue;
		}
		if (!fence && /^####\s/u.test(line)) {
			errors.push(`${relative(file)}:${index + 1}: h4 대신 h2·h3로 목차를 구성하세요.`);
		}
	}
}

const mdxFiles = walk(docsRoot).filter((file) => file.endsWith('.mdx'));
const actualSlugs = new Set();

for (const file of mdxFiles) {
	const source = fs.readFileSync(file, 'utf8');
	const keys = frontmatterKeys(source, file);
	for (const required of ['title', 'description']) {
		if (!keys.has(required)) errors.push(`${relative(file)}: ${required} frontmatter가 없습니다.`);
	}
	checkHeadingsAndFences(source, file);

	const slug = slugFor(file);
	if (slug) actualSlugs.add(slug);
}

const expectedSlugs = new Set(topicPageSlugs);
for (const slug of actualSlugs) {
	if (!expectedSlugs.has(slug)) errors.push(`src/content/docs/${slug}.mdx: 덱 manifest에 등록되지 않았습니다.`);
}
for (const slug of expectedSlugs) {
	if (!actualSlugs.has(slug)) errors.push(`src/data/decks.mjs: 존재하지 않는 slug '${slug}'가 등록되어 있습니다.`);
}
if (expectedSlugs.size !== topicPageSlugs.length) {
	errors.push('src/data/decks.mjs: 중복된 topic slug가 있습니다.');
}
if (new Set(deckDefinitions.map((deck) => deck.topicOrder)).size !== deckDefinitions.length) {
	errors.push('src/data/decks.mjs: 중복된 topicOrder가 있습니다.');
}

// 카테고리·태그 어휘 자체의 무결성
if (new Set(deckCategoryIds).size !== deckCategoryIds.length) {
	errors.push('src/data/decks.mjs: 중복된 category id가 있습니다.');
}
const tagIds = deckTagFacets.map((facet) => facet.id);
if (new Set(tagIds).size !== tagIds.length) {
	errors.push('src/data/decks.mjs: 중복된 tag id가 있습니다.');
}
for (const id of tagIds) {
	// id는 ASCII 슬러그로 고정한다 — 한국어 id는 NFC/NFD 차이로 조용히 어긋난다.
	if (!/^[a-z0-9-]+$/u.test(id)) {
		errors.push(`src/data/decks.mjs: tag id '${id}'는 소문자 ASCII와 '-'만 쓸 수 있습니다.`);
	}
}

// 덱마다의 category · tags
const categoryIdSet = new Set(deckCategoryIds);
const tagIdSet = new Set(tagIds);
const usedTagIds = new Set();

for (const deck of deckDefinitions) {
	if (!categoryIdSet.has(deck.category)) {
		errors.push(`src/data/decks.mjs: '${deck.slug}'의 category '${deck.category}'가 카테고리 목록에 없습니다.`);
	}
	// 태그가 없으면 AND 필터에서 칩 하나만 눌러도 영영 닿을 수 없는 덱이 된다.
	if (!Array.isArray(deck.tags) || deck.tags.length === 0) {
		errors.push(`src/data/decks.mjs: '${deck.slug}'에 tags가 없습니다. 최소 하나를 붙입니다.`);
		continue;
	}
	const seenTags = new Set();
	for (const tag of deck.tags) {
		if (!tagIdSet.has(tag)) {
			errors.push(`src/data/decks.mjs: '${deck.slug}'의 tag '${tag}'가 태그 목록에 없습니다.`);
		}
		if (seenTags.has(tag)) {
			errors.push(`src/data/decks.mjs: '${deck.slug}'에 중복된 tag '${tag}'가 있습니다.`);
		}
		seenTags.add(tag);
		usedTagIds.add(tag);
	}
}

for (const id of tagIds) {
	// 아무 덱도 쓰지 않는 태그는 랜딩에 '(0)' 칩으로 남는다.
	if (!usedTagIds.has(id)) {
		errors.push(`src/data/decks.mjs: 태그 '${id}'를 쓰는 덱이 없습니다.`);
	}
}

for (const deck of deckDefinitions) {
	const indexFile = path.join(docsRoot, deck.slug, 'index.mdx');
	if (!fs.existsSync(indexFile)) {
		errors.push(`${relative(indexFile)}: 덱 index가 없습니다.`);
		continue;
	}
	const source = fs.readFileSync(indexFile, 'utf8');
	if (!source.includes('<LinkButton')) errors.push(`${relative(indexFile)}: <LinkButton>이 없습니다.`);
	if (!source.includes('<DeckMap')) errors.push(`${relative(indexFile)}: <DeckMap>이 없습니다.`);
}

const termIntroDecks = new Set(termIntroDeckSlugs);
for (const file of mdxFiles) {
	const slug = slugFor(file);
	const [deck, page = ''] = slug.split('/');
	if (!termIntroDecks.has(deck) || !page || /-(?:glossary|wrapup)$/u.test(page)) continue;
	if (!fs.readFileSync(file, 'utf8').includes('<TermIntro')) {
		errors.push(`${relative(file)}: 필수 <TermIntro>가 없습니다.`);
	}
}

if (errors.length > 0) {
	console.error(`콘텐츠 검사 실패 (${errors.length}건)\n`);
	for (const error of errors) console.error(`- ${error}`);
	process.exitCode = 1;
} else {
	console.log(
		`콘텐츠 검사 통과: ${deckDefinitions.length}개 덱, ${deckTagFacets.length}개 태그, ${mdxFiles.length}개 MDX, ${actualSlugs.size}개 topic page`,
	);
}
