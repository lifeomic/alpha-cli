import { Arguments, Config } from '../types';

export default () => {
  return (config: Config, args: Arguments) => {
    if (args._.length) {
      config.url = args._[0];
    }
  };
};
