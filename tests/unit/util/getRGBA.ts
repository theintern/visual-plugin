import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import getRGBA from 'intern-visual/util/getRGBA';

registerSuite({
	'name': 'getRGBA',

	'color is a number; a grayscale with full opacity is returned'() {
		const color = 0x33;
		const actual = getRGBA(color);
		assert.deepEqual(actual, [ color, color, color, 0XFF ]);
	},

	'color is a string': {
		'three-value hex color'() {
			const actual = getRGBA('#123');
			assert.deepEqual(actual, [ 0x11, 0x22, 0x33, 0xFF ]);
		},

		'six-value hex color'() {
			const actual = getRGBA('#123ABC');
			assert.deepEqual(actual, [ 0x12, 0x3A, 0xBC, 0xFF ]);
		},

		'rgb color format'() {
			const actual = getRGBA('rgb(0, 64, 128)');
			assert.deepEqual(actual, [ 0, 64, 128, 0xFF ]);
		},

		'rgba color format'() {
			const actual = getRGBA('rgb(16, 32, 255, 0.5)');
			assert.deepEqual(actual, [ 16, 32, 255, 128 ]);
		},

		'unrecoginized format'() {
		}
	},

	'color is an array': {
		'empty array; is filled with defaults'() {
			assert.deepEqual(getRGBA([]), [ 0, 0, 0, 0xFF ] );
		},

		'three values'() {
			assert.deepEqual(getRGBA([ 0x11, 0x22, 0xAA ]), [ 0x11, 0x22, 0xAA, 0xFF ]);
		},

		'normalized array'() {
			assert.deepEqual(getRGBA([ 0x11, 0x22, 0xAA, 128 ]), [ 0x11, 0x22, 0xAA, 128 ]);
		}
	},

	'color is an object': {
		'RGB color'() {
			const expected = [ 0x11, 0x22, 0x33, 0xFF ];
			const actual = getRGBA({
				red: expected[0],
				green: expected[1],
				blue: expected[2]
			});
			assert.deepEqual(actual, expected);
		},

		'RGBA color'() {
			const expected = [ 0x11, 0x22, 0x33, 128 ];
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
