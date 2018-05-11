import Command from '@theintern/leadfoot/Command';
import assertVisuals, {
	Options as AssertVisualOptions,
	AssertionResult,
	VisualRegressionTest
} from './assert';
import resizeWindow from './helpers/resizeWindow';

/**
 * Create a visual regression test from a series of options.
 */
export default function visualTest(options: Options) {
	return function(this: VisualRegressionTest) {
		let page: Command<any> = this.remote.get(options.url);

		if (options.width && options.height) {
			page = page.then(resizeWindow(options.width, options.height));
		}

		return page
			.takeScreenshot()
			.then(assertVisuals(this, options))
			.then(result => {
				if (options.callback) {
					return options.callback(result);
				}
			});
	};
}

/**
 * Options for a visual regression test
 */
export interface Options extends AssertVisualOptions {
	/** The URL of the page that should be loaded */
	url: string;

	/** Desired browser width */
	width?: number;

	/** Desired browser height */
	height?: number;

	/** A callback to be called with the test result */
	callback?: (report: AssertionResult) => any;
}
