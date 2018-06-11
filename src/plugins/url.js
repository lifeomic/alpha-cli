module.exports = (yargs) => {
  return (config) => {
    if (yargs.argv._.length) {
      config.url = yargs.argv._[0];
    }
  };
};
