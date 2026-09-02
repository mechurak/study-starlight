import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { z } from 'astro/zod';
import {
	categories as rawCategories,
	tagAxes as rawTagAxes,
	tags as rawTags,
} from './catalog.mjs';
import { catalogSchema, deckConfigSchema } from './deck-schema.mjs';
import { readFrontmatter } from './frontmatter.mjs';

// Astro가 이 module을 prerender bundle에 넣어도 cwd는 저장소 root를 유지한다.
// import.meta.url을 쓰면 dist/.prerender 기준으로 바뀌므로 source tree를 찾지 못한다.
const docsRoot = path.resolve(process.cwd(), 'src/content/docs');

let catalog;
try {
	catalog = catalogSchema.parse({ categories: rawCategories, tagAxes: rawTagAxes, tags: rawTags });
} catch (error) {
	if (error instanceof z.ZodError) throw formatSchemaError('src/data/catalog.mjs', '전역 catalog', error);
	throw error;
}
const { categories, tagAxes, tags } = catalog;

const pageFrontmatterSchema = z.object({
	deckGroup: z.string().min(1),
	sidebar: z.object({ order: z.number() }).passthrough(),
});

function walkMdx(directory) {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) return walkMdx(fullPath);
		return entry.isFile() && entry.name.endsWith('.mdx') ? [fullPath] : [];
	});
}

function slugFor(file) {
	return path
		.relative(docsRoot, file)
		.replace(/\.mdx$/u, '')
		.split(path.sep)
		.join('/')
		.replace(/\/index$/u, '');
}

function formatSchemaError(file, subject, error) {
	const issues = error.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`).join('\n- ');
	return new Error(`${file}: ${subject}가 올바르지 않습니다.\n- ${issues}`, { cause: error });
}

const deckDirectories = fs
	.readdirSync(docsRoot, { withFileTypes: true })
	.filter((entry) => entry.isDirectory() && fs.existsSync(path.join(docsRoot, entry.name, '_deck.mjs')))
	.map((entry) => entry.name);

const loadedDecks = await Promise.all(
	deckDirectories.map(async (slug) => {
		if (!/^[a-z0-9-]+$/u.test(slug)) {
			throw new Error(`${slug}: 덱 폴더 이름은 소문자 ASCII slug여야 합니다.`);
		}
		const directory = path.join(docsRoot, slug);
		const configFile = path.join(directory, '_deck.mjs');
		const rawConfig = (await import(/* @vite-ignore */ pathToFileURL(configFile).href)).default;

		let config;
		try {
			config = deckConfigSchema.parse(rawConfig);
		} catch (error) {
			if (error instanceof z.ZodError) throw formatSchemaError(configFile, '덱 metadata', error);
			throw error;
		}

		const groupIds = config.groups.map((group) => group.id);
		if (new Set(groupIds).size !== groupIds.length) {
			throw new Error(`${configFile}: 중복된 group id가 있습니다.`);
		}

		const pages = walkMdx(directory)
			.filter((file) => file !== path.join(directory, 'index.mdx'))
			.map((file) => {
				const frontmatter = readFrontmatter(file);
				let page;
				try {
					page = pageFrontmatterSchema.parse(frontmatter);
				} catch (error) {
					if (error instanceof z.ZodError) throw formatSchemaError(file, '페이지 frontmatter', error);
					throw error;
				}
				if (!groupIds.includes(page.deckGroup)) {
					throw new Error(`${file}: deckGroup '${page.deckGroup}'이 ${configFile}에 없습니다.`);
				}
				return {
					slug: slugFor(file),
					group: page.deckGroup,
					order: page.sidebar.order,
					file,
				};
			})
			.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));

		const orders = pages.map((page) => page.order);
		if (new Set(orders).size !== orders.length) {
			throw new Error(`${configFile}: sidebar.order가 중복된 페이지가 있습니다.`);
		}

		return {
			...config,
			slug,
			pages,
			groups: config.groups.map((group) => ({
				...group,
				items: pages.filter((page) => page.group === group.id).map((page) => page.slug),
			})),
		};
	}),
);

function assertUnique(field) {
	const values = loadedDecks.map((deck) => deck[field]);
	if (new Set(values).size !== values.length) throw new Error(`덱의 ${field}가 중복되었습니다.`);
}

assertUnique('slug');
assertUnique('navOrder');
assertUnique('catalogOrder');

function assertCatalogUnique(items, subject) {
	const ids = items.map((item) => item.id);
	if (new Set(ids).size !== ids.length) throw new Error(`전역 catalog의 ${subject} id가 중복되었습니다.`);
}

assertCatalogUnique(categories, 'category');
assertCatalogUnique(tagAxes, 'tag axis');
assertCatalogUnique(tags, 'tag');

const tagAxisIds = new Set(tagAxes.map((axis) => axis.id));
for (const tag of tags) {
	if (!tagAxisIds.has(tag.axis)) {
		throw new Error(`src/data/catalog.mjs: tag '${tag.id}'의 axis '${tag.axis}'가 없습니다.`);
	}
}

const topicRoutes = new Set(
	loadedDecks.flatMap((deck) => [`/${deck.slug}/`, ...deck.pages.map((page) => `/${page.slug}/`)]),
);
for (const deck of loadedDecks) {
	const configFile = path.join(docsRoot, deck.slug, '_deck.mjs');
	for (const step of deck.map) {
		for (const href of [step.href, ...(step.items ?? []).map(([, itemHref]) => itemHref)].filter(Boolean)) {
			if (!topicRoutes.has(href)) {
				throw new Error(`${configFile}: DeckMap href '${href}'에 해당하는 topic page가 없습니다.`);
			}
		}
	}
}

const categoryIds = new Set(categories.map((category) => category.id));
const tagIds = new Set(tags.map((tag) => tag.id));
for (const deck of loadedDecks) {
	if (!categoryIds.has(deck.category)) {
		throw new Error(`${deck.slug}: category '${deck.category}'가 전역 어휘에 없습니다.`);
	}
	if (new Set(deck.tags).size !== deck.tags.length) {
		throw new Error(`${deck.slug}: 중복된 tag가 있습니다.`);
	}
	for (const tag of deck.tags) {
		if (!tagIds.has(tag)) throw new Error(`${deck.slug}: tag '${tag}'가 전역 어휘에 없습니다.`);
	}
}

export const deckDefinitions = [...loadedDecks].sort((a, b) => a.catalogOrder - b.catalogOrder);

export const topics = [...loadedDecks]
	.sort((a, b) => a.navOrder - b.navOrder)
	.map((deck) => ({
		label: deck.label,
		link: `/${deck.slug}/`,
		icon: deck.icon,
		items: [
			deck.slug,
			...deck.groups.map((group) => ({ label: group.label, items: group.items })),
		],
	}));

export const topicPageSlugs = deckDefinitions.flatMap((deck) => [
	deck.slug,
	...deck.pages.map((page) => page.slug),
]);

export const termIntroDeckSlugs = deckDefinitions
	.filter((deck) => deck.termIntro === 'required')
	.map((deck) => deck.slug);

export const deckCategoryIds = categories.map((category) => category.id);
export const deckTagAxes = tagAxes;

export const deckTagFacets = tags.map((tag) => ({
	...tag,
	count: deckDefinitions.filter((deck) => deck.tags.includes(tag.id)).length,
}));

export const deckCatalogSections = categories.map((category) => ({
	title: category.title,
	desc: category.desc,
	tone: category.tone,
	decks: deckDefinitions
		.filter((deck) => deck.category === category.id)
		.map((deck) => ({
			slug: deck.slug,
			href: `/${deck.slug}/`,
			icon: deck.icon,
			title: deck.title,
			desc: deck.description,
			chapters: deck.pages.length,
			tags: deck.tags.map((id) => tags.find((tag) => tag.id === id)).filter(Boolean),
		})),
}));

export function getDeck(slug) {
	return deckDefinitions.find((deck) => deck.slug === slug);
}
