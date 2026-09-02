import fs from 'node:fs';
import path from 'node:path';

const distRoot = path.resolve('dist');
if (!fs.existsSync(distRoot)) {
	console.error('dist/가 없습니다. pnpm build 뒤에 check:links를 실행하세요.');
	process.exit(1);
}

function walkHtml(directory) {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) return walkHtml(fullPath);
		return entry.isFile() && entry.name.endsWith('.html') ? [fullPath] : [];
	});
}

function routeFor(file) {
	const relative = path.relative(distRoot, file).split(path.sep).join('/');
	if (relative === 'index.html') return '/';
	if (!relative.endsWith('/index.html')) return `/${relative}`;
	return `/${relative.replace(/index\.html$/u, '')}`;
}

function decodeHtml(value) {
	return value
		.replaceAll('&amp;', '&')
		.replaceAll('&quot;', '"')
		.replaceAll('&#39;', "'")
		.replace(/&#(\d+);/gu, (_, code) => String.fromCodePoint(Number(code)))
		.replace(/&#x([\da-f]+);/giu, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

const pages = new Map();
for (const file of walkHtml(distRoot)) {
	const html = fs.readFileSync(file, 'utf8');
	const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/gu)].map((match) => decodeHtml(match[1])));
	pages.set(routeFor(file), { html, ids });
}

const issues = new Set();
let checkedLinks = 0;
for (const [route, page] of pages) {
	for (const match of page.html.matchAll(/<a\b[^>]*\bhref=["']([^"']*)["']/gu)) {
		const href = decodeHtml(match[1]);
		if (/^(?:https?:|mailto:|tel:|javascript:)/u.test(href) || href.startsWith('//')) continue;

		checkedLinks++;
		let url;
		try {
			url = new URL(href, `https://local.invalid${route}`);
		} catch {
			issues.add(`${route} -> ${href} (올바르지 않은 URL)`);
			continue;
		}

		let targetPath;
		try {
			targetPath = decodeURI(url.pathname);
		} catch {
			issues.add(`${route} -> ${href} (올바르지 않은 URL encoding)`);
			continue;
		}
		if (!targetPath.endsWith('/') && !path.extname(targetPath)) targetPath += '/';

		const target = pages.get(targetPath);
		if (!target) {
			const assetPath = path.join(distRoot, targetPath.replace(/^\//u, ''));
			if (!fs.existsSync(assetPath)) issues.add(`${route} -> ${href} (페이지나 파일 없음)`);
			continue;
		}

		if (url.hash.length > 1) {
			let id;
			try {
				id = decodeURIComponent(url.hash.slice(1));
			} catch {
				issues.add(`${route} -> ${href} (올바르지 않은 fragment encoding)`);
				continue;
			}
			if (!target.ids.has(id)) issues.add(`${route} -> ${href} (anchor #${id} 없음)`);
		}
	}
}

if (issues.size > 0) {
	console.error(`내부 링크 검사 실패 (${issues.size}건)\n`);
	for (const issue of issues) console.error(`- ${issue}`);
	process.exitCode = 1;
} else {
	console.log(`내부 링크 검사 통과: ${pages.size}개 HTML, ${checkedLinks}개 페이지·anchor 링크`);
}
