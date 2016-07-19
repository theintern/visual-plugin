import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { getTestDirectory, getBaselineFilename }
	from 'src/util/file';
import Test = require('intern/lib/Test');
import Suite = require('intern/lib/Suite');

const test: Test = <any> {
	name: 'test', // Test
	parent: {
		name: 'one', // Suite
		parent: {
			name: 'two', // Parent Suite
			parent: {
				name: 'three', // Ancestor Suite
				_remote: {
					environmentType: {
						browserName: 'Netscape Navigator' // Browser
					}
				}
			}
		}
	}
};

const suite: Suite = <any> test.parent;

registerSuite({
	name: 'file',

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
