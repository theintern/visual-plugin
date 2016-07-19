/* tslint:disable:no-unused-variable */

import { default as assertVisuals } from './assert';
import { default as config } from './config';
import { default as visualTest } from './test';
import * as file from './util/file';
import getRGBA, { ColorDescriptor } from './util/getRGBA';
import Test = require('intern/lib/Test');

const util = {
	file,
	getRGBA
};

export {
	assertVisuals,
	config,
	util,
	visualTest,
};
