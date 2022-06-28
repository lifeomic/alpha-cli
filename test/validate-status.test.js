const bodyParser = require('koa-bodyparser');
const Koa = require('koa');

const { createTestServer, destroyTestServer, runCommand } = require('./utils');

let context;

beforeEach(() => {
  context = {};
  const app = new Koa();

  app.use(bodyParser({
    enableTypes: ['json'],
  }));

  app.use((context) => {
    context.response.body = {};
    context.response.status = context.request.body.status;
  });

  return createTestServer(context, app);
});

afterEach(async () => {
  await destroyTestServer(context);
});

const requestThatGeneratesCode = (code) => {
  return runCommand(
    '--validate-status',
    '--data-binary', `{"status":${code}}`,
    '--header', 'Content-Type: application/json',
    '--request', 'POST',
    context.url,
  );
};

test('The --validate-status flag results in command failures with error status codes', async () => {
  const promise = requestThatGeneratesCode(500);
  await expect(promise).rejects.toThrow();
  try {
    await promise;
  } catch (e) {
    expect(e).toHaveProperty('stdout', '{}');
    expect(e).toHaveProperty('stderr', 'The HTTP response code was 500\n');
    expect(e).toHaveProperty('code', 1);
  }
});

test('The --validate-status flag results in command success with 200 status codes', async () => {
  const result = requestThatGeneratesCode(200);
  await expect(result).resolves.not.toThrow();
});
