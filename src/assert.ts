import { existsSync } from 'fs';
import { join as pathJoin } from 'path';
import Test from 'intern/lib/Test';
import Command from '@theintern/leadfoot/Command';

import { getTestDirectory, getBaselineFilename, save } from './util/file';
import ImageComparator from './comparators/PngJsImageComparator';
import { Report } from './interfaces';
import config from './config';
import VisualRegressionError from './VisualRegressionError';

/**
 * A LeadFoot Helper for asserting visual regression against a baseline. This
 * helper is responsible for determining if the test should pass, fail, or be
 * skipped and provide enough metadata to the reporter so it may generate any
 * of the necessary data (including baselines).
 *
 * @param test the Intern test where this helper is running
 * @param options execution options overriding defaults
 */
export default function assertVisuals(
	test: VisualRegressionTest,
	options: Options = config
) {
	return function(
		this: Command<any>,
		screenshot: Buffer
	): PromiseLike<AssertionResult> {
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
			return generateBaseline(baseline, screenshot, result);
		} else if (baselineExists) {
			return compareVisuals(baseline, screenshot, result);
		} else {
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

/**
 * Options for visual assertions
 */
export interface Options {
	/**
	 * The full path if the test baseline image. If not specified, `baseline`
	 * is computed from `directory`, `baselineLocation`, and the test name.
	 */
	baseline?: string;

	/**
	 * The location of baselines within the output directory. The default is
	 * 'baselines'.
	 */
	baselineLocation?: string;

	/**
	 * The directory that all other output will be written to. The default is
	 * 'visual-test'.
	 */
	directory?: string;

	/** If true, overwrite existing baselines */
	regenerateBaselines?: boolean;

	/**
	 * What to do if a test baseline is missing
	 *   fail: fail the test
	 *   ignore: ignore the missing baseline
	 *   skip: skip the test
	 *   snapshot: take a snapshot to serve as the new baseline
	 */
	missingBaseline?: 'fail' | 'ignore' | 'skip' | 'snapshot';
}

/**
 * The result of a visual assertion
 */
export interface AssertionResult {
	baseline: string;
	baselineExists: boolean;
	count: number;
	generatedBaseline: boolean;
	options: Options;
	report?: Report;
	screenshot: Buffer | string;
}

/**
 * An extension of Intern's test that adds visual assertion results
 */
export interface VisualRegressionTest extends Test {
	visualResults?: AssertionResult[];
}

function generateBaseline(
	baseline: string,
	screenshot: Buffer,
	result: AssertionResult
) {
	return save(baseline, screenshot).then(() => {
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

	return comparator.compare(baseline, screenshot).then(report => {
		// Add the report to the current test for later processing by the Reporter
		result.report = report;

		if (!report.isPassing) {
			throw new VisualRegressionError('failed visual regression', report);
		}

		return result;
	});
}
