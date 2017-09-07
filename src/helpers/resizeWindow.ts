import * as Command from 'leadfoot/Command';

/**
 * Wait until the browser stops changing in size and report back the last stable width and height
 * @return an array in the shape of [ width, height ]
 */
export function waitForWindowResize(): () => Command<[ number, number ]> {
	return function (this: Command<any>) {
		return this.parent
			.setExecuteAsyncTimeout(5000)
			.executeAsync(function (done: (result: [ number, number ]) => void) {
				// wait for any sort of animated window resize to complete
				let lastWidth: number;
				let lastHeight: number;

				function update() {
					lastWidth = window.innerWidth;
					lastHeight = window.innerHeight;
				}

				update();

				const handle = setInterval(function () {
					if (lastWidth === window.innerWidth && lastHeight === window.innerHeight) {
						clearInterval(handle);
						done([ lastWidth, lastHeight ]);
					}
					update();
				}, 250);
			});
	};
}

/**
 * Determine the difference between the window size and the inner window (document) size. This method will resize
 * the window in the process of determining the difference.
 *
 * @param width the desired width
 * @param height the desired height
 * @return [ widthDifference, heightDifference ] describing the difference between requested and actual document size
 */
export function findDifference(width: number, height: number) {
	return function (this: Command<any>) {
		return this.parent
			.setWindowSize(width, height)
			.then(waitForWindowResize())
			.execute(function () {
				return [ window.innerWidth, window.innerHeight ];
			})
			.then(function (result: [ number, number ]) {
				return [ width - result[0], height - result[1] ];
			});
	};
}

/**
 * Create a resize method that caches the difference in width and height
 * @return {(width:number, height:number)=>Promise<any>}
 */
export function createResizer(widthDifference?: number, heightDifference?: number) {
	return function (width: number, height: number) {
		return function (this: Command<any>) {
			return this.parent
				.then(function (this: Command<any>) {
					if (widthDifference == null || heightDifference == null) {
						return this.parent
							.then(findDifference(width, height))
							.then(function (result: [ number, number ]) {
								[ widthDifference, heightDifference ] = result;
							});
					}
				})
				.then(function (this: Command<any>) {
					width += widthDifference!;
					height += heightDifference!;

					return this.parent
						.setWindowSize(width, height);
				})
				.then(waitForWindowResize());
		};
	};
}

/**
 * A command helper for resizing a window
 */
export default function (width: number, height: number) {
	const resizer = createResizer();
	return resizer(width, height);
}
