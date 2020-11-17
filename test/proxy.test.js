const Koa = require('koa');
const test = require('ava');
const bodyParser = require('koa-bodyparser');

const { createTestServer, destroyTestServer, runCommand, spawnProxy } = require('./utils');

let testPort = 9802;

const getPort = () => testPort++;

test.beforeEach((test) => {
  const app = new Koa();

  app.use(bodyParser({
    enableTypes: [ 'text' ]
  }));

  app.use((context) => {
    if (context.request.path === '/headerTest') {
      context.response.body = context.request.headers;
      return;
    }

    if (context.request.path === '/dataTest') {
      context.response.body = context.request.body;
      return;
    }

    context.throw(404, 'Not Found');
  });

  return createTestServer(test, app);
});

test.always.afterEach(destroyTestServer);

test('The --proxy flag starts a proxy to send commands to alpha', async (test) => {
  const proxyPort = getPort();
  const process = await spawnProxy('--proxy', '--proxy-port', proxyPort, test.context.url);

  try {
    const { stdout, stderr } = await runCommand('-H', 'Test-Header: header value', `http://127.0.0.1:${proxyPort}/headerTest`);
    const headers = JSON.parse(stdout);

    test.deepEqual(
      Object.keys(headers).sort(),
      [ 'accept', 'connection', 'host', 'test-header', 'user-agent' ]
    );
    test.is(headers['test-header'], 'header value');
    test.falsy(stderr);
  } finally {
    process.kill();
  }
});

test('The proxy passes data', async (test) => {
  const proxyPort = getPort();
  const process = await spawnProxy('--proxy', '--proxy-port', proxyPort, test.context.url);

  try {
    const { stdout, stderr } = await runCommand(
      '--data-binary', '{"message":"hello"}',
      '--header', 'Content-Type: text/plain',
      '--request', 'POST',
      `http://127.0.0.1:${proxyPort}/dataTest`
    );

    test.is(stdout, '{"message":"hello"}');
    test.falsy(stderr);
  } finally {
    process.kill();
  }
});

test('The proxy handles errors', async (test) => {
  const proxyPort = getPort();

  const process = await spawnProxy('--proxy', '--proxy-port', proxyPort, 'https://localhost:0/');
  try {
    const { stdout } = await runCommand(
      '--data-binary', '{"message":"hello"}',
      '--header', 'Content-Type: text/plain',
      '--request', 'POST',
      `http://127.0.0.1:${proxyPort}/derp`
    );
    test.regex(stdout, /Error: connect/);
  } finally {
    process.kill();
  }
});

test('The proxy ends if the user presses a key', async (test) => {
  const proxyPort = getPort();

  const process = await spawnProxy('--proxy', '--proxy-port', proxyPort, `http://127.0.0.1:${proxyPort}/headerTest`);
  try {
    process.stdin.write('q\n');
    await new Promise((resolve) => {
      process.on('exit', () => {
        resolve();
      });
    });
    test.is(process.exitCode, 0);
  } finally {
    process.kill();
  }
});
