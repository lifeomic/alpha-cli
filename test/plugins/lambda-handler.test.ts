import path from 'path';
import yargs from 'yargs';
import { ulid } from 'ulid';
import { dump } from 'js-yaml';
import { promises as fs } from 'fs';

import lambdaHandlerPlugin from '../../src/plugins/lambda-handler';
import { AlphaCliArguments, AlphaCliConfig } from '../../src/types';

const buildDir = path.join(__dirname, '..', 'build');
const lambdaHandler = path.join(__dirname, '..', 'lambdaHandlers', 'exportHandler.ts');
const pluginFunc = lambdaHandlerPlugin(yargs);

beforeAll(async () => {
  await fs.mkdir(buildDir, { recursive: true });
});

test.each([
  'exportHandler.ts',
  'exportApp.ts',
])('%s will load the lambda-handler function', async (lambdaHandlerFile) => {
  const config: AlphaCliConfig = {
    responsePostProcessors: [],
  };
  const cliArgs: AlphaCliArguments = {
    _: [''],
    'lambda-handler': path.join(__dirname, '..', 'lambdaHandlers', lambdaHandlerFile),
  };
  await expect(pluginFunc(config, cliArgs)).resolves.toBeUndefined();
  expect(config).toHaveProperty('lambda', expect.any(Function));
});

test('will throw exception on unknown extension', async () => {
  const ext = `.${ulid()}`;
  const envFile = path.join(buildDir, `${ulid()}${ext.toUpperCase()}`);
  await fs.writeFile(envFile, '', 'utf-8');

  const config: AlphaCliConfig = {
    responsePostProcessors: [],
  };
  const cliArgs: AlphaCliArguments = {
    _: [''],
    'lambda-handler': lambdaHandler,
    'env-file': envFile,
  };
  try {
    await expect(pluginFunc(config, cliArgs)).rejects.toThrowError(`Unable to load ${envFile}, unrecognized extension ${ext.toLowerCase()}`);
  } finally {
    await fs.rm(envFile, { force: true });
  }
});

describe.each([
  'json',
  'yaml',
  'yml',
  'env',
])('will load %s into the process.env', (ext) => {
  const envFile = path.join(buildDir, `${ulid()}.${ext}`);
  const envVars = {
    [ulid()]: ulid(),
  };
  beforeAll(async () => {
    let envString = '';
    if (ext === 'json') {
      envString = JSON.stringify(envVars);
    } else if (ext === 'env') {
      envString = Object.entries(envVars).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join('\n');
    } else if (['yaml', 'yml'].includes(ext)) {
      envString = dump(envVars);
    }

    await fs.writeFile(envFile, envString, 'utf-8');
  });
  afterAll(async () => {
    await fs.rm(envFile, { force: true });
  });

  test('will load the env file', async () => {
    const config: AlphaCliConfig = {
      responsePostProcessors: [],
    };
    const cliArgs: AlphaCliArguments = {
      _: [''],
      'lambda-handler': lambdaHandler,
      'env-file': envFile,
    };
    await expect(pluginFunc(config, cliArgs)).resolves.toBeUndefined();
    expect(process.env).toStrictEqual(expect.objectContaining(envVars));
  });
});
