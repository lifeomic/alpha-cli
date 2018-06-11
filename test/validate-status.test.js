const bodyParser = require('koa-bodyparser');
const Koa = require('koa');
const test = require('ava');

const { createTestServer, destroyTestServer, runCommand } = require('./utils');

test.beforeEach((test) => {
  const app = new Koa();

  app.use(bodyParser({
    enableTypes: [ 'json' ]
  }));

  app.use((context) => {
    context.response.body = {};
    context.response.status = context.request.body.status;
  });

  return createTestServer(test, app);
});

test.always.afterEach(destroyTestServer);

function requestThatGeneratesCode (test, code) {
  return runCommand(
    '--validate-status',
    '--data-binary', `{"status":${code}}`,
    '--header', 'Content-Type: application/json',
    '--request', 'POST',
    test.context.url
  );
}

test('The --validate-status flag results in command failures with error status codes', async (test) => {
  const result = requestThatGeneratesCode(test, 500);

  await test.throws(result, function (error) {
    test.truthy(error.stdout === '{}');
    test.truthy(error.stderr === 'The HTTP response code was 500\n');
    test.truthy(error.code === 1);
    return true;
  });
});

test('The --validate-status flag results in command success with 200 status codes', async (test) => {
  const result = requestThatGeneratesCode(test, 200);
  await test.notThrows(result);
});
