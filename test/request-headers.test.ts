import Koa from 'koa';

import {
  createTestServer,
  destroyTestServer,
  runCommand,
  TestContext,
} from './utils';

let context: TestContext;

beforeEach(async () => {
  context = {} as TestContext;
  const app = new Koa();

  app.use((context) => {
    context.response.body = context.request.headers;
  });

  await createTestServer(context, app);
});

afterEach(async () => {
  await destroyTestServer(context);
});

const getHeaders = async (...args: string[]) => {
  const { stdout, stderr } = await runCommand(...args, context.url);
  expect(stderr).toBeFalsy();
  return JSON.parse(stdout) as Record<string, string>;
};

test('The -H flag can be used to specify a request header', async () => {
  const headers = await getHeaders('-H', 'Test-Header: header value');
  expect(Object.keys(headers).sort()).toEqual([
    'accept',
    'connection',
    'host',
    'test-header',
    'user-agent',
  ]);
  expect(headers['test-header']).toBe('header value');
});

test('The --header flag can be used to specify a request header', async () => {
  const headers = await getHeaders('--header', 'Test-Header: header value');

  expect(Object.keys(headers).sort()).toEqual([
    'accept',
    'connection',
    'host',
    'test-header',
    'user-agent',
  ]);
  expect(headers['test-header']).toBe('header value');
});

test('Specifying multiple request headers adds all the headers to the request', async () => {
  const headers = await getHeaders(
    '-H',
    'First-Header: one',
    '-H',
    'Second-Header: two',
  );

  expect(Object.keys(headers).sort()).toEqual([
    'accept',
    'connection',
    'first-header',
    'host',
    'second-header',
    'user-agent',
  ]);
  expect(headers['first-header']).toBe('one');
  expect(headers['second-header']).toBe('two');
});

test('Specifying the same header multiple times uses the last instance', async () => {
  const headers = await getHeaders(
    '-H',
    'Test-Header: one',
    '-H',
    'Test-Header: two',
  );

  expect(Object.keys(headers).sort()).toEqual([
    'accept',
    'connection',
    'host',
    'test-header',
    'user-agent',
  ]);
  expect(headers['test-header']).toBe('two');
});

test('Specifying an empty header deletes the header from the request', async () => {
  const headers = await getHeaders(
    '-H',
    'Test-Header: foo',
    '-H',
    'Test-Header:',
  );
  expect(Object.keys(headers).sort()).toEqual([
    'accept',
    'connection',
    'host',
    'user-agent',
  ]);
});

test('Malformed request headers are ignored', async () => {
  const headers = await getHeaders('-H', 'foo');

  expect(Object.keys(headers).sort()).toEqual([
    'accept',
    'connection',
    'host',
    'user-agent',
  ]);
});

test('Can specify a header containing a JSON string', async () => {
  const headers = await getHeaders(
    '--header',
    'LifeOmic-Policy:  {"rules": {"readData": true}}',
  );

  expect(Object.keys(headers).sort()).toEqual([
    'accept',
    'connection',
    'host',
    'lifeomic-policy',
    'user-agent',
  ]);
  console.log(headers['lifeomic-policy']);
  expect(JSON.parse(headers['lifeomic-policy'])).toEqual({
    rules: {
      readData: true,
    },
  });
});
