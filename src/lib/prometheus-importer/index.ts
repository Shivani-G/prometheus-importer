import {PluginParams, ExecutePlugin} from '@grnsft/if-core/types';
import {z, ZodSchema} from 'zod';
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
    const schema = z.object({
      query: z.string(),
      start: z.string(),
      end: z.string(),
      step: z.string(),
      metricLabels: z.array(z.string()),
      metricName: z.string(),
      defaultLabels: z.record(z.any()),
    });

    return validate<z.infer<typeof schema>>(schema, globalConfig);
  };

  const validate = <T>(schema: ZodSchema<T>, object: any) => {
    const validationResult = schema.safeParse(object);

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
