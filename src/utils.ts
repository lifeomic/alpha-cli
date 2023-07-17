import { AlphaCliConfig } from './types';
import { Alpha } from '@lifeomic/alpha';

export const callAlpha = async ({ handler, ...config }: AlphaCliConfig) => {
  const client = handler ? new Alpha(handler) : new Alpha();
  const response = await client.request<string>(config);

  const processedResponse = config.responsePostProcessors.reduce((reduce, processor) => {
    return processor(reduce);
  }, response);

  // Use raw output stream to preserve the raw data
  return processedResponse;
};
