import { AlphaCliConfig } from './types';
import { Alpha } from '@lifeomic/alpha';

export const callAlpha = async (config: AlphaCliConfig) => {
  const client = new Alpha();
  const response = await client.request<string>(config);

  const processedResponse = config.responsePostProcessors.reduce((reduce, processor) => {
    return processor(reduce);
  }, response);

  // Use raw output stream to preserve the raw data
  return processedResponse;
};
