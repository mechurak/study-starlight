// D2 펜스 오프라인 측정·렌더 도구 — 빌드 없이 폭을 재고 배치를 눈으로 확인한다.
//
//   node scripts/d2-measure.mjs <파일.mdx> [<파일.mdx> …]          폭·높이만 출력
//   node scripts/d2-measure.mjs --png <파일.mdx> [<파일.mdx> …]    블록별 PNG를 .d2-measure/에 저장
//
// astro-d2가 쓰는 것과 같은 native D2 v0.8.2 CLI를 같은 옵션(elk · pad 40 · theme 0/200)으로
// 직접 호출하므로 결과 SVG의 width/height가 빌드 산출물과 픽셀 단위로 일치한다.
// `pnpm check` 전체 빌드 대신 파일 하나만 빠르게 확인할 때 쓴다.
// 옵션 기본값을 바꾸면 astro.config.mjs의 astroD2() 설정과 같이 맞춘다.
//
// native CLI도 astro.config.mjs와 같은 prepareD2()를 거치므로 시스템 전역 D2에는 의존하지 않는다.
// 일반 측정의 SVG는 OS 임시 디렉터리에 만들고, --png일 때만 .d2-measure/에 남긴다.
//
// 이슈 #2에서 확인된 PNG 함정을 코드에 반영해 뒀다:
// - PNG 렌더(sharp)는 라벨에 emoji(⚠️ 등)가 있으면 로컬 Pango 폰트 문제로 **프로세스째 abort**한다
//   (try/catch로 못 잡는다). 그래서 래스터화만 블록별 자식 프로세스로 격리했다 — 죽은 블록은
//   "PNG 실패"로 표시되고 나머지는 계속 나온다. 그 블록의 실물은 브라우저에서 본다.
// - 폭 수치만 보고 배치를 고르면 안 된다(라벨 겹침·컨테이너 관통은 숫자로 안 잡힌다) —
//   재배치했으면 --png로 눈으로 확인한다.
//
// 본문 폭은 632px이다. 632 초과는 그 비율만큼 축소 표시되고, 900 초과는 배치를 다시 잡는 편이
// 낫다(docs/content-authoring.md의 D2 절). 출력의 배율은 632/폭이다.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { prepareD2 } from './prepare-d2.mjs';

const scriptPath = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(scriptPath), '..');
const outputRoot = path.join(repositoryRoot, '.d2-measure');
const CONTENT_WIDTH = 632;
const REDESIGN_WIDTH = 900;

// astro.config.mjs의 astroD2() 옵션과 같은 값.
const defaultOptions = {
	layout: 'elk',
	pad: 40,
	sketch: false,
	theme: '0',
	darkTheme: '200',
};

// 내부용: Pango abort를 격리하기 위해 래스터화 한 건만 자식 프로세스로 수행한다.
if (process.argv[2] === '--rasterize') {
	const [, , , svgPath, pngPath] = process.argv;
	const sharpModulePath = path.join(repositoryRoot, 'node_modules/sharp/lib/index.js');
	const sharp = (await import(pathToFileURL(sharpModulePath).href)).default;
	await sharp(fs.readFileSync(svgPath)).flatten({ background: '#ffffff' }).png().toFile(pngPath);
	process.exit(0);
}

const args = process.argv.slice(2);
const renderPng = args.includes('--png');
const files = args.filter((argument) => argument !== '--png');
if (files.length === 0) {
	console.error('사용법: node scripts/d2-measure.mjs [--png] <파일.mdx> …');
	process.exit(1);
}

const d2BinDirectory = await prepareD2();
const d2Binary = path.join(d2BinDirectory, 'd2');

// ```d2 layout=elk pad=40 title="…" 형태의 펜스에서 본문과 속성을 뽑는다.
function extractD2Blocks(source) {
	const blocks = [];
	const lines = source.split(/\r?\n/);
	let current = null;
	for (const line of lines) {
		if (current === null) {
			const opening = line.match(/^```d2\b(.*)$/);
			if (opening) current = { attributes: opening[1].trim(), body: [] };
		} else if (line === '```') {
			blocks.push({ attributes: current.attributes, body: current.body.join('\n') });
			current = null;
		} else {
			current.body.push(line);
		}
	}
	return blocks;
}

function optionsFor(attributeText) {
	const options = { ...defaultOptions };
	const attributePattern =
		/(?<key>[^\s"'=]+)=(?:(?<plain>[^\s"']+)|'(?<single>[^']+)'|"(?<double>[^"]+)")|(?<truthy>[^\s"'=]+)/g;
	for (const match of attributeText.matchAll(attributePattern)) {
		const { key: assignedKey, plain, single, double, truthy } = match.groups;
		const key = truthy ?? assignedKey;
		const value = truthy ? 'true' : (plain ?? single ?? double);
		if (key === 'layout') options.layout = value;
		if (key === 'pad') options.pad = Number(value);
		if (key === 'sketch') options.sketch = value === 'true';
		if (key === 'theme') options.theme = value;
		if (key === 'darkTheme') options.darkTheme = value;
		if (key === 'animateInterval') options.animateInterval = value;
		if (key === 'target') options.target = value === 'root' ? '' : value;
		if (key === 'appendix') options.appendix = value === 'true';
	}
	return options;
}

function d2Args(options, outputPath) {
	const args = [
		`--layout=${options.layout}`,
		`--theme=${options.theme}`,
		`--sketch=${options.sketch}`,
		`--pad=${options.pad}`,
	];
	if (options.darkTheme !== 'false') args.push(`--dark-theme=${options.darkTheme}`);
	if (options.animateInterval) args.push(`--animate-interval=${options.animateInterval}`);
	if (options.target !== undefined) args.push(`--target=${options.target}`);
	if (options.appendix) args.push('--force-appendix');
	args.push('-', outputPath);
	return args;
}

if (renderPng) fs.mkdirSync(outputRoot, { recursive: true });
const temporaryOutputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'study-starlight-d2-measure-'));

try {
	for (const file of files) {
		const absolutePath = path.resolve(file);
		const blocks = extractD2Blocks(fs.readFileSync(absolutePath, 'utf8'));
		const baseName = path.basename(absolutePath, path.extname(absolutePath));
		if (blocks.length === 0) {
			console.log(`${file}: d2 블록 없음`);
			continue;
		}
		for (const [index, block] of blocks.entries()) {
			// astro-d2 산출물과 같은 0-기준 번호(<slug>-<i>.svg)를 쓴다.
			const label = `${file} #${index}`;
			const svgPath = renderPng
				? path.join(outputRoot, `${baseName}-${index}.svg`)
				: path.join(temporaryOutputRoot, `${baseName}-${index}.svg`);
			try {
				const child = spawnSync(d2Binary, d2Args(optionsFor(block.attributes), svgPath), {
					cwd: path.dirname(absolutePath),
					encoding: 'utf8',
					input: block.body,
				});
				if (child.error) throw child.error;
				if (child.status !== 0) throw new Error(child.stderr?.trim() || `D2 종료 코드 ${child.status}`);

				const svg = fs.readFileSync(svgPath, 'utf8');
				const size = svg.match(/width="(\d+)" height="(\d+)"/);
				if (!size) {
					console.log(`${label}: SVG에서 크기를 읽지 못함`);
					continue;
				}
				const width = Number(size[1]);
				const height = Number(size[2]);
				const scale = width > CONTENT_WIDTH ? ` 배율 ${(CONTENT_WIDTH / width).toFixed(2)}` : '';
				const flag = width > REDESIGN_WIDTH ? ' ⚠ 900 초과 — 배치 재고' : '';
				console.log(`${label}: ${width}x${height}${scale}${flag}`);
				if (renderPng) {
					const pngPath = path.join(outputRoot, `${baseName}-${index}.png`);
					const rasterize = spawnSync(process.execPath, [scriptPath, '--rasterize', svgPath, pngPath], {
						stdio: ['ignore', 'ignore', 'pipe'],
					});
					if (rasterize.status === 0) {
						console.log(`  -> ${path.relative(repositoryRoot, pngPath)}`);
					} else {
						console.log('  -> PNG 실패 — 라벨의 emoji가 로컬 폰트에서 죽는 경우다. 브라우저에서 확인');
					}
				}
			} catch (error) {
				console.log(`${label}: 컴파일 실패 — ${String(error.message ?? error).split('\n')[0]}`);
			}
		}
	}
} finally {
	fs.rmSync(temporaryOutputRoot, { force: true, recursive: true });
}
