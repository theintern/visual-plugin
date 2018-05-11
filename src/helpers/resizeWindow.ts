import Command from '@theintern/leadfoot/Command';

/**
 * A command helper for resizing a window.
 *
 * This function takes a desired width and height and returns a function that
 * will resize the browser window, waiting until the resize operation is
 * complete before finishing. As a helper function, it's meant to called in a
 * command chain:
 *
 * ```js
 * return this.remote
 *   .get('page.html')
 *   .then(resizeWindow(1024, 768))
 * ```
 */
export default function resizeWindow(width: number, height: number) {
	const resizer = createResizer();
	return resizer(width, height);
}

/**
 * A command helper that waits until the browser stops changing size. The last
 * stable width and height is returned.
 */
export function waitForWindowResize() {
	return function(this: Command<any>) {
		return this.parent
			.setExecuteAsyncTimeout(5000)
			.executeAsync<[number, number]>(
				/* istanbul ignore next */ (
					done: (result: [number, number]) => void
				) => {
					// wait for any sort of animated window resize to complete
					let lastWidth: number;
					let lastHeight: number;

					function update() {
						lastWidth = window.innerWidth;
						lastHeight = window.innerHeight;
					}

					update();

					const handle = setInterval(() => {
						if (
							lastWidth === window.innerWidth &&
							lastHeight === window.innerHeight
						) {
							clearInterval(handle);
							done([lastWidth, lastHeight]);
						}
						update();
					}, 250);
				}
			);
	};
}

/**
 * Determine the difference between the window size and the inner window
 * (document) size. This method will resize the window in the process of
 * determining the difference.
 *
 * @param width the desired width
 * @param height the desired height
 */
function findDifference(width: number, height: number) {
	return function(this: Command<any>) {
		return this.parent
			.setWindowSize(width, height)
			.then(waitForWindowResize())
			.execute<[number, number]>(
				/* istanbul ignore next */ () => [
					window.innerWidth,
					window.innerHeight
				]
			)
			.then(result => [width - result[0], height - result[1]]);
	};
}

/**
 * Create a resize method that caches the difference in width and height
 */
function createResizer(widthDifference?: number, heightDifference?: number) {
	return function(width: number, height: number) {
		return function(this: Command<any>) {
			return this.parent
				.then(function() {
					if (widthDifference == null || heightDifference == null) {
						return (
							this.parent
								// The difference check needs to assign a slightly
								// different size than the eventual target value
								// since at least Firefox + geckodriver will ignore
								// multiple calls to set the same size.
								.then(findDifference(width - 1, height - 1))
								.then(result => {
									[
										widthDifference,
										heightDifference
									] = result;
								})
						);
					}
				})
				.then(function() {
					width += widthDifference!;
					height += heightDifference!;

					return this.parent.setWindowSize(width, height);
				})
				.then(waitForWindowResize());
		};
	};
}
