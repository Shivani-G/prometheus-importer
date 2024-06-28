import {DataTransformer} from '../interfaces';

export const ParseAndEnrichDataTransformer = (): DataTransformer => {
  const parseMetrics = async (
    rawResponse: Record<string, any>,
    metricLabels: Array<string>,
    metricName: string,
    defaultLabels: Record<string, any>
  ) => {
    const x = await rawResponse;
    const output: Array<Record<string, any>> = [];
    for (const elm of x.data.result) {
      const metricLabelKeyValuePairs = await getMetricLabels(
        metricLabels,
        elm.metric
      );
      for (const [timestamp, value] of elm.values) {
        output.push({
          timestamp: timestamp,
          ...metricLabelKeyValuePairs,
          ...defaultLabels,
          [metricName]: parseFloat(value),
        });
      }
    }
    return output;
  };

  const getMetricLabels = async (
    metricLabels: Array<string>,
    rawMetricObject: Record<string, any>
  ) => {
    const x = await rawMetricObject;
    const output: Record<string, any> = {};
    for (const metricLabel of metricLabels) {
      output[metricLabel] = x[metricLabel];
    }
    return output;
  };

  return {
    parseMetrics,
  };
};
