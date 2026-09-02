import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	deckCategoryIds,
	deckDefinitions,
	deckTagFacets,
	topicPageSlugs,
} from '../src/data/decks.mjs';
import { readFrontmatter } from '../src/data/frontmatter.mjs';

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
		.replace(/\.mdx$/u, '')
		.replace(/\/index$/u, '')
		.split(path.sep)
		.join('/');
	return slug === 'index' ? '' : slug;
}

function checkHeadingsAndFences(source, file) {
	let fence;
	for (const [index, line] of source.split(/\r?\n/u).entries()) {
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

function hasComponent(source, name) {
	let fence;
	for (const line of source.split(/\r?\n/u)) {
		const marker = line.match(/^\s*(```+|~~~+)/u)?.[1];
		if (marker) {
			if (!fence) fence = marker[0];
			else if (marker[0] === fence) fence = undefined;
			continue;
		}
		if (!fence && line.includes(`<${name}`)) return true;
	}
	return false;
}

const mdxFiles = walk(docsRoot).filter((file) => file.endsWith('.mdx'));
const actualSlugs = new Set();
const deckBySlug = new Map(deckDefinitions.map((deck) => [deck.slug, deck]));
let reviewedPages = 0;
let unreviewedPages = 0;
let overduePages = 0;
let legacyThesisPages = 0;
const now = new Date();

for (const file of mdxFiles) {
	const source = fs.readFileSync(file, 'utf8');
	const frontmatter = readFrontmatter(file);
	for (const required of ['title', 'description']) {
		if (typeof frontmatter[required] !== 'string' || frontmatter[required].trim() === '') {
			errors.push(`${relative(file)}: ${required} frontmatter가 없습니다.`);
		}
	}
	checkHeadingsAndFences(source, file);

	const slug = slugFor(file);
	if (!slug) continue;
	actualSlugs.add(slug);

	const [deckSlug, page = ''] = slug.split('/');
	const deck = deckBySlug.get(deckSlug);
	if (!deck) continue;

	const reviewedAt = frontmatter.reviewedAt ? new Date(frontmatter.reviewedAt) : undefined;
	if (frontmatter.reviewedAt && (!reviewedAt || !Number.isFinite(reviewedAt.getTime()))) {
		errors.push(`${relative(file)}: reviewedAt이 올바른 날짜가 아닙니다.`);
	}
	if (reviewedAt && Number.isFinite(reviewedAt.getTime())) {
		reviewedPages++;
		const ageDays = (now.getTime() - reviewedAt.getTime()) / 86_400_000;
		if (ageDays > deck.reviewIntervalDays) overduePages++;
	} else {
		unreviewedPages++;
	}
	if (frontmatter.status && frontmatter.status !== 'unreviewed' && !reviewedAt) {
		errors.push(`${relative(file)}: status '${frontmatter.status}'에는 reviewedAt이 필요합니다.`);
	}
	if (frontmatter.status === 'unreviewed' && reviewedAt) {
		errors.push(`${relative(file)}: reviewedAt이 있으면 status 'unreviewed'를 쓸 수 없습니다.`);
	}

	if (!page) continue;
	const hasThesis = hasComponent(source, 'Thesis');
	if (hasThesis && frontmatter.legacyThesis) {
		errors.push(`${relative(file)}: <Thesis>가 있으므로 legacyThesis를 제거하세요.`);
	} else if (!hasThesis && frontmatter.legacyThesis !== true) {
		errors.push(`${relative(file)}: <Thesis>를 추가하거나 기존 페이지면 legacyThesis: true를 명시하세요.`);
	} else if (frontmatter.legacyThesis) {
		legacyThesisPages++;
	}

	if (deck.termIntro === 'required' && !/-(?:glossary|wrapup)$/u.test(page) && !hasComponent(source, 'TermIntro')) {
		errors.push(`${relative(file)}: 필수 <TermIntro>가 없습니다.`);
	}
}

const expectedSlugs = new Set(topicPageSlugs);
for (const slug of actualSlugs) {
	if (!expectedSlugs.has(slug)) errors.push(`src/content/docs/${slug}.mdx: _deck.mjs가 없는 topic page입니다.`);
}
for (const slug of expectedSlugs) {
	if (!actualSlugs.has(slug)) errors.push(`파생된 topic에 존재하지 않는 slug '${slug}'가 있습니다.`);
}
if (expectedSlugs.size !== topicPageSlugs.length) errors.push('중복된 topic slug가 있습니다.');

if (new Set(deckCategoryIds).size !== deckCategoryIds.length) errors.push('중복된 category id가 있습니다.');
const tagIds = deckTagFacets.map((facet) => facet.id);
if (new Set(tagIds).size !== tagIds.length) errors.push('중복된 tag id가 있습니다.');
for (const id of tagIds) {
	if (!/^[a-z0-9-]+$/u.test(id)) errors.push(`tag id '${id}'는 소문자 ASCII와 '-'만 쓸 수 있습니다.`);
	if (!deckDefinitions.some((deck) => deck.tags.includes(id))) errors.push(`tag '${id}'를 쓰는 덱이 없습니다.`);
}

for (const deck of deckDefinitions) {
	const indexFile = path.join(docsRoot, deck.slug, 'index.mdx');
	const baselineFile = path.join(docsRoot, deck.slug, '_baseline.md');
	if (!fs.existsSync(indexFile)) {
		errors.push(`${relative(indexFile)}: 덱 index가 없습니다.`);
		continue;
	}
	if (!fs.existsSync(baselineFile)) errors.push(`${relative(baselineFile)}: 덱 baseline이 없습니다.`);

	const source = fs.readFileSync(indexFile, 'utf8');
	const frontmatter = readFrontmatter(indexFile);
	if (!source.includes('<LinkButton')) errors.push(`${relative(indexFile)}: <LinkButton>이 없습니다.`);
	if (!source.includes(`<DeckMap deck="${deck.slug}"`)) {
		errors.push(`${relative(indexFile)}: <DeckMap deck="${deck.slug}" />가 없습니다.`);
	}
	if (frontmatter.aliases) errors.push(`${relative(indexFile)}: 덱 alias는 _deck.mjs에 둔다.`);
	for (const group of deck.groups) {
		if (group.items.length === 0) errors.push(`${relative(path.join(docsRoot, deck.slug, '_deck.mjs'))}: '${group.id}' 그룹이 비어 있습니다.`);
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
	console.log(
		`현재성: 검토 ${reviewedPages}개, 검토 이력 없음 ${unreviewedPages}개, 검토 주기 초과 ${overduePages}개 · Thesis 이관 대상 ${legacyThesisPages}개`,
	);
}
