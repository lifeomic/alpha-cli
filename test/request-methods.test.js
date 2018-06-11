const Koa = require('koa');
const test = require('ava');

const { createTestServer, destroyTestServer, runCommand } = require('./utils');

test.beforeEach((test) => {
  const app = new Koa();

  app.use((context) => {
    context.response.body = { method: context.request.method };
  });

  return createTestServer(test, app);
});

test.always.afterEach(destroyTestServer);

test('The GET method is used by default', async (test) => {
  const { stdout, stderr } = await runCommand(test.context.url);
  const response = JSON.parse(stdout);

  test.is(response.method, 'GET');
  test.falsy(stderr);
});

test('The -X flag can be used to set the request method', async (test) => {
  const { stdout, stderr } = await runCommand('-X', 'POST', test.context.url);
  const response = JSON.parse(stdout);

  test.is(response.method, 'POST');
  test.falsy(stderr);
});

test('The --request flag can be used to set the request method', async (test) => {
  const { stdout, stderr } = await runCommand('--request', 'POST', test.context.url);
  const response = JSON.parse(stdout);

  test.is(response.method, 'POST');
  test.falsy(stderr);
});
