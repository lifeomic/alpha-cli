const bodyParser = require('koa-bodyparser');
const Koa = require('koa');

const { createTestServer, destroyTestServer, runCommand } = require('./utils');

let context;

beforeEach(async () => {
  context = {};
  const app = new Koa();

  app.use(bodyParser({
    enableTypes: ['text'],
  }));

  app.use((context) => {
    context.response.body = context.request.body;
  });

  await createTestServer(context, app);
});

afterEach(async () => {
  await destroyTestServer(context);
});

test('The --data-binary flag can be used to specify a request payload', async () => {
  const { stdout, stderr } = await runCommand(
    '--data-binary', '{"message":"hello"}',
    '--header', 'Content-Type: text/plain',
    '--request', 'POST',
    context.url,
  );

  expect(stdout).toBe('{"message":"hello"}');
  expect(stderr).toBeFalsy();
});
