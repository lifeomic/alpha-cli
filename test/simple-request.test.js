const Koa = require('koa');
const test = require('ava');

const { createTestServer, destroyTestServer, runCommand } = require('./utils');

test.beforeEach((test) => {
  const app = new Koa();

  app.use((context) => {
    if (context.request.path === '/') {
      context.response.body = { message: 'hello' };
      return;
    }

    context.throw(404, 'Not Found');
  });

  return createTestServer(test, app);
});

test.always.afterEach(destroyTestServer);

test('When a request is successful the raw response payload is printed', async (test) => {
  const { stdout, stderr } = await runCommand(test.context.url);
  test.is(stdout, '{"message":"hello"}');
  test.falsy(stderr);
});

test('When a request returns an error the response payload is printed', async (test) => {
  const { stdout, stderr } = await runCommand(`${test.context.url}/foo/bar`);
  test.is(stdout, 'Not Found');
  test.falsy(stderr);
});

test('When a request fails an error message is printed', async (test) => {
  const error = await test.throws(runCommand('http://localhost:0'));
  test.regex(error.message, /Error: connect/);
});
