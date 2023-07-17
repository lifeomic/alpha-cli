import { createServer } from 'http';
import { AlphaCliConfig } from './types';
import { callAlpha } from './utils';

export const alphaProxy = (baseConfig: AlphaCliConfig) => {
  return createServer((req, response) => {
    const { method, url } = req;
    delete req.headers.host;
    delete req.headers.Host;
    const requestConfig: AlphaCliConfig = {
      ...baseConfig,
      method: method as AlphaCliConfig['method'],
      url: `${baseConfig.url ?? ''}${url as string}`,
      headers: {
        ...baseConfig.headers,
        ...req.headers as Record<string, string>,
      },
    };
    if (requestConfig.lambda) {
      requestConfig.url = url;
    }

    let data = '';

    req.on('data', (chunk: string) => {
      data += chunk;
    });

    req.on('end', () => {
      if (data) {
        requestConfig.data = data;
      }
      callAlpha(requestConfig).then((result) => {
        response.statusCode = result.status;
        response.write(result.data);
        response.end();
      }).catch((e) => {
        response.write(e.toString());
        response.end();
      });
    });
  }).listen(baseConfig.proxyPort, 'localhost');
};
