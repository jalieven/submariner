'use strict';

const bunyan = require('bunyan');
const pjson = require('../package.json');

let level = process.env.NODE_ENV === 'production' ? 'debug' : 'debug';
if (process.env.DISABLE_LOG) level = bunyan.FATAL + 1;

module.exports = bunyan.createLogger({
	src: process.env.NODE_ENV !== 'production',
	level: level,
	name: pjson.name,
});
