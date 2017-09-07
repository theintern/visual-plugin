import { existsSync } from 'intern/dojo/node!fs';
import { Thenable } from 'dojo/Promise';
import { join as pathJoin } from 'intern/dojo/node!path';
import { getTestDirectory, getBaselineFilename, save } from './util/file';
import Test = require('intern/lib/Test');
import ImageComparator from './comparators/PngJsImageComparator';
import * as Command from 'leadfoot/Command';
import { Report } from './interfaces';
import config from './config';
import VisualRegressionError from './VisualRegressionError';

export interface Options {
	baseline?: string;
	baselineLocation?: string;
	directory?: string;
	regenerateBaselines?: boolean;
	missingBaseline?: 'fail' | 'ignore' | 'skip' | 'snapshot';
}

export interface AssertionResult {
	baseline: string;
	baselineExists: boolean;
	count: number;
	generatedBaseline: boolean;
	options: Options;
	report?: Report;
	screenshot: Buffer | string;
}

export interface VisualRegressionTest extends Test {
	visualResults?: AssertionResult[];
}

function generateBaseline(
	baseline: string,
	screenshot: Buffer,
	result: AssertionResult
) {
	return save(baseline, screenshot).then(function() {
		result.generatedBaseline = true;
		return result;
	});
}

function compareVisuals(
	baseline: string,
	screenshot: Buffer,
	result: AssertionResult
) {
	const comparator = new ImageComparator();

	return comparator.compare(baseline, screenshot).then(function(report) {
		// Add the report to the current test for later processing by the Reporter
		result.report = report;

		if (!report.isPassing) {
			throw new VisualRegressionError('failed visual regression', report);
		}

		return result;
	});
}

/**
 * A LeadFoot Helper for asserting visual regression against a baseline. This helper is responsible for
 * determining if the test should pass, fail, or be skipped and provide enough metadata to the reporter
 * so it may generate any of the necessary data (including baselines).
 *
 * @param test the Intern test where this helper is running
 * @param options execution options overriding defaults
 * @return {(screenshot:Buffer)=>Promise<TResult>}
 */
export default function assertVisuals(
	test: VisualRegressionTest,
	options: Options = config
) {
	return function(
		this: Command<any>,
		screenshot: Buffer
	): Thenable<AssertionResult> {
		if (!test.visualResults) {
			test.visualResults = [];
		}
		const count = test.visualResults.length;
		const testDirectory: string = getTestDirectory(test.parent);

		let baseline = options.baseline;
		if (!baseline) {
			const directory = options.directory || config.directory!;
			const baselineName = getBaselineFilename(test, count);
			const baselineLocation =
				options.baselineLocation || config.baselineLocation!;
			const baselineRelative: string = pathJoin(
				baselineLocation,
				testDirectory,
				baselineName
			);
			baseline = pathJoin(directory, baselineRelative);
		}

		const baselineExists = existsSync(baseline);
		const result = {
			baseline,
			baselineExists,
			count,
			generatedBaseline: false,
			options,
			screenshot
		};

		test.visualResults.push(result);

		if (options.regenerateBaselines) {
			return <Thenable<AssertionResult>>generateBaseline(baseline, screenshot, result);
		} else if (baselineExists) {
			return <Thenable<AssertionResult>>compareVisuals(baseline, screenshot, result);
		} else {
			switch (options.missingBaseline || config.missingBaseline) {
				case 'ignore':
					return <Thenable<AssertionResult>>Promise.resolve(result);
				case 'skip':
					throw test.skip('missing baseline');
				case 'snapshot':
					return <Thenable<AssertionResult>>generateBaseline(baseline, screenshot, result);
				default:
					throw new Error('missing baseline');
			}
		}
	};
}
