const { createServer } = require('http');

const alphaProxy = async (baseConfig, callback) => {
  createServer((req, response) => {
    const { method, url } = req;
    const requestConfig = {
      ...baseConfig,
      method,
      url: baseConfig.url + url,
      headers: {
        ...baseConfig.headers,
        ...req.headers
      }
    };

    let data = '';

    req.on('data', chunk => {
      data += chunk;
    });

    req.on('end', () => {
      if (data) {
        requestConfig.data = data;
      }
      callback(requestConfig).then((result) => {
        response.statusCode = result.status;
        response.write(result.data);
        response.end();
      }).catch((e) => {
        response.write(e.toString());
        response.end();
      });
    });
  }).listen(baseConfig.proxyPort);
};

module.exports = alphaProxy;
