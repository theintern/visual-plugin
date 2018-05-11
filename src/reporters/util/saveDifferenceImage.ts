import { PNG, PNGOptions } from 'pngjs';
import { dirname } from 'path';
import { createWriteStream } from 'fs';

import { Report, RGBAColorArray, RGBColor, RGBAColor } from '../../interfaces';
import { mkdir } from '../../util/file';

export default function(report: Report, filename: string, options: Options) {
	return new Promise((resolve, reject) => {
		const width = report.baseline.width;
		const height = report.baseline.height;
		let error: Error | undefined;

		const png = createImage(width, height, options);
		png.on('error', err => {
			error = err;
		});

		const r = options.errorColor[0];
		const g = options.errorColor[1];
		const b = options.errorColor[2];
		const a = options.errorColor[3];
		const diff = report.differences;
		for (let i = diff.length - 1; i >= 0 && !error; i--) {
			const p = diff[i] << 2;
			// TODO convert this to do a single buffered Int32 write
			png.data[p] = r;
			png.data[p + 1] = g;
			png.data[p + 2] = b;
			png.data[p + 3] = a;
			// TODO if there is a pixel skip, draw to the right until edge or num of pixels skipped is met
		}

		if (error) {
			reject(error);
		} else {
			resolve(savePng(filename, png));
		}
	});
}

export interface Options {
	errorColor: RGBAColorArray;
	backgroundColor?: RGBColor | RGBAColor | null;
}

function createImage(width: number, height: number, options: Options): PNG {
	let pngOptions: PNGOptions = {
		width: width,
		height: height
	};

	if (options.backgroundColor) {
		pngOptions.colorType = 2;
		pngOptions.bgColor = options.backgroundColor;
	}

	return new PNG(pngOptions);
}

function savePng(filename: string, png: PNG) {
	return mkdir(dirname(filename)).then(() => {
		return new Promise((resolve, reject) => {
			const stream = createWriteStream(filename);
			stream.on('finish', () => resolve());
			stream.on('error', error => reject(error));
			png.pack().pipe(stream);
		});
	});
}
