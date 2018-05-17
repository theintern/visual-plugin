/**
 * This suite shows how to use the low-level APIs provided by visual-plugin.
 */

import { existsSync } from 'fs';
import { join as joinPath } from 'path';
import Command from '@theintern/leadfoot/Command';
import Test, { SKIP } from 'intern/lib/Test';

import { config, assertVisuals } from '../../src/index';
import {
	getBaselineFilename,
	getTestDirectory,
	save,
	remove as removeFile
} from '../../src/util/file';
import { VisualRegressionTest } from '../../src/assert';
import resizeWindow from '../../src/helpers/resizeWindow';

const { registerSuite } = intern.getPlugin('interface.object');
const { assert } = intern.getPlugin('chai');
const basicPageUrl = '_tests/tests/support/pages/basic.html';

registerSuite('assertVisuals', {
	'no baselines generated': {
		'defaults missingBaseline = skip; test is skipped'() {
			const test: VisualRegressionTest = this;

			return this.remote
				.then(removeBaseline(test))
				.then(initializePage())
				.takeScreenshot()
				.then(snapshot => {
					const action = assertVisuals(test);
					let exception: Error | undefined;
					try {
						action.call(this, snapshot);
					} catch (e) {
						exception = e;
					}

					assert.lengthOf(test.visualResults!, 1);
					assert.equal(exception, SKIP);

					// clear the `skipped` flag on the test
					test.skipped = undefined;
				})
				.then(doesBaselineExist(test, false));
		},

		'missingBaseline = skip; test is skipped'() {
			const test: VisualRegressionTest = this;

			return this.remote
				.then(removeBaseline(test))
				.then(initializePage())
				.takeScreenshot()
				.then(snapshot => {
					const action = assertVisuals(test, {
						missingBaseline: 'skip'
					});
					let exception: Error | undefined;
					try {
						action.call(this, snapshot);
					} catch (e) {
						exception = e;
					}

					assert.lengthOf(test.visualResults!, 1);
					assert.equal(exception, SKIP);

					// clear the `skipped` flag on the test
					test.skipped = undefined;
				})
				.then(doesBaselineExist(test, false));
		},

		'missingBaseline = snapshop; test passes, a snapshot is generated'(
			this: VisualRegressionTest
		) {
			const test = this;

			return this.remote
				.then(removeBaseline(test))
				.then(initializePage())
				.takeScreenshot()
				.then(
					assertVisuals(test, {
						missingBaseline: 'snapshot'
					})
				)
				.then(result => {
					assert.lengthOf(test.visualResults!, 1);
					assert.isFalse(result.baselineExists);
					assert.isTrue(result.generatedBaseline);
					assert.isUndefined(result.report);
				})
				.then(doesBaselineExist(test, true));
		},

		'missingBaseline = fail; tests fails'(this: VisualRegressionTest) {
			const test = this;

			return this.remote
				.then(removeBaseline(test))
				.then(initializePage())
				.takeScreenshot()
				.then(snapshot => {
					assert.throws(() => {
						const action = assertVisuals(test, {
							missingBaseline: 'fail'
						});
						action.call(this, snapshot);
					}, 'missing baseline');
					assert.lengthOf(test.visualResults!, 1);
				})
				.then(doesBaselineExist(test, false));
		}
	},

	'preexisting baselines': {
		'snapshot matches baseline; test passes'(this: VisualRegressionTest) {
			const test = this;

			return this.remote
				.then(initializePage())
				.then(generateBaseline(getBaselinePath(test)))
				.takeScreenshot()
				.then(
					assertVisuals(test, {
						missingBaseline: 'fail'
					})
				)
				.then(result => {
					const report = result.report;
					assert.property(test, 'visualResults');
					assert.lengthOf(test.visualResults!, 1);
					assert.isTrue(report!.isPassing);
					assert.strictEqual(report!.numDifferences, 0);
					assert.lengthOf(test.visualResults!, 1);
				});
		},

		'snapshot does not match baseline; test fails'(
			this: VisualRegressionTest
		) {
			const test = this;

			return this.remote
				.then(initializePage())
				.then(generateBaseline(getBaselinePath(test)))
				.execute(() => {
					const p = document.querySelector('#container > p')!;
					p.textContent = 'hello';
				})
				.then(generateBaseline(getBaselinePath(test, '.actual')))
				.then(assertVisuals(this, { missingBaseline: 'fail' }))
				.then(
					() => {
						throw 'Expected mismatch';
					},
					error => {
						assert.lengthOf(test.visualResults!, 1);
						assert.property(
							error,
							'report',
							`report is missing. ${error.message}`
						);
					}
				);
		}
	}
});

function getBaselinePath(test: Test, suffix?: string) {
	const testDirectory = getTestDirectory(test.parent);
	let baselineName = getBaselineFilename(test);
	if (suffix) {
		baselineName = baselineName.slice(0, -4) + suffix + '.png';
	}
	return joinPath(
		config.directory!,
		config.baselineLocation!,
		testDirectory,
		baselineName
	);
}

function initializePage(url: string = basicPageUrl) {
	return function(this: Command<any>) {
		return this.parent.get(url).then(resizeWindow(640, 480));
	};
}

function generateBaseline(baseline: string) {
	return function(this: Command<any>) {
		return this.parent.takeScreenshot().then(screenshot => {
			save(baseline, screenshot);
			return screenshot;
		});
	};
}

function doesBaselineExist(test: Test, expected?: boolean) {
	return function() {
		return new Promise(resolve => {
			const filename = getBaselinePath(test);
			const exists = existsSync(filename);
			if (typeof expected === 'boolean') {
				assert.equal(exists, expected);
			}
			resolve(exists);
		});
	};
}

function removeBaseline(test: Test) {
	return () => {
		const filename = getBaselinePath(test);
		return removeFile(filename);
	};
}
