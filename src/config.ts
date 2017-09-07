import * as intern from 'intern';
import { mixin } from 'intern/dojo/lang';
import { Options as ComparatorOptions } from './comparators/PngJsImageComparator';
import { Options as ComparisonOptions } from './comparators/ReportBuilder';
import { Options as AssertOptions } from './assert';
import { Options as ReportOptions } from './reporters/util/ReportWriter';

export type ComparatorConfig = ComparatorOptions & ComparisonOptions;

export interface Config extends AssertOptions {
	comparator: ComparatorConfig;
	report: ReportOptions;
}

const internConfig: any = (<any> intern).config || {};
const visualConfig: Config = internConfig.visual || {};
const defaults: Config = {
	baselineLocation: 'baselines',

	comparator: {
		pixelSkip: 2,

		pixelTolerance: 8,

		matchRatio: 1
	},

	directory: 'visual-test',

	missingBaseline: 'skip',

	report: {
		reportLocation: 'report',

		reportUnusedBaselines: false
	}
};

const config: Config = mixin<Config>({}, defaults, visualConfig);
export default config;
