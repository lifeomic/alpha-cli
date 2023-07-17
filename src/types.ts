import { Handler } from 'aws-lambda';
import { AlphaOptions, AlphaResponse } from '@lifeomic/alpha';

export interface AlphaCliConfig extends AlphaOptions<string> {
  responsePostProcessors: ((data: AlphaResponse<string>) => AlphaResponse<string>)[];
  proxied?: boolean;
  proxyPort?: number;
  handler?: Handler;
}

export interface AlphaCliArguments {
  header?: string;
  request?: AlphaCliConfig['method'];
  'data-binary'?: any;
  proxy?: boolean;
  'proxy-port'?: number;
  'lambda-handler'?: string;
  'env-file'?: string;
  'validate-status'?: boolean;
  version?: boolean;
  sign?: boolean;
  role?: string;
  _: string[];
}
