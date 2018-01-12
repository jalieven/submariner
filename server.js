'use strict';

const Koa      = require('koa');
const Boom     = require('boom');
const compress = require('koa-compress');
const mount    = require('koa-mount');
const views    = require('koa-views');
const serve    = require('koa-static');
const app      = module.exports = new Koa();
const config   = require('./config');
const router   = require('./router');
const log      = require('./lib/log');

// Compression
app.use(compress({
	threshold: 2048,
}));

// Views
app.use(views(`${__dirname}/views`, {}));

// Static
app.use(mount(`/static`, serve(`${__dirname}/static`)));

// Catch errors
app.use(async (ctx, next) => {
	try {
		await next();
		const status = ctx.status || 404;
		if (status === 404) {
			throw Boom.notFound();
		} else {
			log.debug({
				request: ctx.request,
				response: ctx.response,
			}, 'request');
		}
	} catch (err) {
		const error = new Boom(err);
		ctx.status = error.output.statusCode;
		ctx.body = error.output.payload;
		log.debug({
			request: ctx.request,
			response: ctx.response,
		}, 'request');
		if (error.output.statusCode === 500) {
			log.error({ error: error.output }, error.message);
		} else {
			log.warn({ error: error.output }, err.message);
		}
	}
});

// Koa middleware
app.use(async (ctx, next) => {
	ctx.set('Access-Control-Allow-Origin', '*');
	ctx.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Cache-Control, X-Requested-With');
	await next();
});

// Response time
app.use(require('koa-response-time')());

// Parse request body
app.use(require('koa-bodyparser')({
	onerror: function (err, ctx) {
		ctx.throw('body parse error', 422);
	},
}));

// Routes
app.use(router.routes());
app.use(router.allowedMethods({
	throw: true,
	notImplemented: () => Boom.notImplemented(),
	methodNotAllowed: () => Boom.methodNotAllowed(),
}));

app.listen(config.apiPortInternal);

log.info('Server listening on port', config.apiPortInternal);
