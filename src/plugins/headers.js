module.exports = (yargs) => {
  yargs.option('H', {
    alias: 'header',
    describe: 'Pass custom header line to server',
  });

  return (config) => {
    if (yargs.argv.header) {
      const lines = [].concat(yargs.argv.header);

      config.headers = lines.reduce(
        (headers, line) => {
          const boundary = line.indexOf(':');

          if (boundary < 0) {
            return headers;
          }

          const key = line.slice(0, boundary).trim();
          const value = line.slice(boundary + 1, line.length).trim();

          if (value) {
            // This object is simply used to serialize headers on the client
            // request. The risk of arbitrary attribute injection here should
            // be marginal.
            headers[key] = value;
          } else {
            // Same as above.
            delete headers[key];
          }

          return headers;
        },
        {},
      );
    }
  };
};
