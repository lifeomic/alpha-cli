#!/usr/bin/env node

import glob from 'glob';
import path from 'path';
import yargs from 'yargs';
import { ValidationError } from './ValidationError';
import { alphaProxy } from './alphaProxy';
import { AlphaCliConfig } from './types';
import { callAlpha } from './utils';

const config: AlphaCliConfig = {
  transformResponse: [(data) => data],
  validateStatus: () => true,
  responsePostProcessors: [],
};

const run = async () => {
  const plugins = await Promise.all(glob.sync(path.join(__dirname, 'plugins/*.[jt]s'))
    .map(async (filename) => {
      const plugin = await import(filename);
      return plugin.default(yargs);
    }));

  const args = await yargs.parse();

  const skipRequest = plugins.some((execute) => execute(config, args));

  const {
    proxied,
    proxyPort,
  } = config;

  if (proxied) {
    alphaProxy(config).on('listening', () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      console.log(`Proxy is listening on port ${proxyPort!}; Press any key to quit;`);
    });

    // These are only relevant in a terminal, not in tests
    /* istanbul ignore next */
    if (process.stdin.isTTY) {
      /* istanbul ignore next */
      process.stdin.setRawMode(true);
    }
    process.stdin.on('data', () => {
      process.exit(0);
    });
  } else if (!skipRequest) {
    callAlpha(config).then((result) => {
      process.stdout.write(result.data);
    }).catch((error) => {
      if (error instanceof ValidationError) {
        process.stdout.write(error.stdout);
        process.stderr.write(error.stderr);
      } else {
        console.error(error.toString());
      }
      process.exitCode = 1;
    });
  }
};

run().catch((error) => {
  console.error(error);
});
