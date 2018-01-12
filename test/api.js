'use strict';

const _       = require('lodash');
const request = require('supertest');
const fs      = require('fs');
const crlf    = require('crlf');

const config  = require('../config');
const server  = require('../server');

const apiRoot = `http://localhost:${config.apiPort}`;
const API_HOST = process.env.API_HOST || `${apiRoot}${config.apiPath}`;
const agent = request(API_HOST);

describe('Submariner - API', () => {
	const expectedFile = async (filename) => {
		const setClfr = (file) => new Promise((resolve, reject) => {
			crlf.set(file, 'CRLF', (err, endingType) => {
				if (err) reject(err);
				else resolve(endingType);
			});
		});
		const type = await setClfr(filename);
		return fs.readFileSync(filename, { encoding: 'utf-8' });
	};

	it('serves the root status', done => {
		agent
			.get('/')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.expect(res => {
				expect(res.body)
					.to.have.property('status')
					.to.eql('ok');
			})
			.end(done);
	});

	it('converts srt to vtt with post', async () => {
		const expected = await expectedFile('./static/sample.vtt');
		return agent
			.post('/convert')
			.set('Accept', 'text/vtt')
			.send({
				url: `${apiRoot}/static/sample.srt`,
				source: 'srt',
				target: 'vtt',
			})
			.expect('Content-Type', 'text/vtt; charset=utf-8')
			.expect(200)
			.expect(res => {
				expect(res.text).to.eql(expected);
			});
	});

	it('converts srt to vtt without specifying a source', async () => {
		const expected = await expectedFile('./static/sample.vtt');
		return agent
			.post('/convert')
			.set('Accept', 'text/vtt')
			.send({
				url: `${apiRoot}/static/sample.srt`,
				target: 'vtt',
			})
			.expect('Content-Type', 'text/vtt; charset=utf-8')
			.expect(200)
			.expect(res => {
				expect(res.text).to.eql(expected);
			});
	});

	it('converts srt to vtt without anything really', async () => {
		return agent
			.post('/convert')
			.set('Accept', 'text/vtt')
			.send({
				url: `${apiRoot}/static/sample`,
			})
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect(400)
			.expect(res => {
				expect(res.body).to.eql({
					error: 'Bad Request',
					message: 'Could not find target format.',
					statusCode: 400,
				});
			});
	});

	it('converts srt to vtt without specifying a source', async () => {
		return agent
			.post('/convert')
			.set('Accept', 'text/vtt')
			.send({
				url: `${apiRoot}/static/sample`,
				target: 'vtt',
			})
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect(400)
			.expect(res => {
				expect(res.body).to.eql({
					error: 'Bad Request',
					message: 'Unknown conversion.',
					statusCode: 400,
				});
			});
	});

	it('converts srt to vtt without specifying a source and unknown extension', async () => {
		return agent
			.post('/convert')
			.set('Accept', 'text/vtt')
			.send({
				url: `${apiRoot}/static/sample.txt`,
				target: 'vtt',
			})
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect(400)
			.expect(res => {
				expect(res.body).to.eql({
					error: 'Bad Request',
					message: 'Unknown conversion.',
					statusCode: 400,
				});
			});
	});

	it('converts srt to vtt without specifying a url', async () => {
		return agent
			.post('/convert')
			.set('Accept', 'text/vtt')
			.send({
				source: 'srt',
				target: 'vtt',
			})
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect(400)
			.expect(res => {
				expect(res.body).to.eql({
					error: 'Bad Request',
					message: 'Could not find an url to convert.',
					statusCode: 400,
				});
			});
	});

	it('converts srt to vtt with get', async () => {
		const expected = await expectedFile('./static/sample.vtt');
		return agent
			.get('/convert')
			.set('Accept', 'text/vtt')
			.query({
				url: `${apiRoot}/static/sample.srt`,
				source: 'srt',
				target: 'vtt',
			})
			.expect('Content-Type', 'text/vtt; charset=utf-8')
			.expect(200)
			.expect(res => {
				expect(res.text).to.eql(expected);
			});
	});

	it('converts vtt to srt with post', async () => {
		const expected = await expectedFile('./static/sample.srt');
		return agent
			.post('/convert')
			.set('Accept', 'text/vtt')
			.send({
				url: `${apiRoot}/static/sample.vtt`,
				source: 'vtt',
				target: 'srt',
			})
			.expect('Content-Type', 'text/srt; charset=utf-8')
			.expect(200)
			.expect(res => {
				expect(res.text).to.eql(expected);
			});
	});

	it('converts vtt to srt with get', async () => {
		const expected = await expectedFile('./static/sample.srt');
		return agent
			.get('/convert')
			.set('Accept', 'text/vtt')
			.query({
				url: `${apiRoot}/static/sample.vtt`,
				source: 'vtt',
				target: 'srt',
			})
			.expect('Content-Type', 'text/srt; charset=utf-8')
			.expect(200)
			.expect(res => {
				expect(res.text).to.eql(expected);
			});
	});

	it('converts vtt to srt removing styles', async () => {
		const expected = await expectedFile('./static/styles.srt');
		return agent
			.get('/convert')
			.set('Accept', 'text/vtt')
			.query({
				url: `${apiRoot}/static/styles.vtt`,
				source: 'vtt',
				target: 'srt',
			})
			.expect('Content-Type', 'text/srt; charset=utf-8')
			.expect(200)
			.expect(res => {
				expect(res.text).to.eql(expected);
			});
	});

	it('converts vtt to srt field test', async () => {
		const expected = await expectedFile('./static/blade_runner.srt');
		return agent
			.get('/convert')
			.set('Accept', 'text/vtt')
			.query({
				url: `${apiRoot}/static/blade_runner.vtt`,
				source: 'vtt',
				target: 'srt',
			})
			.expect('Content-Type', 'text/srt; charset=utf-8')
			.expect(200)
			.expect(res => {
				expect(res.text).to.eql(expected);
			});
	});

	it('converts srt to vtt field test', async () => {
		const expected = await expectedFile('./static/blade_runner.vtt');
		return agent
			.get('/convert')
			.set('Accept', 'text/vtt')
			.query({
				url: `${apiRoot}/static/blade_runner.srt`,
				source: 'srt',
				target: 'vtt',
			})
			.expect('Content-Type', 'text/vtt; charset=utf-8')
			.expect(200)
			.expect(res => {
				expect(res.text).to.eql(expected);
			});
	});

});
