import { AlphaCliArguments, AlphaCliConfig } from '../types';
import { Argv } from 'yargs';
import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'dotenv';
import { load } from 'js-yaml';

const loadEnvFile = async (envFile: string) => {
  const ext = path.extname(envFile).toLowerCase();
  const contents = await fs.readFile(envFile, 'utf-8');
  let newEnv: Record<string, any> = {};
  if (ext === '.env') {
    newEnv = parse(contents);
  } else if (ext === '.json') {
    newEnv = JSON.parse(contents);
  } else if (['.yaml', '.yml'].includes(ext)) {
    newEnv = load(contents) as Record<string, any>;
  } else {
    throw new Error(`Unable to load ${envFile}, unrecognized extension ${ext}`);
  }
  Object.assign(process.env, newEnv);
};

export default (yargs: Argv) => {
  yargs
    .option('lambda-handler', {
      type: 'string',
      describe: 'A javascript/typescript lambda handler to send requests to',
    })
    .option('env-file', {
      type: 'string',
      describe: 'File to load as environment variables when importing lambda',
    });

  return async (
    config: AlphaCliConfig,
    {
      'lambda-handler': lambdaHandler,
      'env-file': envFile,
    }: AlphaCliArguments,
  ) => {
    if (lambdaHandler) {
      if (envFile) {
        await loadEnvFile(envFile);
      }
      const exported = await import(lambdaHandler);
      config.lambda = exported.handler || exported.default.handler;
    }
  };
};
