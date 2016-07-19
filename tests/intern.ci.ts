export const capabilities = {
	'selenium-version': '2.43.0',
	'idle-timeout': 30
};

export const environments = [
	{ browserName: 'internet explorer', version: '11.0', platform: 'Windows 10' },
	{ browserName: 'internet explorer', version: '10.0', platform: 'Windows 8' },
	{ browserName: 'internet explorer', version: '9.0', platform: 'Windows 7' },
	{ browserName: 'firefox', version: '33.0', platform: [ 'Windows 7', 'OS X 10.11' ] },
	{ browserName: 'chrome', version: '38.0', platform: [ 'Windows 7', 'OS X 10.11' ] },
	{ browserName: 'safari', version: '9.0', platform: 'OS X 10.11' }
];

export const maxConcurrency = 1;

export const tunnel = 'SauceLabsTunnel';

export * from './intern';
