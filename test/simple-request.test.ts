import Koa from 'koa';

import { createTestServer, destroyTestServer, runCommand, TestContext } from './utils';

let context: TestContext;

beforeEach(async () => {
  context = {} as TestContext;
  const app = new Koa();

  app.use((context) => {
    if (context.request.path === '/') {
      context.response.body = { message: 'hello' };
      return;
    }

    context.throw(404, 'Not Found');
  });

  await createTestServer(context, app);
});

afterEach(async () => {
  await destroyTestServer(context);
});

test('When a request is successful the raw response payload is printed', async () => {
  const { stdout, stderr } = await runCommand(context.url);
  expect(stdout).toBe('{"message":"hello"}');
  expect(stderr).toBeFalsy();
});

test('When a request returns an error the response payload is printed', async () => {
  const { stdout, stderr } = await runCommand(`${context.url}/foo/bar`);
  expect(stdout).toBe('Not Found');
  expect(stderr).toBeFalsy();
});

test('When a request fails an error message is printed', async () => {
  const promise = runCommand('http://localhost:0');
  await expect(promise).rejects.toThrow(/Error: connect/);
});
