import path from 'path';
import { getPort, runCommand, spawnProxy } from './utils';
import { ulid } from 'ulid';

describe.each([
  'exportApp',
  'exportHandler',
])('can send requests to %s', (handlerFile) => {
  const param: string = ulid();
  const filePath = path.join(__dirname, 'lambdaHandlers', `${handlerFile}.ts`);

  test('will send request to exported handler', async () => {
    const { stdout, stderr } = await runCommand('--lambda-handler', filePath, `/echo/${param}`);
    expect(stderr).toBeFalsy();
    expect(stdout).toBe(param);
  });

  test('will proxy requests to the exported handler', async () => {
    const proxyPort = await getPort();
    const process = await spawnProxy('--proxy', '--proxy-port', proxyPort, '--lambda-handler', filePath);

    try {
      const { stdout, stderr } = await runCommand(`http://127.0.0.1:${proxyPort}/echo/${param}`);

      expect(stdout).toBe(param);
      expect(stderr).toBeFalsy();
    } finally {
      process.kill();
    }
  });
});

