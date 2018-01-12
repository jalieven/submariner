'use strict';

const bunyan = require('bunyan');
const pjson = require('../package.json');
const config = require('../config');

let level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
if (process.env.DISABLE_LOG) level = bunyan.FATAL + 1;

const logOptions = {
	src: process.env.NODE_ENV !== 'production',
	level: level,
	name: pjson.name,
};

if (config.logLocation && process.env.NODE_ENV === 'production') {
	logOptions.streams = [
		{
			path: config.logLocation,
		},
	];
}

module.exports = bunyan.createLogger(logOptions);
