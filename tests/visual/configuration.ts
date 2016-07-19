import * as registerSuite from 'intern!object';
import { visualTest } from 'src/index';

const basicPageUrl = require.toUrl('../support/pages/basic.html');

registerSuite({
	name: 'configuration',

	'basic test': visualTest({
		url: basicPageUrl,
		width: 640,
		height: 480,
		missingBaseline: 'ignore'
	})
});
