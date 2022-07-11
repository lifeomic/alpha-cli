import { Argv } from 'yargs';

import { ValidationError } from '../ValidationError';
import { AlphaCliArguments, AlphaCliConfig } from '../types';

export default (yargs: Argv) => {
  yargs.option('validate-status', {
    default: false,
    type: 'boolean',
    describe: 'Validate the HTTP response code and fail if not 2XX',
  });

  return (config: AlphaCliConfig, args: AlphaCliArguments) => {
    if (args['validate-status']) {
      config.responsePostProcessors.push((response) => {
        if (response.status < 200 || response.status >= 300) {
          const stderr = `The HTTP response code was ${response.status}\n`;
          throw new ValidationError(response.data, stderr);
        }
        return response;
      });
    }
  };
};
