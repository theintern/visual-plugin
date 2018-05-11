import getRGBA from '../../../src/util/getRGBA';
import { RGBAColorArray } from '../../../src/interfaces';

registerSuite('getRGBA', {
	'color is a number; a grayscale with full opacity is returned'() {
		const color = 0x33;
		const actual = getRGBA(color);
		assert.deepEqual(actual, [color, color, color, 0xff]);
	},

	'color is a string': {
		'three-value hex color'() {
			const actual = getRGBA('#123');
			assert.deepEqual(actual, [0x11, 0x22, 0x33, 0xff]);
		},

		'six-value hex color'() {
			const actual = getRGBA('#123ABC');
			assert.deepEqual(actual, [0x12, 0x3a, 0xbc, 0xff]);
		},

		'rgb color format'() {
			const actual = getRGBA('rgb(0, 64, 128)');
			assert.deepEqual(actual, [0, 64, 128, 0xff]);
		},

		'rgba color format'() {
			const actual = getRGBA('rgb(16, 32, 255, 0.5)');
			assert.deepEqual(actual, [16, 32, 255, 128]);
		},

		'unrecoginized format'() {}
	},

	'color is an array': {
		'empty array; is filled with defaults'() {
			assert.deepEqual(getRGBA([]), [0, 0, 0, 0xff]);
		},

		'three values'() {
			assert.deepEqual(getRGBA([0x11, 0x22, 0xaa]), [
				0x11,
				0x22,
				0xaa,
				0xff
			]);
		},

		'normalized array'() {
			assert.deepEqual(getRGBA([0x11, 0x22, 0xaa, 128]), [
				0x11,
				0x22,
				0xaa,
				128
			]);
		}
	},

	'color is an object': {
		'RGB color'() {
			const expected: RGBAColorArray = [0x11, 0x22, 0x33, 0xff];
			const actual = getRGBA({
				red: expected[0],
				green: expected[1],
				blue: expected[2]
			});
			assert.deepEqual(actual, expected);
		},

		'RGBA color'() {
			const expected: RGBAColorArray = [0x11, 0x22, 0x33, 128];
			const actual = getRGBA({
				red: expected[0],
				green: expected[1],
				blue: expected[2],
				alpha: expected[3]
			});
			assert.deepEqual(actual, expected);
		}
	}
});
