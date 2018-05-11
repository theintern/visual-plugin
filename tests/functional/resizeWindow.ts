import { Tests } from 'intern/lib/interfaces/object';

import resizeWindow, {
	waitForWindowResize
} from '../../src/helpers/resizeWindow';

const CHROME_THRESHOLD = 20;
const basicPageUrl = '_tests/tests/support/pages/basic.html';

const suite: Tests = {};

[[3440, 1440], [1024, 768], [640, 480]].forEach(([width, height]) => {
	suite[`${width}x${height}`] = test => {
		return test.remote
			.get(basicPageUrl)
			.setWindowPosition(0, 0)
			.maximizeWindow()
			.then(waitForWindowResize())
			.execute(() => [window.innerWidth, window.innerHeight])
			.then(([maximizedWidth, maximizedHeight]) => {
				if (
					maximizedWidth - CHROME_THRESHOLD <= width ||
					maximizedHeight - CHROME_THRESHOLD <= height
				) {
					test.skip(
						`Maximum dimensions ${maximizedWidth}x${maximizedHeight} is less than ` +
							`${width}x${height}`
					);
				}
			})
			.then(resizeWindow(width, height))
			.execute(() => [window.innerWidth, window.innerHeight])
			.then(([actualWidth, actualHeight]) => {
				assert.equal(actualWidth, width);
				assert.equal(actualHeight, height);
			});
	};
});

registerSuite('resizeWindow', suite);
