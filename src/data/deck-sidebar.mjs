// schema 검증을 마친 목차와 실제 파일을 대조한다. 목록 순서가 곧 읽는 순서다.
export function resolveDeckSidebar(sidebar, pagesByName, configFile) {
	const seen = new Set();
	const pages = [];
	const navigation = sidebar.map(({ label, pages: names }) => ({
		label,
		items: names.map((name) => {
			if (seen.has(name)) throw new Error(`${configFile}: sidebar에 '${name}' 페이지가 중복되었습니다.`);
			seen.add(name);
			const page = pagesByName.get(name);
			if (!page) throw new Error(`${configFile}: sidebar의 '${name}'에 해당하는 본문 MDX가 없습니다. index는 자동으로 추가됩니다.`);
			pages.push(page);
			return page.slug;
		}),
	}));
	const missing = [...pagesByName.keys()].filter((name) => !seen.has(name));
	if (missing.length > 0) {
		throw new Error(`${configFile}: sidebar에 등록되지 않은 본문이 있습니다: ${missing.join(', ')}`);
	}
	return { pages, navigation };
}
