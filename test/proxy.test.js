const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const { createTestServer, destroyTestServer, runCommand, spawnProxy, getPort } = require('./utils');

let context;

beforeEach(async () => {
  context = {};
  const app = new Koa();

  app.use(bodyParser({
    enableTypes: ['text'],
  }));

  app.use((ctx) => {
    if (ctx.request.path === '/headerTest') {
      ctx.response.body = ctx.request.headers;
      return;
    }

    if (ctx.request.path === '/dataTest') {
      ctx.response.body = ctx.request.body;
      return;
    }

    ctx.throw(404, 'Not Found');
  });

  await createTestServer(context, app);
});

afterEach(async () => {
  await destroyTestServer(context);
});

test('The --proxy flag starts a proxy to send commands to alpha', async () => {
  const proxyPort = await getPort();
  const process = await spawnProxy('--proxy', '--proxy-port', proxyPort, context.url);

  try {
    const { stdout, stderr } = await runCommand('-H', 'Test-Header: header value', `http://127.0.0.1:${proxyPort}/headerTest`);
    const headers = JSON.parse(stdout);

    expect(Object.keys(headers).sort()).toEqual(['accept', 'connection', 'host', 'test-header', 'user-agent']);
    expect(headers['test-header']).toBe('header value');
    expect(stderr).toBeFalsy();
  } finally {
    process.kill();
  }
});

test('The proxy passes data', async () => {
  const proxyPort = await getPort();
  const process = await spawnProxy('--proxy', '--proxy-port', proxyPort, context.url);

  try {
    const { stdout, stderr } = await runCommand(
      '--data-binary', '{"message":"hello"}',
      '--header', 'Content-Type: text/plain',
      '--request', 'POST',
      `http://127.0.0.1:${proxyPort}/dataTest`,
    );

    expect(stdout).toBe('{"message":"hello"}');
    expect(stderr).toBeFalsy();
  } finally {
    process.kill();
  }
});

test('The proxy handles errors', async () => {
  const proxyPort = await getPort();

  const process = await spawnProxy('--proxy', '--proxy-port', proxyPort, 'https://localhost:0/');
  try {
    const { stdout } = await runCommand(
      '--data-binary', '{"message":"hello"}',
      '--header', 'Content-Type: text/plain',
      '--request', 'POST',
      `http://127.0.0.1:${proxyPort}/derp`,
    );
    expect(stdout).toMatch(/Error: connect/);
  } finally {
    process.kill();
  }
});

test('The proxy ends if the user presses a key', async () => {
  const proxyPort = await getPort();

  const process = await spawnProxy('--proxy', '--proxy-port', proxyPort, `http://127.0.0.1:${proxyPort}/headerTest`);
  try {
    process.stdin.write('q\n');
    await new Promise((resolve) => {
      process.on('exit', () => {
        resolve();
      });
    });
    expect(process.exitCode).toBe(0);
  } finally {
    process.kill();
  }
});
