const { createServer } = require('http');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const omit = require('lodash/omit');

const alphaProxy = (baseConfig, callAlpha) => {
  const app = new Koa();
  app.use(bodyParser());

  app.use(async (context) => {
    const { method, url, headers, body } = context.request;
    const requestConfig = {
      ...baseConfig,
      method,
      url: `lambda:/${url}`,
      headers: {
        ...baseConfig.headers,
        ...omit(headers, 'content-length')
      },
      data: body
    };
    const result = await callAlpha(requestConfig);
    context.body = result.data;
    for (const [key, val] of Object.entries(result.headers)) {
      context.set(key, val);
    }
  });
  const server = createServer(app.callback());
  server.listen(baseConfig.proxyPort, 'localhost');
  return server;

  // return createServer((req, response) => {
  //   const { method, url } = req;
  //   console.log(baseConfig.url, method, url);
  //   const requestConfig = {
  //     ...baseConfig,
  //     method,
  //     url: `lambda:/${url}`,
  //     headers: {
  //       ...baseConfig.headers,
  //       ...req.headers
  //     }
  //   };

  //   let data = '';

  //   req.on('data', chunk => {
  //     data += chunk;
  //   });

  //   req.on('end', () => {
  //     if (data) {
  //       requestConfig.data = data;
  //     }
  //     callback(requestConfig).then((result) => {
  //       response.statusCode = result.status;
  //       response.write(result.data);
  //       response.end();
  //     }).catch((e) => {
  //       response.write(e.toString());
  //       response.end();
  //     });
  //   });
  // }).listen(baseConfig.proxyPort, 'localhost');
};

module.exports = alphaProxy;
