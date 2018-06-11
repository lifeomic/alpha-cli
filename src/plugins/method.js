module.exports = (yargs) => {
  yargs.option('X', {
    alias: 'request',
    describe: 'Specify the request method to use'
  });

  return (config) => {
    if (yargs.argv.request) {
      config.method = yargs.argv.request;
    }
  };
};
