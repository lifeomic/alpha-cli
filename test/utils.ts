import http from 'http';
import path from 'path';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import util from 'util';
import net, { Server } from 'net';
import Koa from 'koa';

const root = path.join(__dirname, '..');

const cli = path.join(root, 'src/cli.ts');
const tsNode = path.join(root, 'node_modules/.bin/ts-node');

export interface TestContext {
  server: Server;
  url: string;
}

const spawnCli = (args: string[]) => {
  return spawn(tsNode, [cli, ...args]);
};

export const runCommand = (...args: string[]): Promise<{ stderr: string; stdout: string; }> => {
  return new Promise((resolve, reject) => {
    const child = spawnCli(args);
    const stderr: string[] = [];
    const stdout: string[] = [];

    child.once('error', reject);
    child.stderr.on('data', (chunk: string) => stderr.push(chunk));
    child.stdout.on('data', (chunk: string) => stdout.push(chunk));

    child.once('close', (code) => {
      const errorOutput = stderr.join('');
      const output = stdout.join('');

      if (code) {
        const error = new Error(
          `Command failed: ${cli} ${args.join(' ')}\n${errorOutput}`,
        );
        (error as any).stderr = errorOutput;
        (error as any).stdout = output;
        (error as any).code = code;
        reject(error);
        return;
      }

      resolve({
        stderr: errorOutput,
        stdout: output,
      });
    });
  });
};

export const spawnProxy = (...args: string[]): Promise<ChildProcessWithoutNullStreams> => {
  return new Promise((resolve, reject) => {
    const child = spawnCli(args);

    child.stdout.once('data', () => {
      resolve(child);
    });
    child.once('error', reject);
    child.stderr.on('data', (chunk: Buffer) => console.error(Buffer.from(chunk).toString('utf-8')));
    child.stdout.on('data', (chunk: Buffer) => console.log(Buffer.from(chunk).toString('utf-8')));
  });
};

export const createTestServer = (context: TestContext, app: Koa) => {
  const srv = context.server = http.createServer(app.callback());

  return new Promise((resolve, reject) => {
    srv.once('error', reject);
    srv.listen(() => {
      context.url = `http://localhost:${(srv.address() as net.AddressInfo).port}`;
      resolve(undefined);
    });
  });
};

export const destroyTestServer = (context: TestContext) => {
  const close = context.server.close.bind(context.server) as Server['close'];
  const stop = util.promisify(close);
  return stop();
};

export const getPort = async (): Promise<string> => {
  return await new Promise((resolve, reject) => {
    try {
      const srv = net.createServer(() => {
      });
      srv.listen(0, 'localhost', () => {
        const { port } = (srv.address() as net.AddressInfo);
        srv.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve(`${port}`);
          }
        });
      });
    } catch (e) {
      reject(e);
    }
  });
};
