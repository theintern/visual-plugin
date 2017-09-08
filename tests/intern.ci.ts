export const capabilities = {
	'idle-timeout': 30
};

export const environments = [
	{ browserName: 'internet explorer', version: ['10', '11'] },
	{ browserName: 'firefox', version: ['33', 'latest'], platform: [ 'WINDOWS', 'MAC' ] },
	{ browserName: 'chrome', version: ['38', 'latest'], platform: [ 'WINDOWS', 'MAC' ] },
	// Use Safari 'dev' version (Developer Preview) because normal Safari 10
	// has poor WebDriver support
	{ browserName: 'safari', version: ['9', 'dev'] }
];

export const maxConcurrency = 1;

export const tunnel = 'BrowserStackTunnel';

export * from './intern';
