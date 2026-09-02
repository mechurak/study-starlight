import path from 'node:path';
import { deckDefinitions } from '../src/data/decks.mjs';
import { readFrontmatter } from '../src/data/frontmatter.mjs';

const docsRoot = path.resolve('src/content/docs');
const now = Date.now();

const rows = deckDefinitions.map((deck) => {
	const files = [path.join(docsRoot, deck.slug, 'index.mdx'), ...deck.pages.map((page) => page.file)];
	const stats = {
		pages: files.length,
		reviewed: 0,
		unreviewed: 0,
		overdue: 0,
		attention: 0,
		legacyThesis: 0,
	};

	for (const file of files) {
		const frontmatter = readFrontmatter(file);
		const reviewedAt = frontmatter.reviewedAt ? new Date(frontmatter.reviewedAt) : undefined;
		if (reviewedAt && Number.isFinite(reviewedAt.getTime())) {
			stats.reviewed++;
			if ((now - reviewedAt.getTime()) / 86_400_000 > deck.reviewIntervalDays) stats.overdue++;
		} else {
			stats.unreviewed++;
		}
		if (frontmatter.status === 'review' || frontmatter.status === 'stale') stats.attention++;
		if (frontmatter.legacyThesis === true) stats.legacyThesis++;
	}

	return { deck: deck.label, ...stats };
});

const totals = rows.reduce(
	(total, row) => {
		for (const key of ['pages', 'reviewed', 'unreviewed', 'overdue', 'attention', 'legacyThesis']) {
			total[key] += row[key];
		}
		return total;
	},
	{ deck: '합계', pages: 0, reviewed: 0, unreviewed: 0, overdue: 0, attention: 0, legacyThesis: 0 },
);

console.log('| 덱 | 문서 | 검토됨 | 이력 없음 | 주기 초과 | 확인 필요 | Thesis 이관 |');
console.log('|---|---:|---:|---:|---:|---:|---:|');
for (const row of [...rows, totals]) {
	console.log(
		`| ${row.deck} | ${row.pages} | ${row.reviewed} | ${row.unreviewed} | ${row.overdue} | ${row.attention} | ${row.legacyThesis} |`,
	);
}
