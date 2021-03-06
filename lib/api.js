'use strict';

const urlParser = require('url');
const path      = require('path');
const _         = require('lodash');
const request   = require('request');
const Boom      = require('boom');

const config    = require('../config');
const srt2vtt   = require('./srt2vtt');
const vtt2srt   = require('./vtt2srt');
const log       = require('./log');

class API {
	constructor(config) {
		this.config = config || {};
	}

	getError(status, code, name, message, expose) {
		const error = new Error();
		error.status = status;
		error.code = code;
		error.name = name;
		error.message = message;
		error.expose = expose || false;
		return error;
	}

	convert(source, target, url, query, headers) {
		const conversion = `${source}2${target}`;
		const options = {
			method: 'get',
			url,
			headers,
			qs: query,
		};
		console.log('options', options);
		const run = {
			srt2vtt: url => ({
				type: 'text/vtt',
				sub: request(options).pipe(srt2vtt()),
			}),
			vtt2srt: url => ({
				type: 'text/srt',
				sub: request(options).pipe(vtt2srt()),
			}),
		};
		if (run[conversion]) {
			return run[conversion](url);
		} else {
			return Boom.badRequest('Unknown conversion.');
		}
	}

	validateAndConvert(data) {
		const { opts, query, headers } = data;
		const { target, source, url } = opts;
		if (url) {
			if (target) {
				if (!source) {
					const parsedUrl = urlParser.parse(url);
					const extensionSource = path.extname(parsedUrl.pathname).replace('.', '');
					return this.convert(extensionSource, target, url, query, headers);
				} else {
					return this.convert(source, target, url, query, headers);
				}
			} else {
				log.error({ data }, 'Could not find target format.');
				return Boom.badRequest('Could not find target format.');
			}
		} else {
			log.error({ data }, 'Could not find an url to convert.');
			return Boom.badRequest('Could not find an url to convert.');
		}
	}
}

module.exports = API;
