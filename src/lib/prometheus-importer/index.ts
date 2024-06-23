import {PluginParams, ExecutePlugin} from '@grnsft/if-core/types';
import {z} from 'zod';
import * as dotenv from 'dotenv';

import {ConfigParams, Env} from './types';
import {RangeQueryExecutor} from './helpers/range-query-executor';
import {ParseAndEnrichDataTransformer} from './helpers/data-transformer';

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
    dotenv.config();
    validateEnvProperties();
    const queryExecutor = RangeQueryExecutor();
    const dataTransformer = ParseAndEnrichDataTransformer();
    const rawResponse = queryExecutor.getMetricsFor(
      globalConfig.query,
      globalConfig.step,
      globalConfig.start,
      globalConfig.end,
      getEnvVariable('HOST'),
      process.env
    );
    return dataTransformer.parseMetrics(
      rawResponse,
      globalConfig.metricLabels,
      globalConfig.metricName,
      globalConfig.defaultLabels
    );
  };

  return {
    metadata,
    execute,
  };
};
