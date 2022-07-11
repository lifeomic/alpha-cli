import { AlphaCliArguments, AlphaCliConfig } from '../types';
import { Argv } from 'yargs';

export default (yargs: Argv) => {
  yargs.option('proxy', {
    type: 'boolean',
    default: false,
    describe: 'http proxy requests to alpha',
  });

  return (config: AlphaCliConfig, args: AlphaCliArguments) => {
    if (args.proxy) {
      config.proxied = true;
    }
  };
};
