export const capabilities = {
	'idle-timeout': 30
};

export const environments = [
	{ browserName: 'internet explorer', version: ['10', '11'] },
	{ browserName: 'firefox', version: ['33', 'latest'], platform: [ 'Windows 7', 'OS X 10.11' ] },
	{ browserName: 'chrome', version: ['38', 'latest'], platform: [ 'Windows 7', 'OS X 10.11' ] },
	{ browserName: 'safari', version: ['9', '10'] }
];

export const maxConcurrency = 1;

export const tunnel = 'SauceLabsTunnel';

export * from './intern';
