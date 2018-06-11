#!/usr/bin/env node
const Alpha = require('@lifeomic/alpha');
const glob = require('glob');
const path = require('path');
const yargs = require('yargs');
const ValidationError = require('./ValidationError');

const plugins = glob.sync(path.join(__dirname, 'plugins/*.js'))
  .map(require)
  .map((loader) => loader(yargs));

const config = {
  transformResponse: [(data) => data],
  validateStatus: false,
  responsePostProcessors: []
};

const skipRequest = plugins.some((execute) => execute(config));

(async function run () {
  if (skipRequest) {
    return;
  }

  const client = new Alpha();
  const response = await client.request(config);

  const processedResponse = config.responsePostProcessors.reduce(function (reduce, processor) {
    return processor(reduce);
  }, response);

  // Use raw output stream to preserve the raw data
  process.stdout.write(processedResponse.data);
})().catch((error) => {
  if (error instanceof ValidationError) {
    process.stdout.write(error.stdout);
    process.stderr.write(error.stderr);
  } else {
    console.error(error.toString());
  }
  process.exitCode = 1;
});
