import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import resizeWindow, { waitForWindowResize } from 'intern-visual/helpers/resizeWindow';

import { IRequire } from 'dojo/loader';
declare const require: IRequire;

const CHROME_THRESHOLD = 20;
const basicPageUrl = require.toUrl('../support/pages/basic.html');

const suite: Object = {
	name: 'resizeWindow'
};

[
	[ 3440, 1440 ],
	[ 1024, 768 ],
	[ 640, 480 ]
].forEach(function ([ width, height ]) {
	(<any> suite)[`${width}x${height}`] = function (): void {
		const test = this;

		return this.remote
			.get(basicPageUrl)
			.setWindowPosition(0, 0)
			.maximizeWindow()
			.then(waitForWindowResize())
			.execute(function () {
				return [ window.innerWidth, window.innerHeight ];
			})
			.then(function ([ maximizedWidth, maximizedHeight ]: [ number, number ]) {
				if (maximizedWidth - CHROME_THRESHOLD <= width ||
					maximizedHeight - CHROME_THRESHOLD <= height) {
					test.skip(`Maximum dimensions ${ maximizedWidth }x${ maximizedHeight } is less than ` +
						`${ width }x${ height }`);
				}
			})
			.then(resizeWindow(width, height))
			.execute(function () {
				return [ window.innerWidth, window.innerHeight ];
			})
			.then(function ([ actualWidth, actualHeight ]: [ number, number ]) {
				assert.equal(actualWidth, width);
				assert.equal(actualHeight, height);
			});
	};
});

registerSuite(suite);
