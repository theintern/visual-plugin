import { join, extname, basename } from 'path';
import Suite from 'intern/lib/Suite';
import Test from 'intern/lib/Test';

import { VisualRegressionTest, AssertionResult } from '../../assert';
import getRGBA from '../../util/getRGBA';
import { RGBAColorArray } from '../../interfaces';
import saveDifferenceImage from './saveDifferenceImage';
import { getTestDirectory, save, copy } from '../../util/file';
import { ColorDescriptor } from '../../util/getRGBA';

export default class {
	/**
	 * The color used for errors in the difference image
	 */
	private errorColor: RGBAColorArray;

	/**
	 * Root directory to write the report
	 */
	private reportLocation: string;

	/**
	 * Notes exported to index.html
	 * @private
	 */
	private _globalNotes: Note[] = [];

	private _testMetadata: { [key: string]: TestMetadata[] } = {};

	constructor(options: Options = {}) {
		this.reportLocation = constructDirectory(
			options.directory!,
			options.reportLocation!
		);

		this.errorColor = getRGBA(options.errorColor || '#F00')!;
	}

	addNote(note: Note): void {
		this._globalNotes.push(note);
	}

	private appendMetadata(id: string, metadata: TestMetadata): void {
		const metadatas = (this._testMetadata[id] =
			this._testMetadata[id] || []);
		metadatas.push(metadata);
	}

	writeTest(test: VisualRegressionTest) {
		if (!test.visualResults) {
			return Promise.resolve();
		}

		const results: AssertionResult[] = test.visualResults!;
		const testDirectory = getTestDirectory(test.parent);
		const directory = join(this.reportLocation, testDirectory);

		return Promise.all(
			results.map(result => {
				const report = result.report;
				const metadata: TestMetadata = {
					result,
					directory,
					testDirectory
				};

				this.appendMetadata(test.id, metadata);

				return Promise.resolve()
					.then<any>(() => {
						// Write difference image
						if (report && !report.isPassing) {
							const difference = (metadata.difference = addSuffix(
								result.baseline,
								'-diff'
							));

							return saveDifferenceImage(
								report,
								join(directory, difference),
								{
									errorColor: this.errorColor
								}
							);
						}
					})
					.then<any>(() => {
						// Write screenshot
						if (report && !report.isPassing) {
							if (result.screenshot) {
								const screenshot = (metadata.screenshot = addSuffix(
									result.baseline,
									'-actual'
								));
								return save(
									join(directory, screenshot),
									result.screenshot
								);
							} else {
								this.addNote({
									level: 'error',
									message:
										'Failed to write screenshot. Missing buffer.',
									type: 'image write'
								});
							}
						}
					})
					.then<any>(() => {
						// write baseline image
						if (result.generatedBaseline || result.baselineExists) {
							const source = result.baseline;
							const baseline = (metadata.baseline = addSuffix(
								result.baseline
							));
							return copy(source, join(directory, baseline));
						}
					})
					.then(() => {
						// Replace screenshot with a filename to avoid leaking memory
						result.screenshot = metadata.screenshot!;
					});
			})
		);
	}

	writeSuite(suite: Suite) {
		if (suite.parent) {
			return Promise.resolve();
		}

		let body = this.createHeader() + this.createTestFragment(suite);

		const reportFilename = join(this.reportLocation, 'index.html');
		return save(
			reportFilename,
			this.createHtml('Visual Regression Report', body)
		).then(() => {
			const source = join(__dirname, 'assets', 'main.css');
			const target = join(this.reportLocation, 'main.css');
			return copy(source, target);
		});
	}

	private createHtml(title: string, body: string) {
		return `
			<!doctype html>
			<html lang="en">
			<head>
				<title>${title}</title>
				<link rel="stylesheet" type="text/css" href="main.css">
			</head>
			<body>
				${body}
			</body>
			</html>`;
	}

	private createHeader() {
		return `
			<header>
				<img src="${img}">
				<h1>Intern Visual Regression Report</h1>
			</header>`;
	}

	private createTestFragment(item: TestMember) {
		let fragment = '';
		if ((<Suite>item).tests) {
			const items: TestMember[] = (<any>item).tests;
			items.forEach((item: TestMember) => {
				fragment += this.createTestFragment(item);
			});
		} else {
			const test: VisualRegressionTest = <any>item;
			const metadata: TestMetadata[] = this._testMetadata[test.id];

			if (metadata) {
				fragment += `<section>
					${this.createComparisonHeader(test)}
					${this.createAssertions(metadata)}
				</section>`;
			}
		}

		return fragment;
	}

	private createAssertions(metadata: TestMetadata[]) {
		return metadata.reduce((fragment: string, metadata: TestMetadata) => {
			if (metadata.result.generatedBaseline) {
				fragment += `<div>
					Generated Baseline
				</div>`;
			} else if (!metadata.result.baselineExists) {
				fragment += `<div>
					Baseline does not exist!
				</div>`;
			} else if (
				metadata.baseline ||
				metadata.screenshot ||
				metadata.difference
			) {
				fragment += `<div>${this.createComparison(metadata)}</div>`;
			} else {
				fragment += 'ERROR!';
			}

			return fragment;
		}, '');
	}

	private createComparisonHeader(test: Test) {
		const result = test.skipped
			? 'skiped'
			: test.hasPassed
				? 'passed'
				: 'failed';
		return `
			<header class="${result}">${test.name}</header>
		`;
	}

	private createComparison(metadata: TestMetadata) {
		let fragment = '';

		if (metadata.baseline || metadata.screenshot || metadata.difference) {
			if (metadata.baseline) {
				const imageUrl = join(
					metadata.testDirectory,
					metadata.baseline
				);
				fragment += `<img src="${imageUrl}">`;
			}
			if (metadata.screenshot) {
				const imageUrl = join(
					metadata.testDirectory,
					metadata.screenshot
				);
				fragment += `<img src="${imageUrl}">`;
			}
			if (metadata.difference) {
				const imageUrl = join(
					metadata.testDirectory,
					metadata.difference
				);
				fragment += `<img src="${imageUrl}">`;
			}
			fragment = '<div class="imageOverlay">' + fragment + '</div>';
		}

		return fragment;
	}

	end(): Promise<any> {
		return Promise.resolve();
	}
}

/**
 * Report configuration properties
 */
export interface Options {
	/**
	 * The base output directory. This plugin's output directory is used by
	 * default.
	 */
	directory?: string;

	/** The color to use when highlighting image differences */
	errorColor?: ColorDescriptor;

	/** Where in the base output directory to write reports */
	reportLocation?: string;
}

export interface Note {
	level: 'info' | 'warn' | 'error' | 'fatal';
	message: string;
	type: string;
}

interface TestMetadata {
	result: AssertionResult;
	directory: string;
	baseline?: string;
	difference?: string;
	screenshot?: string;
	testDirectory: string;
}

function addSuffix(filename: string, suffix: string = '') {
	const extension = extname(filename);
	const base = basename(filename, extension);
	return base + suffix + extension;
}

function constructDirectory(base: string, location: string) {
	if (/^\/|\\/.test(location)) {
		// Absolute location
		return location;
	}

	return join(base, location);
}

type TestMember = Test | Suite;

const img =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIIAAACACAMAAADwF' +
	'UHEAAADAFBMVEUAAAAAAAAAAABVVVVAQEBmZmZVVVVtbW1gYGBVVVVmZmZdXV1qampiYmJt' +
	'bW1mZmZwcHBpaWljY2Nra2tmZmZtbW1oaGhvb29qampwcHBsbGxoaGhtbW1qampvb29ra2t' +
	'wcHBsbGxxcXFtbW1qampubm5ra2tvb29sbGxwcHBtbW1xcXFubm5sbGxvb29tbW1wcHBtbW' +
	'1wcHBubm5xcXFvb29tbW1vb29tbW1wcHBubm5wcHBvb29xcXFvb29tbW1wcHBubm5wcHBub' +
	'm5xcXFvb29xcXFvb29ubm5wcHBubm5wcHBvb29xcXFvb29xcXFwcHBubm5wcHBwcHBvb29x' +
	'cXFvb29ubm5xcXFwcHBvb29wcHBwcHBvb29xcXFwcHBubm5wcHBvb29wcHBvb29xcXFvb29' +
	'xcXFwcHBvb29wcHBvb29wcHBvb29xcXFwcHBxcXFwcHBvb29wcHBvb29wcHBvb29xcXFwcH' +
	'BxcXFwcHBvb29wcHBubm5wcHBwcHBwcHBxcXFwcHBvb29wcHBvb29xcXFwcHBwcHBvb29xc' +
	'XFwcHBvb29wcHBwcHBxcXFwcHBxcXFwcHBxcXFwcHBvb29wcHBwcHBxcXFwcHBxcXFwcHBx' +
	'cXFwcHBwcHBwcHBxcXFwcHBxcXFwcHBxcXFwcHBwcHBxcXFwcHBxcXFwcHBxcXFwcHBwcHB' +
	'wcHBwcHBxcXFwcHBwcHBxcXFwcHBwcHBwcHBwcHBxcXFwcHBxcXFwcHBxcXFwcHBwcHBwcH' +
	'BwcHBxcXFwcHBxcXFwcHBxcXFwcHBwcHBxcXFwcHBxcXFxcXFwcHBwcHBxcXFwcHBwcHBxc' +
	'XFwcHBxcXFwcHBxcXFwcHBxcXFwcHBwcHBxcXFwcHBxcXFwcHBxcXFwcHBxcXFwcHBwcHBx' +
	'cXFwcHBxcXFwcHBxcXFwcHBxcXFxcXFwcHBxcXFwcHBxcXFwcHBxcXFxcXFwcHBxcXFxcXF' +
	'wcHBwcHBxcXFwcHBxcXFxcXFwcHBxcXFxcXFwcHBxcXF+cGExAAAA/3RSTlMAAQIDBAUGBw' +
	'gJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8P' +
	'T4/QEFCQ0RFRkdISUpLTE1OT1BRUlRVVldYWFlaW11eX2BhYmNkZWZnaGlqa2xtbm9wcXJz' +
	'dHV2d3h5ent8fX9/gIKDhIWGh4iJi4yMjY6PkJGSk5SVlpeYmZqbnJ2en6Gio6Slpqeoqaq' +
	'rrK2ur7CxsrO0tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNztDR0tLT1NXW19jZ2tvc3d7f4O' +
	'Hi4+Tl5ufo6err7O3u7/Dx8vPz9PX29/j5+fr6+/z8/f6oCt5hAAAJJUlEQVQYGcXBC0DU9' +
	'QEH8O9xgDwEM0BTYVn4thpmvpN02WqVpaXNYlPM0koW+cy0BepYG5Ca1lDLMrXyEenS6GFi' +
	'TiSxttTIFJsvFFB5TIEdg919+/3+/zu5x/9/AnF3nw+aI/C2qcs27T1RXlVdW1r45ZY/Txw' +
	'YAi8yDF68v47O6velPxAKrxi06iz11HyYeC08LPSJA3Sv9t27/OA5IXPPswmKpgbCMwKfOc' +
	'MmOpUUBA8YcYTNUDwzFK2s3UoLm6c0yQ+tKfoEm2//bWhNt+xm85mXt0MrMjxZweYrfhStK' +
	'fYrtsDWCLSiwEy2wKk70JomN7D5GlKMaEW/Y0vsikarCI0b8+zLb11kS5SNwM/Uc2LGJ6f4' +
	'c9Q9jhbzHzhjSwlbQbofWiJk3OZLbC1b26K52ozZcImt6etOaJaeWRVsbUe7oukGZFvoAad' +
	'6oYmi11roGSW3oikMz12mx5QPxdV12E5PqhiAq+lzmp51IQ7uxZXS00r7wp3uF+l5xbHQF1' +
	'hAbzgaBV2Z9I78UOiIrqOXfOQPbRn0mhVwENStXw8jhEmPjb7nnoenv1lFz3saNuGPvvGdh' +
	'eSlVZG44k56Xv2dkALHf2SizXehUPmn1dALyn4BXJ9eSnuzoVpH78gfsqGejrZDMY6+cwGK' +
	'AvrOeUix9KHjkCbQh/ZBeok+9CqkDPrQBEgr6EMxkNLoO/lQzKHvzIQigT5jiYEijj6TA1V' +
	'QA33lAVh9Sx857gerV+kjs2DzEH3jfFvYRFjoEy+h0R76QmV7NEqmL6TAToyFraD0wNbXXv' +
	'j9/fH94uKGjkneWEn3SsNgL48/h7lwU+qEW8PgqMN2ujUDDpLopIFNdGrl1IHB0NSd7hS1g' +
	'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' +
	'U5ErkJggg==';
