const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const util = require('util');

const cli = path.join(__dirname, '../src/cli.js');

function runCommand () {
  const args = Array.prototype.slice.call(arguments);
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
          `Command failed: ${command} ${args.join(' ')}\n${errorOutput}`
        );
        error.stderr = errorOutput;
        error.stdout = output;
        error.code = code;
        reject(error);
        return;
      }

      resolve({
        stderr: errorOutput,
        stdout: output
      });
    });
  });
}

function spawnProxy () {
  const args = Array.prototype.slice.call(arguments);
  const command = cli;

  return new Promise((resolve) => {
    const child = spawn(command, args);

    child.stdout.on('data', () => {
      resolve(child);
    });
  });
}

function createTestServer (test, app) {
  const server = test.context.server = http.createServer(app.callback());

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(() => {
      test.context.url = `http://localhost:${server.address().port}`;
      resolve();
    });
  });
}

function destroyTestServer (test) {
  const stop = util.promisify(test.context.server.close.bind(test.context.server));
  return stop();
}

module.exports = {
  createTestServer,
  destroyTestServer,
  runCommand,
  spawnProxy
};
