import { createServer } from 'http';
import { Config } from './types';
import { callAlpha } from './utils';

export const alphaProxy = (baseConfig: Config) => {
  return createServer((req, response) => {
    const { method, url } = req;
    const requestConfig: Config = {
      ...baseConfig,
      method: method as Config['method'],
      url: `${baseConfig.url as string}${url as string}`,
      headers: {
        ...baseConfig.headers,
        ...req.headers as Record<string, string>,
      },
    };

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
