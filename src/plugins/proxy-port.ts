import { Argv } from 'yargs';
import { AlphaCliArguments, AlphaCliConfig } from '../types';

export default (yargs: Argv) => {
  yargs.option('proxy-port', {
    type: 'number',
    describe: 'port to proxy requests on',
    default: 9000,
  });

  return (config: AlphaCliConfig, args: AlphaCliArguments) => {
    config.proxyPort = args['proxy-port'];
  };
};
