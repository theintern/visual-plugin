/* tslint:disable:no-unused-variable */

import 'ts-helpers';

import { default as assertVisuals } from './assert';
import { default as config } from './config';
import { default as visualTest } from './test';
import * as file from './util/file';
import getRGBA, { ColorDescriptor } from './util/getRGBA';
import * as resizeWindow from './helpers/resizeWindow';

const util = {
	file,
	getRGBA
};

const helpers = {
	resizeWindow
};

export {
	assertVisuals,
	ColorDescriptor,
	config,
	helpers,
	util,
	visualTest,
};
