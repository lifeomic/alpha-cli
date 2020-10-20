module.exports = (yargs) => {
  yargs.option('proxy', {
    type: 'boolean',
    default: false,
    describe: 'http proxy requests to alpha'
  });

  return (config) => {
    if (yargs.argv['proxy']) {
      config.proxy = true;
    }
  };
};
