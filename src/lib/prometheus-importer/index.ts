import {PluginParams, ExecutePlugin} from '@grnsft/if-core/types';
import {z} from 'zod';
import * as dotenv from 'dotenv';

import {ConfigParams, Env} from './types';

export const PrometheusImporter = (
  globalConfig: ConfigParams
): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
  };

  /**
   * Validates global config.
   */
  const validateGlobalConfig = () => {
    const keyValuePairSchema = z.object({
      key: z.string(),
      value: z.string(),
    });
    const schema = z.object({
      query: z.string(),
      start: z.string(),
      end: z.string(),
      step: z.string(),
      metricLabels: z.array(z.string()),
      metricName: z.string(),
      defaultLabels: z.array(keyValuePairSchema),
    });

    const validationResult = schema.safeParse(schema);
    if (!validationResult.success) {
      throw new Error(validationResult.error.message);
    }
    return validationResult.data;
  };

  /**
   * Validates required env properties.
   */
  const validateEnvProperties = () => {
    dotenv.config();
    if (getEnvVariable('HOST') === '') {
      throw new Error('Environment variable HOST is not defined');
    }
  };

  const getEnvVariable = (key: keyof Env): string => {
    const value = process.env[key];
    if (!value) {
      return '';
    }
    return value;
  };

  /**
   * Execute's strategy description here.
   */
  const execute = async (inputs: PluginParams[]): Promise<PluginParams[]> => {
    if (inputs && inputs[0]) {
      return inputs;
    }
    validateGlobalConfig();
    validateEnvProperties();

    return inputs.map(input => {
      // your logic here
      globalConfig;

      return input;
    });
  };

  return {
    metadata,
    execute,
  };
};
