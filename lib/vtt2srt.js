'use strict';

const split   = require('split2');
const pumpify = require('pumpify');
const through = require('through2');
const utf8    = require('to-utf-8');

module.exports = () => {
	let buf = [];

	const convert = () => {
		if (buf[0].startsWith('NOTE') || buf[0].startsWith('STYLE') || buf[0].startsWith('WEBVTT')) {
			return '';
		} else {
			return (
				buf
					.join('\r\n')
					.replace(/\<(?!\/?(i|u|b|font)[ >])[^>]*\>/ig, '')
					.replace(
						/(\d{2}:\d{2}:\d{2})\.(\d{3}\s+)\-\-\>(\s+\d{2}:\d{2}:\d{2})\.(\d{3}\s*)/g,
						'$1,$2-->$3,$4',
					) + '\r\n\r\n'
			);
		}
	};

	const write = (line, enc, cb) => {
		if (line.trim()) {
			buf.push(line.trim());
			return cb();
		}
		line = convert();
		buf = [];
		if (!line.trim()) {
			cb();
		} else {
			cb(null, line);
		}
	};

	const flush = function(cb) {
		if (buf.length) this.push(convert());
		cb();
	};
	const parse = through.obj(write, flush);

	return pumpify(utf8({ newline: false, detectSize: 4095 }), split(), parse);
};
