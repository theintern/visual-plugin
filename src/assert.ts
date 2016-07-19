import { existsSync } from 'fs';
import { join as pathJoin } from 'path';
import { getTestDirectory, getBaselineFilename, save } from './util/file';
import Test = require('intern/lib/Test');
import ImageComparator from './comparators/PngJsImageComparator';
import LeadfootCommand = require('leadfoot/Command');
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
	report: Report;
	screenshot: Buffer | string;
}

export interface VisualRegressionTest extends Test {
	visualResults?: AssertionResult[];
}

function generateBaseline(baseline: string, screenshot: Buffer, result: AssertionResult): Promise<AssertionResult> {
	return save(baseline, screenshot)
		.then(function () {
			result.generatedBaseline = true;
			return result;
		});
}

function compareVisuals(baseline: string, screenshot: Buffer, result: AssertionResult): Promise<AssertionResult> {
	const comparator = new ImageComparator();

	return comparator.compare(baseline, screenshot)
		.then(function (report) {
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
export default function assertVisuals(test: VisualRegressionTest, options: Options = config) {
	return function (this: LeadfootCommand<any>, screenshot: Buffer): Promise<AssertionResult> | never {
		if (!test.visualResults) {
			test.visualResults = [];
		}
		const count = test.visualResults.length;
		const testDirectory: string = getTestDirectory(test.parent);

		let baseline = options.baseline;
		if (!baseline) {
			const directory: string = options.directory || config.directory;
			const baselineName = getBaselineFilename(test, count);
			const baselineLocation: string = options.baselineLocation || config.baselineLocation;
			const baselineRelative: string = pathJoin(baselineLocation, testDirectory, baselineName);
			baseline = pathJoin(directory, baselineRelative);
		}

		const baselineExists: boolean = existsSync(baseline);
		const result: AssertionResult = {
			baseline,
			baselineExists,
			count,
			generatedBaseline: false,
			options,
			report: null,
			screenshot
		};

		test.visualResults.push(result);

		if (options.regenerateBaselines) {
			return generateBaseline(baseline, screenshot, result);
		}
		else if (baselineExists) {
			return compareVisuals(baseline, screenshot, result);
		}
		else {
			switch (options.missingBaseline || config.missingBaseline) {
				case 'ignore':
					return Promise.resolve(result);
				case 'skip':
					throw test.skip('missing baseline');
				case 'snapshot':
					return generateBaseline(baseline, screenshot, result);
				default:
					throw new Error('missing baseline');
			}
		}
	};
}
