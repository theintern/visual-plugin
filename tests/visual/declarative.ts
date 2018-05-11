/**
 * This suite shows how to use the high-level `visualTest` helper to create
 * visual snapshot tests.
 */

import { visualTest } from '../../src/index';

const { registerSuite } = intern.getPlugin('interface.object');
const basicPageUrl = '_tests/tests/support/pages/basic.html';

registerSuite('visualTest', {
	'basic test': visualTest({
		url: basicPageUrl,
		width: 640,
		height: 480,
		missingBaseline: 'ignore'
	})
});
