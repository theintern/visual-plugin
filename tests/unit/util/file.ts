import { getTestDirectory, getBaselineFilename } from '../../../src/util/file';

const test = {
	name: 'test', // Test
	parent: {
		name: 'one', // Suite
		parent: {
			name: 'two', // Parent Suite
			parent: {
				name: 'three', // Ancestor Suite
				remote: {
					environmentType: {
						browserName: 'Netscape Navigator' // Browser
					}
				}
			}
		}
	}
};

const suite = test.parent;

registerSuite('file', {
	'.getTestDirectory': {
		'no extra options'() {
			const actual = getTestDirectory(suite);
			const expected = 'two/one';
			assert.equal(actual, expected);
		},

		'with includeBrowser = true'() {
			const actual = getTestDirectory(suite, true);
			const expected = 'Netscape Navigator/two/one';
			assert.equal(actual, expected);
		}
	},

	'.getBaselineFilename()': {
		'no extra options'() {
			const actual = getBaselineFilename(test);
			const expected = 'test.png';
			assert.equal(actual, expected);
		},

		'with suffix'() {
			const actual = getBaselineFilename(test, 3);
			const expected = 'test_3.png';
			assert.equal(actual, expected);
		}
	}
});
