const bodyParser = require('koa-bodyparser');
const Koa = require('koa');
const test = require('ava');

const { createTestServer, destroyTestServer, runCommand } = require('./utils');

test.beforeEach((test) => {
  const app = new Koa();

  app.use(bodyParser({
    enableTypes: ['text'],
  }));

  app.use((context) => {
    context.response.body = context.request.body;
  });

  return createTestServer(test, app);
});

test.always.afterEach(destroyTestServer);

test('The --data-binary flag can be used to specify a request payload', async (test) => {
  const { stdout, stderr } = await runCommand(
    '--data-binary', '{"message":"hello"}',
    '--header', 'Content-Type: text/plain',
    '--request', 'POST',
    test.context.url,
  );

  test.is(stdout, '{"message":"hello"}');
  test.falsy(stderr);
});
