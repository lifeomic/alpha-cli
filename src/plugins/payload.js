module.exports = (yargs) => {
  yargs.option('data-binary', {
    describe: 'Send binary data',
  });

  return (config) => {
    if (yargs.argv['data-binary']) {
      config.data = yargs.argv['data-binary'];
    }
  };
};
