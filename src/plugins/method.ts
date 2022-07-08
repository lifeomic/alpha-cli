import { Argv } from 'yargs';
import { AlphaCliArguments, AlphaCliConfig } from '../types';

export default (yargs: Argv) => {
  yargs.option('X', {
    alias: 'request',
    describe: 'Specify the request method to use',
  });

  return (config: AlphaCliConfig, { request }: AlphaCliArguments) => {
    if (request) {
      config.method = request;
    }
  };
};
