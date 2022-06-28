import { runCommand } from './utils';

const VERSION_PATTERN = /@lifeomic\/alpha-cli v\d+\.\d+\.\d+\s@lifeomic\/alpha v\d+\.\d+\.\d+/;

test('The \'-V\' flag returns the program version number', async () => {
  const { stdout, stderr } = await runCommand('-V');

  expect(stdout).toMatch(VERSION_PATTERN);
  expect(stderr).toBeFalsy();
});

test('The \'--version\' flag returns the program version number', async () => {
  const { stdout, stderr } = await runCommand('--version');

  expect(stdout).toMatch(VERSION_PATTERN);
  expect(stderr).toBeFalsy();
});
