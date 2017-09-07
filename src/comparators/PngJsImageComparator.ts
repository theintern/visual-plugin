import { PNG } from 'intern/dojo/node!pngjs';
import { ImageComparator, ImageReference, RGBColor, RGBColorArray, Report, ImageMetadata } from '../interfaces';
import ImageComparison from './ReportBuilder';
import config from '../config';
import getRGBA from '../util/getRGBA';
import { load } from '../util/file';

export interface Options {
	pixelSkip?: number;
	pixelTolerance?: number | RGBColor;
}

export default class PngJsImageComparator implements ImageComparator {
	pixelSkip: number;

	pixelTolerance: RGBColorArray;

	constructor(options: Options = {}) {
		this.pixelTolerance = getRGBA(options.pixelTolerance || config!.comparator!.pixelTolerance!)!;
		this.pixelSkip = (options.pixelSkip || config.comparator.pixelSkip)!;
	}

	compare(baseline: ImageReference, actual: ImageReference): Promise<Report> {
		if (baseline == null || actual == null) {
			return Promise.reject<Report>(new Error('null image'));
		}

		return Promise.all([
			this._loadImage(baseline),
			this._loadImage(actual)
		]).then(([
			{ png: baselinePng, metadata: baselineMetadata },
			{ png: actualPng, metadata: actualMetadata }
		]) => {
			if (baselinePng.width !== actualPng.width || baselinePng.height !== actualPng.height) {
				throw new Error('PNGs are different sizes. Expected (' + baselinePng.width + 'x' +
					baselinePng.height + '); ' + 'Actual (' + actualPng.width + 'x' + actualPng.height + ').');
			}

			const height = baselinePng.height;
			const width = baselinePng.width;
			const numSubPixels = (width * height) << 2;
			const redTol = this.pixelTolerance[0];
			const greenTol = this.pixelTolerance[1];
			const blueTol = this.pixelTolerance[2];
			const increment = 4 * this.pixelSkip;

			const comparison = new ImageComparison(baselineMetadata, actualMetadata);

			const left = baselinePng.data;
			const right = actualPng.data;
			comparison.recordStart();
			for (let i = 0; i < numSubPixels; i += increment) {
				if (
					Math.abs(left[i] - right[i]) > redTol ||
					Math.abs(left[i + 1] - right[i + 1]) > greenTol ||
					Math.abs(left[i + 2] - right[i + 2]) > blueTol
				) {
					// translate 1D offset to 2D x, y coordinates
					const p = i >> 2;
					comparison.recordPixelDifference(p);
				}
			}
			comparison.recordEnd();

			return comparison.report;
		});
	}

	private _loadImage(image: ImageReference): Promise<{
		png: PNG,
		metadata: ImageMetadata
	}> {
		const loadPromise = (typeof image === 'string') ?
			this._loadPng(image) : Promise.resolve(PNG.sync.read(image));

		return loadPromise
			.then(function (png: PNG) {
				return {
					png,
					metadata: {
						height: png.height,
						width: png.width
					}
				};
			});
	}

	private _loadPng(image: string): Promise<PNG> {
		return new Promise(function (resolve, reject) {
			const png = new PNG();
			png.on('parsed', function () {
				resolve(png);
			});
			png.on('error', function (error) {
				reject(error);
			});

			load(image, png);
		});
	}

}
