import fs from 'node:fs';
import { parse } from 'yaml';

export function parseFrontmatter(source, file = 'MDX source') {
	const lines = source.split(/\r?\n/u);
	if (lines[0] !== '---') throw new Error(`${file}: frontmatter가 없습니다.`);

	const end = lines.indexOf('---', 1);
	if (end === -1) throw new Error(`${file}: frontmatter 닫는 구분자가 없습니다.`);

	try {
		return parse(lines.slice(1, end).join('\n')) ?? {};
	} catch (error) {
		throw new Error(`${file}: frontmatter YAML을 읽지 못했습니다.\n${error.message}`, { cause: error });
	}
}

export function readFrontmatter(file) {
	return parseFrontmatter(fs.readFileSync(file, 'utf8'), file);
}
