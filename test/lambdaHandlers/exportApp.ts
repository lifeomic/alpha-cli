import Koa from 'koa';
import Router from '@koa/router';
import serverless from 'serverless-http';

const app = new Koa() as Koa & { handler: ReturnType<typeof serverless>; };

const router = new Router();

router.get('/echo/:param', (ctx) => {
  ctx.body = ctx.params.param;
  ctx.status = 200;
});

app.use(router.routes());
app.use(router.allowedMethods());

app.handler = serverless(app);

export default app;
