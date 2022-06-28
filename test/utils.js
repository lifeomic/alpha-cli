const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const util = require('util');
const net = require('net');

const cli = path.join(__dirname, '../src/cli.js');

const runCommand = (...args) => {
  const command = cli;

  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    const stderr = [];
    const stdout = [];

    child.once('error', reject);
    child.stderr.on('data', (chunk) => stderr.push(chunk));
    child.stdout.on('data', (chunk) => stdout.push(chunk));

    child.once('close', (code) => {
      const errorOutput = stderr.join('');
      const output = stdout.join('');

      if (code) {
        const error = new Error(
          `Command failed: ${command} ${args.join(' ')}\n${errorOutput}`,
        );
        error.stderr = errorOutput;
        error.stdout = output;
        error.code = code;
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

const spawnProxy = (...args) => {
  const command = cli;

  return new Promise((resolve) => {
    const child = spawn(command, args);

    child.stdout.on('data', () => {
      resolve(child);
    });
  });
};

const createTestServer = (context, app) => {
  const server = context.server = http.createServer(app.callback());

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(() => {
      context.url = `http://localhost:${server.address().port}`;
      resolve();
    });
  });
};

const destroyTestServer = (context) => {
  const stop = util.promisify(context.server.close.bind(context.server));
  return stop();
};

const getPort = async () => {
  return await new Promise((resolve, reject) => {
    try {
      const srv = net.createServer(() => {
      });
      srv.listen(0, () => {
        const { port } = srv.address();
        srv.close((err) => reject(err));
        return resolve(`${port}`);
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createTestServer,
  destroyTestServer,
  runCommand,
  spawnProxy,
  getPort,
};
