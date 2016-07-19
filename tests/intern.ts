// Intern Configuration
// @see https://theintern.github.io/intern/#common-config

export const destination = './_build/';

export const environments = [
	{ browserName: 'chrome' }
];

export const maxConcurrency = 1;

export const tunnel = 'NullTunnel';

export const loaders = {
	'host-browser': 'node_modules/dojo-loader/loader.js',
	'host-node': 'dojo-loader'
};

export const loaderOptions = {
	baseUrl: `${ destination }`,
	packages: [
		{ name: 'src', location: `src` },
		{ name: 'tests', location: `tests` }
	]
};

export const suites: string[] = [ 'tests/unit/all' ];

export const functionalSuites: string[] = [ 'tests/functional/all', 'tests/visual/all' ];

export const excludeInstrumentation = /^(?:tests|node_modules)\//;
