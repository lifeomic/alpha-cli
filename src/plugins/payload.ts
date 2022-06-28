import { Argv } from 'yargs';
import { Arguments, Config } from '../types';

export default (yargs: Argv) => {
  yargs.option('data-binary', {
    describe: 'Send binary data',
  });

  return (config: Config, args: Arguments) => {
    if (args['data-binary']) {
      config.data = args['data-binary'];
    }
  };
};
