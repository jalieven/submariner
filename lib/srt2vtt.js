'use strict';

const split   = require('split2');
const pumpify = require('pumpify');
const through = require('through2');
const utf8    = require('to-utf-8');

module.exports = () => {
	let buf = [];

	const convert = () => {
		return (
			buf
				.join('\r\n')
				.replace(/\{\\([ibu])\}/g, '</$1>')
				.replace(/\{\\([ibu])1\}/g, '<$1>')
				.replace(/\{([ibu])\}/g, '<$1>')
				.replace(/\{\/([ibu])\}/g, '</$1>')
				.replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, '$1.$2') + '\r\n\r\n'
		);
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
	parse.push('WEBVTT FILE\r\n\r\n');
	return pumpify(utf8({ newline: false, detectSize: 4095 }), split(), parse);
};
