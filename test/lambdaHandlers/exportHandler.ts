import Koa from 'koa';
import Router from '@koa/router';
import serverless from 'serverless-http';

const app = new Koa();

const router = new Router();

router.get('/echo/:param', (ctx) => {
  ctx.body = ctx.params.param;
  ctx.status = 200;
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
app.use(router.routes());
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
app.use(router.allowedMethods());

export const handler = serverless(app);
