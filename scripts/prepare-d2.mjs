// astro-d2가 사용할 공식 D2 standalone 바이너리를 준비한다.
//
// - 버전과 플랫폼별 archive SHA-256은 D2 v0.8.2 공식 SHA256SUMS에 고정한다.
// - Cloudflare Pages가 Astro build cache로 보존하는 node_modules/.astro 아래에 둔다.
// - archive는 임시 디렉터리에서 다운로드·검증·압축 해제하고, 검증된 바이너리만
//   같은 파일시스템 안에서 rename해 캐시에 원자적으로 반영한다.

import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { constants, createReadStream, createWriteStream } from 'node:fs';
import {
	access,
	chmod,
	copyFile,
	mkdir,
	mkdtemp,
	readdir,
	rename,
	rm,
} from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const D2_VERSION = 'v0.8.2';

const releaseBaseUrl = `https://github.com/d2lang/d2/releases/download/${D2_VERSION}`;
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cacheRoot = path.join(repositoryRoot, 'node_modules', '.astro', 'd2', D2_VERSION);
const execFileAsync = promisify(execFile);

// https://github.com/d2lang/d2/releases/download/v0.8.2/SHA256SUMS
const releaseAssets = Object.freeze({
	'linux-x64': {
		archive: 'd2-v0.8.2-linux-amd64.tar.gz',
		sha256: '0ea49e35f17c3ac00ffa5d0a1fa571f5c344cd38127dbaa4bf6158fcd0c7bfb0',
	},
	'linux-arm64': {
		archive: 'd2-v0.8.2-linux-arm64.tar.gz',
		sha256: 'bf1585cebf8496690668dc135dfd469068e3ae3eb38cecdc1f7d7835cdbc1228',
	},
	'darwin-x64': {
		archive: 'd2-v0.8.2-macos-amd64.tar.gz',
		sha256: '6c7b7a09278b131664cbc5e715dac0ee849c3f785ffc9dfaab2df6b1f91bf8ed',
	},
	'darwin-arm64': {
		archive: 'd2-v0.8.2-macos-arm64.tar.gz',
		sha256: '73ddb07c636bd5c5723e4bf8569a90b7329ea35dc32af2155650e1f572e823b2',
	},
});

function errorDetail(error) {
	if (error && typeof error === 'object' && 'stderr' in error && error.stderr) {
		return String(error.stderr).trim();
	}
	return error instanceof Error ? error.message : String(error);
}

function resolveReleaseAsset(platform = process.platform, architecture = process.arch) {
	const platformKey = `${platform}-${architecture}`;
	const asset = releaseAssets[platformKey];
	if (!asset) {
		const supported = Object.keys(releaseAssets).join(', ');
		throw new Error(
			`[D2 미지원 플랫폼] ${platformKey}용 D2 ${D2_VERSION} archive가 없습니다. 지원 조합: ${supported}`,
		);
	}
	return { ...asset, platformKey };
}

async function pathExists(filePath) {
	try {
		await access(filePath, constants.F_OK);
		return true;
	} catch {
		return false;
	}
}

async function verifyBinary(binaryPath) {
	try {
		await access(binaryPath, constants.X_OK);
	} catch (error) {
		throw new Error(`[D2 실행 권한 검증 실패] '${binaryPath}'를 실행할 수 없습니다: ${errorDetail(error)}`, {
			cause: error,
		});
	}
	let stdout;
	try {
		({ stdout } = await execFileAsync(binaryPath, ['--version'], { encoding: 'utf8' }));
	} catch (error) {
		throw new Error(`[D2 실행 검증 실패] '${binaryPath} --version': ${errorDetail(error)}`, {
			cause: error,
		});
	}

	const actualVersion = stdout.trim();
	if (actualVersion !== D2_VERSION) {
		throw new Error(
			`[D2 버전 불일치] '${binaryPath} --version' 결과가 '${actualVersion}'입니다. '${D2_VERSION}'이어야 합니다.`,
		);
	}
}

async function downloadArchive(url, destination) {
	let response;
	try {
		response = await fetch(url, { redirect: 'follow' });
	} catch (error) {
		throw new Error(`[D2 네트워크 실패] ${url} 다운로드 요청에 실패했습니다: ${errorDetail(error)}`, {
			cause: error,
		});
	}

	if (!response.ok || !response.body) {
		throw new Error(
			`[D2 네트워크 실패] ${url} 다운로드가 HTTP ${response.status} ${response.statusText}로 실패했습니다.`,
		);
	}

	try {
		await pipeline(Readable.fromWeb(response.body), createWriteStream(destination, { flags: 'wx' }));
	} catch (error) {
		throw new Error(`[D2 네트워크 실패] ${url} 응답을 저장하지 못했습니다: ${errorDetail(error)}`, {
			cause: error,
		});
	}
}

async function sha256(filePath) {
	const hash = createHash('sha256');
	await pipeline(createReadStream(filePath), hash);
	return hash.digest('hex');
}

async function extractArchive(archivePath, destination) {
	try {
		await mkdir(destination);
		await execFileAsync('tar', ['-xzf', archivePath, '-C', destination], {
			encoding: 'utf8',
			maxBuffer: 10 * 1024 * 1024,
		});
	} catch (error) {
		throw new Error(
			`[D2 압축 해제 실패] '${archivePath}'를 풀지 못했습니다: ${errorDetail(error)}`,
			{ cause: error },
		);
	}
}

async function findExtractedBinary(directory) {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const entryPath = path.join(directory, entry.name);
		if (entry.isFile() && entry.name === 'd2') return entryPath;
		if (entry.isDirectory()) {
			const nested = await findExtractedBinary(entryPath);
			if (nested) return nested;
		}
	}
	return undefined;
}

async function publishCache(stagedCache, cacheDirectory, temporaryDirectory) {
	const previousCache = path.join(temporaryDirectory, 'previous-cache');
	let movedPreviousCache = false;

	try {
		await rename(cacheDirectory, previousCache);
		movedPreviousCache = true;
	} catch (error) {
		if (!error || typeof error !== 'object' || error.code !== 'ENOENT') {
			throw new Error(`[D2 캐시 반영 실패] 기존 캐시를 교체 준비하지 못했습니다: ${errorDetail(error)}`, {
				cause: error,
			});
		}
	}

	try {
		await rename(stagedCache, cacheDirectory);
	} catch (error) {
		if (movedPreviousCache) {
			try {
				await rename(previousCache, cacheDirectory);
			} catch {
				// 원래 오류를 유지한다. 다음 실행에서 캐시 검증 후 다시 설치한다.
			}
		}
		throw new Error(`[D2 캐시 반영 실패] 검증된 바이너리를 캐시에 반영하지 못했습니다: ${errorDetail(error)}`, {
			cause: error,
		});
	}

	if (movedPreviousCache) await rm(previousCache, { force: true, recursive: true });
}

/**
 * 현재 플랫폼의 공식 D2 v0.8.2 바이너리를 검증해 준비하고, d2가 든 bin 디렉터리를 반환한다.
 */
export async function prepareD2() {
	const asset = resolveReleaseAsset();
	const cacheDirectory = path.join(cacheRoot, asset.platformKey);
	const binDirectory = path.join(cacheDirectory, 'bin');
	const binaryPath = path.join(binDirectory, 'd2');

	if (await pathExists(binaryPath)) {
		try {
			await verifyBinary(binaryPath);
			console.log(`[d2] 캐시 사용: ${D2_VERSION} (${asset.platformKey})`);
			return binDirectory;
		} catch (error) {
			console.warn(`[d2] 캐시 검증 실패, 다시 설치합니다: ${errorDetail(error)}`);
		}
	}

	await mkdir(cacheRoot, { recursive: true });
	const temporaryDirectory = await mkdtemp(path.join(cacheRoot, `.prepare-${asset.platformKey}-`));
	const archivePath = path.join(temporaryDirectory, asset.archive);
	const extractedDirectory = path.join(temporaryDirectory, 'extracted');
	const stagedCache = path.join(temporaryDirectory, 'staged-cache');
	const stagedBinDirectory = path.join(stagedCache, 'bin');
	const stagedBinary = path.join(stagedBinDirectory, 'd2');
	const archiveUrl = `${releaseBaseUrl}/${asset.archive}`;

	try {
		console.log(`[d2] 다운로드: ${asset.archive}`);
		await downloadArchive(archiveUrl, archivePath);

		const actualChecksum = await sha256(archivePath);
		if (actualChecksum !== asset.sha256) {
			throw new Error(
				`[D2 체크섬 불일치] ${asset.archive}의 SHA-256이 ${actualChecksum}입니다. 고정값 ${asset.sha256}과 다릅니다.`,
			);
		}

		await extractArchive(archivePath, extractedDirectory);
		const extractedBinary = await findExtractedBinary(extractedDirectory);
		if (!extractedBinary) {
			throw new Error(
				`[D2 압축 해제 실패] ${asset.archive} 안에서 실행 파일 'd2'를 찾지 못했습니다.`,
			);
		}

		await mkdir(stagedBinDirectory, { recursive: true });
		await copyFile(extractedBinary, stagedBinary);
		await chmod(stagedBinary, 0o755);
		await verifyBinary(stagedBinary);
		await publishCache(stagedCache, cacheDirectory, temporaryDirectory);
		await verifyBinary(binaryPath);
		console.log(`[d2] 설치 완료: ${binaryPath}`);
		return binDirectory;
	} finally {
		await rm(temporaryDirectory, { force: true, recursive: true });
	}
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : undefined;
if (invokedPath === import.meta.url) {
	prepareD2().catch((error) => {
		console.error(errorDetail(error));
		process.exitCode = 1;
	});
}
