module.exports = (yargs) => {
  yargs.option('proxy-port', {
    type: 'number',
    describe: 'port to proxy requests on',
    default: 9000,
  });

  return (config) => {
    config.proxyPort = yargs.argv['proxy-port'];
  };
};
