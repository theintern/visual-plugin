/**
 * @module main Provies an AMD loader plugin for use with Intern
 */

export const configuration = {
	nodeModule: 'intern/dojo/node!'
};

export function load(id: string, parentRequire: any, callback: () => void) {
	require([ id ], callback);
}

export function normalize(id: string): string {
	if (id === 'test') {
		id = './visualTest';
	}
	if (id === 'assert') {
		id = './assertVisuals';
	}
	if (id === 'config') {
		id = './config';
	}

	return configuration.nodeModule + id;
}
