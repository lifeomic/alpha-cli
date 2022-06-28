import { AxiosRequestConfig } from 'axios';
import { AxiosResponse } from '@lifeomic/alpha';

export interface Config extends AxiosRequestConfig<string> {
  responsePostProcessors: ((data: AxiosResponse<string>) => AxiosResponse<string>)[];
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
  _: string[];
}
