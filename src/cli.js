#!/usr/bin/env node
const Alpha = require('@lifeomic/alpha');
const glob = require('glob');
const path = require('path');
const yargs = require('yargs');
const ValidationError = require('./ValidationError');
const alphaProxy = require('./alphaProxy');

const plugins = glob.sync(path.join(__dirname, 'plugins/*.js '))
  .map(require)
  .map((loader) => loader(yargs));

const config = {
  transformResponse: [(data) => data],
  validateStatus: false,
  responsePostProcessors: []
};

const skipRequest = plugins.some((execute) => execute(config));

const callAlpha = async (config) => {
  const client = new Alpha();
  const response = await client.request(config);

  const processedResponse = config.responsePostProcessors.reduce(function (reduce, processor) {
    return processor(reduce);
  }, response);

  // Use raw output stream to preserve the raw data
  return processedResponse;
};

if (config.proxy) {
  alphaProxy(config, callAlpha);
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
