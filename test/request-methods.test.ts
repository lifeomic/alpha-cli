import Koa from 'koa';
import { createTestServer, destroyTestServer, runCommand, TestContext } from './utils';

let context: TestContext;

beforeEach(async () => {
  context = {} as TestContext;
  const app = new Koa();

  app.use((context) => {
    context.response.body = { method: context.request.method };
  });

  await createTestServer(context, app);
});

afterEach(async () => {
  await destroyTestServer(context);
});

test('The GET method is used by default', async () => {
  const { stdout, stderr } = await runCommand(context.url);
  const response = JSON.parse(stdout);

  expect(response.method).toBe('GET');
  expect(stderr).toBeFalsy();
});

test('The -X flag can be used to set the request method', async () => {
  const { stdout, stderr } = await runCommand('-X', 'POST', context.url);
  const response = JSON.parse(stdout);

  expect(response.method).toBe('POST');
  expect(stderr).toBeFalsy();
});

test('The --request flag can be used to set the request method', async () => {
  const { stdout, stderr } = await runCommand('--request', 'POST', context.url);
  const response = JSON.parse(stdout);

  expect(response.method).toBe('POST');
  expect(stderr).toBeFalsy();
});
