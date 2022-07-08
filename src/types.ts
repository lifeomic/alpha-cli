import { AlphaOptions, AlphaResponse } from '@lifeomic/alpha';

export interface Config extends AlphaOptions<string> {
  responsePostProcessors: ((data: AlphaResponse<string>) => AlphaResponse<string>)[];
  proxied?: boolean;
  proxyPort?: number;
}

export interface Arguments {
  header?: string;
  request?: Config['method'];
  'data-binary'?: any;
  proxy?: boolean;
  'proxy-port'?: number;
  'validate-status'?: boolean;
  version?: boolean;
  sign?: boolean;
  role?: string;
  _: string[];
}
