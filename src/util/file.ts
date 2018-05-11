import {
	mkdirSync,
	existsSync,
	writeFile,
	createReadStream,
	createWriteStream,
	unlink
} from 'fs';
import { dirname, join, normalize, sep } from 'path';

export function sanatizeFilename(name: string): string {
	// TODO sanatize strings to a valid filename
	return name;
}

export interface Hierarchy {
	remote?: {
		environmentType?: {
			browserName?: string;
		};
	};
	name?: string;
	parent?: Hierarchy;
}

/**
 * Given an Intern test, create a unique path to contain baselines.
 *
 * @param leaf the current test
 * @param includeBrowser if the current browser should be returned
 */
export function getTestDirectory(
	current: Hierarchy,
	includeBrowser: boolean = false
): string {
	const name: string[] = [];

	while (current.parent) {
		name.unshift(current.name!);
		current = current.parent;
	}

	if (includeBrowser) {
		name.unshift(current.remote!.environmentType!.browserName!);
	}

	return sanatizeFilename(name.join('/'));
}

/**
 * Given an Intern test, create a unique name for a baseline file.
 */
export function getBaselineFilename(test: { name: string }, count: number = 0) {
	const suffix = count ? `_${count}` : '';
	return sanatizeFilename(`${test.name}${suffix}.png`);
}

/**
 * Create a directory, including any parent directories.
 */
export function mkdir(directory: string) {
	const parts = normalize(directory).split(sep);
	let dir = '';
	while (parts.length > 0) {
		dir = join(dir, parts.shift()!);
		if (!existsSync(dir)) {
			mkdirSync(dir);
		}
	}
	return Promise.resolve();
}

/**
 * Save a file
 */
export function save(filename: string, buffer: Buffer | string) {
	return mkdir(dirname(filename)).then(() => {
		return new Promise((resolve, reject) => {
			writeFile(filename, buffer, error => {
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			});
		});
	});
}

/**
 * Copy a file to a new location.
 */
export function copy(source: string, target: string) {
	return mkdir(dirname(target)).then(() => {
		return new Promise((resolve, reject) => {
			const inStream = createReadStream(source);
			inStream.on('error', error => reject(error));

			const outStream = createWriteStream(target);
			outStream.on('error', error => reject(error));
			outStream.on('close', () => resolve());

			inStream.pipe(outStream);
		});
	});
}

/**
 * Load data from a file into a target stream.
 */
export function load<T extends NodeJS.WritableStream>(
	source: string,
	target: T
) {
	return new Promise(function(resolve, reject) {
		const inStream = createReadStream(source);
		inStream.on('error', error => reject(error));
		inStream.on('close', () => resolve());
		inStream.pipe(target);
	});
}

/**
 * Remove a file.
 */
export function remove(target: string) {
	return new Promise((resolve, reject) => {
		unlink(target, error => {
			if (error && error.code !== 'ENOENT') {
				reject(error);
			} else {
				resolve();
			}
		});
	});
}
