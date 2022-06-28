const Koa = require('koa');

const { createTestServer, destroyTestServer, runCommand } = require('./utils');

let context;

beforeEach(async () => {
  context = {};
  const app = new Koa();

  app.use((context) => {
    context.response.body = context.request.headers;
  });

  await createTestServer(context, app);
});

afterEach(async () => {
  await destroyTestServer(context);
});

test('The -H flag can be used to specify a request header', async () => {
  const { stdout, stderr } = await runCommand('-H', 'Test-Header: header value', context.url);
  const headers = JSON.parse(stdout);

  expect(Object.keys(headers).sort()).toEqual(['accept', 'connection', 'host', 'test-header', 'user-agent']);
  expect(headers['test-header']).toBe('header value');
  expect(stderr).toBeFalsy();
});

test('The --header flag can be used to specify a request header', async () => {
  const { stdout, stderr } = await runCommand('--header', 'Test-Header: header value', context.url);
  const headers = JSON.parse(stdout);

  expect(Object.keys(headers).sort()).toEqual(['accept', 'connection', 'host', 'test-header', 'user-agent']);
  expect(headers['test-header']).toBe('header value');
  expect(stderr).toBeFalsy();
});

test('Specifying multiple request headers adds all the headers to the request', async () => {
  const { stdout, stderr } = await runCommand(
    '-H', 'First-Header: one',
    '-H', 'Second-Header: two',
    context.url,
  );

  const headers = JSON.parse(stdout);

  expect(Object.keys(headers).sort()).toEqual(
    ['accept', 'connection', 'first-header', 'host', 'second-header', 'user-agent'],
  );
  expect(headers['first-header']).toBe('one');
  expect(headers['second-header']).toBe('two');
  expect(stderr).toBeFalsy();
});

test('Specifying the same header multiple times uses the last instance', async () => {
  const { stdout, stderr } = await runCommand(
    '-H', 'Test-Header: one',
    '-H', 'Test-Header: two',
    context.url,
  );

  const headers = JSON.parse(stdout);

  expect(Object.keys(headers).sort()).toEqual(['accept', 'connection', 'host', 'test-header', 'user-agent']);
  expect(headers['test-header']).toBe('two');
  expect(stderr).toBeFalsy();
});

test('Specifying an empty header deletes the header from the request', async () => {
  const { stdout, stderr } = await runCommand(
    '-H', 'Test-Header: foo',
    '-H', 'Test-Header:',
    context.url,
  );

  const headers = JSON.parse(stdout);

  expect(Object.keys(headers).sort()).toEqual(['accept', 'connection', 'host', 'user-agent']);
  expect(stderr).toBeFalsy();
});

test('Malformed request headers are ignored', async () => {
  const { stdout, stderr } = await runCommand('-H', 'foo', context.url);
  const headers = JSON.parse(stdout);

  expect(Object.keys(headers).sort()).toEqual(['accept', 'connection', 'host', 'user-agent']);
  expect(stderr).toBeFalsy();
});
