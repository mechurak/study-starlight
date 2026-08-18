import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.env.CF_PAGES === '1') {
	const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
	const shallowCheck = spawnSync('git', ['rev-parse', '--is-shallow-repository'], {
		cwd: repositoryRoot,
		encoding: 'utf8',
	});

	if (shallowCheck.status !== 0) {
		console.error('Cloudflare Pages 빌드에서 Git 저장소 상태를 확인하지 못했습니다.');
		process.exitCode = 1;
	} else if (shallowCheck.stdout.trim() === 'true') {
		console.log('Cloudflare Pages의 얕은 Git 이력을 전체 이력으로 확장합니다.');
		const fetch = spawnSync('git', ['fetch', '--unshallow', '--no-tags', 'origin'], {
			cwd: repositoryRoot,
			stdio: 'inherit',
		});

		if (fetch.status !== 0) {
			console.error('Cloudflare Pages 빌드에 필요한 전체 Git 이력을 가져오지 못했습니다.');
			process.exitCode = 1;
		}
	}
}
