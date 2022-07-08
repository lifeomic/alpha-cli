import { AlphaCliArguments, AlphaCliConfig } from '../types';

export default () => {
  return (config: AlphaCliConfig, args: AlphaCliArguments) => {
    if (args._.length) {
      config.url = args._[0];
    }
  };
};
