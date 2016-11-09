/// <reference path="../modules.d.ts" />

import { existsSync } from 'fs';
import { join as joinPath } from 'path';
import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { config, assertVisuals, util } from 'intern-visual/index';
import * as Test from 'intern/lib/Test';
import { getBaselineFilename, getTestDirectory, remove as removeFile } from 'intern-visual/util/file';
import { AssertionResult, VisualRegressionTest } from 'intern-visual/assert';
import resizeWindow from 'intern-visual/helpers/resizeWindow';

import { IRequire } from 'dojo/loader';
declare const require: IRequire;

const basicPageUrl = require.toUrl('../support/pages/basic.html');

function getBaselinePath(test: Test, suffix?: string) {
	const testDirectory = getTestDirectory(test.parent);
	let baselineName = getBaselineFilename(test);
	if (suffix) {
		baselineName = baselineName.slice(0, -4) + suffix + '.png';
	}
	return joinPath(config.directory, config.baselineLocation, testDirectory, baselineName);
}

function initializePage(url: string = basicPageUrl) {
	return function () {
		return this.parent
			.get(url)
			.then(resizeWindow(640, 480));
	};
}

function generateBaseline(baseline: string): () => Promise<Buffer> {
	return function () {
		return this.parent
			.takeScreenshot()
			.then(function (screenshot: Buffer) {
				util.file.save(baseline, screenshot);
				return screenshot;
			});
	};
}

function doesBaselineExist(test: Test, expected?: boolean) {
	return function () {
		return new Promise(function (resolve) {
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
	return function () {
		const filename = getBaselinePath(test);
		return removeFile(filename);
	};
}

registerSuite({
	name: 'programmatic',

	'no baselines generated': {
		'defaults missingBaseline = skip; test is skipped'() {
			const test: VisualRegressionTest = this;

			return this.remote
				.then(removeBaseline(test))
				.then(initializePage())
				.takeScreenshot()
				.then(function (snapshot: Buffer) {
					const action = assertVisuals(test);
					let exception: Error = null;
					try {
						action.call(this, snapshot);
					}
					catch (e) {
						exception = e;
					}

					assert.lengthOf(test.visualResults, 1);
					assert.equal(exception, (<any> Test).SKIP);
				})
				.then(doesBaselineExist(test, false));
		},

		'missingBaseline = skip; test is skipped'() {
			const test: VisualRegressionTest = this;

			return this.remote
				.then(removeBaseline(test))
				.then(initializePage())
				.takeScreenshot()
				.then(function (snapshot: Buffer) {
					const action = assertVisuals(test, {
						missingBaseline: 'skip'
					});
					let exception: Error = null;
					try {
						action.call(this, snapshot);
					}
					catch (e) {
						exception = e;
					}

					assert.lengthOf(test.visualResults, 1);
					assert.equal(exception, (<any> Test).SKIP);
				})
				.then(doesBaselineExist(test, false));
		},

		'missingBaseline = snapshop; test passes, a snapshot is generated'() {
			const test = this;

			return this.remote
				.then(removeBaseline(test))
				.then(initializePage())
				.takeScreenshot()
				.then(assertVisuals(test, {
					missingBaseline: 'snapshot'
				}))
				.then(function (result: AssertionResult) {
					assert.lengthOf(test.visualResults, 1);
					assert.isFalse(result.baselineExists);
					assert.isTrue(result.generatedBaseline);
					assert.isNull(result.report);
				})
				.then(doesBaselineExist(test, true));
		},

		'missingBaseline = fail; tests fails'() {
			const test = this;

			return this.remote
				.then(removeBaseline(test))
				.then(initializePage())
				.takeScreenshot()
				.then(function (snapshot: Buffer) {
					assert.throws(function () {
						const action = assertVisuals(test, {
							missingBaseline: 'fail'
						});
						action.call(this, snapshot);
					}, 'missing baseline');
					assert.lengthOf(test.visualResults, 1);
				})
				.then(doesBaselineExist(test, false));
		}
	},

	'preexisting baselines': {
		'snapshot matches baseline; test passes'() {
			const test = this;

			return this.remote
				.then(initializePage())
				.then(generateBaseline(getBaselinePath(test)))
				.takeScreenshot()
				.then(assertVisuals(test, {
					missingBaseline: 'fail'
				}))
				.then(function (result: AssertionResult) {
					const report = result.report;
					assert.property(test, 'visualResults');
					assert.lengthOf(test.visualResults, 1);
					assert.isTrue(report.isPassing);
					assert.strictEqual(report.numDifferences, 0);
					assert.lengthOf(test.visualResults, 1);
				});
		},

		'snapshot does not match baseline; test fails'() {
			const test = this;

			return this.remote
				.then(initializePage())
				.then(generateBaseline(getBaselinePath(test)))
				.execute(function () {
					var p = document.querySelector('#container > p');
					p.textContent = 'hello';
				})
				.then(generateBaseline(getBaselinePath(test, '.actual')))
				.then(assertVisuals(this, {
					missingBaseline: 'fail'
				}))
				.then(function () {
					throw('Expected mismatch');
				}, function (error: Error) {
					assert.lengthOf(test.visualResults, 1);
					assert.property(error, 'report', `report is missing. ${ error.message }`);
				});
		}
	}
});
