import { Argv } from 'yargs';
import { AlphaCliArguments, AlphaCliConfig } from '../types';

export default (yargs: Argv) => {
  yargs.option('data-binary', {
    describe: 'Send binary data',
  });

  return (config: AlphaCliConfig, args: AlphaCliArguments) => {
    if (args['data-binary']) {
      config.data = args['data-binary'];
    }
  };
};
