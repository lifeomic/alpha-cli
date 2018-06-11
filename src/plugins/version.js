const metadata = require('../../package.json');
const path = require('path');
const pkginfo = require('pkginfo');

const alpha = pkginfo.find(module, path.dirname(require.resolve('@lifeomic/alpha')));

module.exports = (yargs) => {
  yargs.version(false)
    .option('V', {
      alias: 'version',
      describe: 'Show the version number and quit',
      type: 'boolean'
    });

  return (config) => {
    if (yargs.argv.version) {
      console.log(`${metadata.name} v${metadata.version}`);
      console.log(`${alpha.name} v${alpha.version}`);
      return true;
    }
    return false;
  };
};
