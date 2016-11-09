import * as registerSuite from 'intern!object';
import { visualTest } from 'intern-visual/index';

import { IRequire } from 'dojo/loader';
declare const require: IRequire;

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
