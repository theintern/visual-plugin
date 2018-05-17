/**
 * This suite shows how to use visual-plugin.
 */

// In actual usage the import would be from @theintern/visual-plugin rather
// than ../../src/index
import { assertVisuals, visualTest } from '../../src/index';

const { registerSuite } = intern.getPlugin('interface.object');
const basicPageUrl = '_tests/tests/support/pages/basic.html';

registerSuite('example tests', {
	'simple visual test': visualTest({
		url: basicPageUrl,
		width: 640,
		height: 480,
		missingBaseline: 'snapshot'
	}),

	'custom visual test'() {
		return this.remote
			.get(basicPageUrl)
			.setWindowSize(640, 480)
			.takeScreenshot()
			.then(
				assertVisuals(this, {
					missingBaseline: 'snapshot'
				})
			);
	}
});
