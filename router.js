'use strict';

const Router = require('koa-router');
const config = require('./config');
const API    = require('./lib/api');

const api = new API(config);

const router = new Router({
	prefix: config.apiPath,
});

router.get('/', async (ctx, next) => {
	ctx.body = { status: 'ok' };
});

router.get('/convert', async (ctx, next) => {
	const { url, source, target, ...rest } = ctx.query;
	const result = api.validateAndConvert({ opts: { url, source, target }, query: rest, headers: ctx.headers });
	if (!result.isBoom) {
		ctx.type = result.type;
		ctx.body = result.sub;
	} else {
		ctx.throw(result);
	}
});

router.post('/convert', async (ctx, next) => {
	const result = api.validateAndConvert({ opts: ctx.request.body, query: ctx.query, headers: ctx.headers });
	if (!result.isBoom) {
		ctx.type = result.type;
		ctx.body = result.sub;
	} else {
		ctx.throw(result);
	}
});

module.exports = router;
