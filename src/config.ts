import { Options as ComparatorOptions } from './comparators/PngJsImageComparator';
import { Options as ComparisonOptions } from './comparators/ReportBuilder';
import { Options as AssertOptions } from './assert';
import { Options as ReportOptions } from './reporters/util/ReportWriter';

export type ComparatorConfig = ComparatorOptions & ComparisonOptions;

export interface Config extends AssertOptions, ReportOptions {
	/** Options for the image comparator */
	comparator: ComparatorConfig;

	/** If set to false, disable the reporter */
	report?: false;

	/** The base output directory where baselines and reports are written */
	directory: string;
}

const config: Config = {
	baselineLocation: 'baselines',

	comparator: {
		pixelSkip: 2,
		pixelTolerance: 8,
		matchRatio: 1
	},

	directory: 'visual-test',
	missingBaseline: 'skip',

	reportLocation: 'report'
};

export default config;
