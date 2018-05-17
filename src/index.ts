/**
 * This module exports the public API for visual-plugin, registers
 * visual-plugin as an Intern plugin, and installs the visual regression
 * reporter.
 */ /** */

import assertVisuals from './assert';
import config, { Config } from './config';
import visualTest from './test';
import resizeWindow from './helpers/resizeWindow';
import VisualRegression from './reporters/VisualRegression';

const helpers = {
	resizeWindow
};

export { assertVisuals, config, helpers, visualTest };

intern.registerPlugin('visual', options => {
	const opts: Config = <Config>options || {};
	Object.assign(config, opts);

	let reporter: VisualRegression | undefined;
	if (config.report !== false) {
		reporter = new VisualRegression(intern, config);
	}

	// All the standard exports, as well as the reporter, are available on the
	// registered plugin.
	return {
		reporter,
		assertVisuals,
		config,
		helpers,
		visualTest
	};
});
