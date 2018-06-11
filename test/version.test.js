const { runCommand } = require('./utils');
const test = require('ava');

const VERSION_PATTERN = /@lifeomic\/alpha-cli v\d+\.\d+\.\d+\s@lifeomic\/alpha v\d+\.\d+\.\d+/;

test('The \'-V\' flag returns the program version number', async (test) => {
  const { stdout, stderr } = await runCommand('-V');

  test.regex(stdout, VERSION_PATTERN);
  test.falsy(stderr);
});

test('The \'--version\' flag returns the program version number', async (test) => {
  const { stdout, stderr } = await runCommand('--version');

  test.regex(stdout, VERSION_PATTERN);
  test.falsy(stderr);
});
