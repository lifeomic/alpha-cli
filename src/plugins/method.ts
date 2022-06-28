import { Argv } from 'yargs';
import { Arguments, Config } from '../types';

export default (yargs: Argv) => {
  yargs.option('X', {
    alias: 'request',
    describe: 'Specify the request method to use',
  });

  return (config: Config, { request }: Arguments) => {
    if (request) {
      config.method = request;
    }
  };
};
