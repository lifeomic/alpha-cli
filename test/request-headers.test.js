const Koa = require('koa');
const test = require('ava');

const { createTestServer, destroyTestServer, runCommand } = require('./utils');

test.beforeEach((test) => {
  const app = new Koa();

  app.use((context) => {
    context.response.body = context.request.headers;
  });

  return createTestServer(test, app);
});

test.always.afterEach(destroyTestServer);

test('The -H flag can be used to specify a request header', async (test) => {
  const { stdout, stderr } = await runCommand('-H', 'Test-Header: header value', test.context.url);
  const headers = JSON.parse(stdout);

  test.deepEqual(
    Object.keys(headers).sort(),
    [ 'accept', 'connection', 'host', 'test-header', 'user-agent' ]
  );
  test.is(headers['test-header'], 'header value');
  test.falsy(stderr);
});

test('The --header flag can be used to specify a request header', async (test) => {
  const { stdout, stderr } = await runCommand('--header', 'Test-Header: header value', test.context.url);
  const headers = JSON.parse(stdout);

  test.deepEqual(
    Object.keys(headers).sort(),
    [ 'accept', 'connection', 'host', 'test-header', 'user-agent' ]
  );
  test.is(headers['test-header'], 'header value');
  test.falsy(stderr);
});

test('Specifying multiple request headers adds all the headers to the request', async (test) => {
  const { stdout, stderr } = await runCommand(
    '-H', 'First-Header: one',
    '-H', 'Second-Header: two',
    test.context.url
  );

  const headers = JSON.parse(stdout);

  test.deepEqual(
    Object.keys(headers).sort(),
    [ 'accept', 'connection', 'first-header', 'host', 'second-header', 'user-agent' ]
  );
  test.is(headers['first-header'], 'one');
  test.is(headers['second-header'], 'two');
  test.falsy(stderr);
});

test('Specifying the same header multiple times uses the last instance', async (test) => {
  const { stdout, stderr } = await runCommand(
    '-H', 'Test-Header: one',
    '-H', 'Test-Header: two',
    test.context.url
  );

  const headers = JSON.parse(stdout);

  test.deepEqual(
    Object.keys(headers).sort(),
    [ 'accept', 'connection', 'host', 'test-header', 'user-agent' ]
  );
  test.is(headers['test-header'], 'two');
  test.falsy(stderr);
});

test('Specifying an empty header deletes the header from the request', async (test) => {
  const { stdout, stderr } = await runCommand(
    '-H', 'Test-Header: foo',
    '-H', 'Test-Header:',
    test.context.url
  );

  const headers = JSON.parse(stdout);

  test.deepEqual(
    Object.keys(headers).sort(),
    [ 'accept', 'connection', 'host', 'user-agent' ]
  );
  test.falsy(stderr);
});

test('Malformed request headers are ignored', async (test) => {
  const { stdout, stderr } = await runCommand('-H', 'foo', test.context.url);
  const headers = JSON.parse(stdout);

  test.deepEqual(
    Object.keys(headers).sort(),
    [ 'accept', 'connection', 'host', 'user-agent' ]
  );
  test.falsy(stderr);
});
