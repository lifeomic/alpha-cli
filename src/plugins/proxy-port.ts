import { Argv } from 'yargs';
import { Arguments, Config } from '../types';

export default (yargs: Argv) => {
  yargs.option('proxy-port', {
    type: 'number',
    describe: 'port to proxy requests on',
    default: 9000,
  });

  return (config: Config, args: Arguments) => {
    config.proxyPort = args['proxy-port'];
  };
};
