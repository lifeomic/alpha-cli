import type { Argv } from "yargs";
import { AlphaCliConfig, AlphaCliArguments } from "../types";

export const parseLine = (headers: Record<string, string>, line: string) => {
  const indexOfFirstColon = line.indexOf(":");

  if (indexOfFirstColon < 0) {
    return headers;
  }

  const key = line.slice(0, indexOfFirstColon).trim();
  const value = line.slice(indexOfFirstColon + 1).trim();

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
  yargs.option("H", {
    alias: "header",
    type: "string",
    describe: "Pass custom header line to server",
  });

  return (config: AlphaCliConfig, { header }: AlphaCliArguments) => {
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
