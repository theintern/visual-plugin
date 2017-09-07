import assertVisuals from './assert';
import config from './config';
import visualTest from './test';
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
	visualTest
};
