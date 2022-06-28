import type { Argv } from 'yargs';
import { Config, Arguments } from '../types';

export const parseLine = (headers: Record<string, string>, line: string) => {
  const [untrimmedKey, untrimmedValue] = line.split(':');
  if (untrimmedValue === undefined) {
    return headers;
  }

  const key = untrimmedKey.trim();
  const value = untrimmedValue.trim();

  if (value) {
    // This object is simply used to serialize headers on the client
    // request. The risk of arbitrary attribute injection here should
    // be marginal.
    headers[key] = value;
  } else {
    // Same as above.
    delete headers[key];
  }

  return headers;
};

export default (yargs: Argv) => {
  yargs.option('H', {
    alias: 'header',
    type: 'string',
    describe: 'Pass custom header line to server',
  });

  return (config: Config, { header }: Arguments) => {
    if (!header) {
      return;
    }
    if (Array.isArray(header)) {
      config.headers = header.reduce(parseLine, {});
    } else {
      config.headers = [header].reduce(parseLine, {});
    }
  };
};
