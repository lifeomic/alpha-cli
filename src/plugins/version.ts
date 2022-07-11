import { AlphaCliArguments, AlphaCliConfig } from '../types';
import { Argv } from 'yargs';

import metadata from '../../package.json';
import alphaMetadata from '@lifeomic/alpha/package.json';

export default (yargs: Argv) => {
  yargs.version(false)
    .option('V', {
      alias: 'version',
      describe: 'Show the version number and quit',
      type: 'boolean',
    });

  return (config: AlphaCliConfig, args: AlphaCliArguments) => {
    if (args.version) {
      console.log(`${metadata.name} v${metadata.version}`);
      console.log(`${alphaMetadata.name} v${alphaMetadata.version}`);
      return true;
    }
    return false;
  };
};
