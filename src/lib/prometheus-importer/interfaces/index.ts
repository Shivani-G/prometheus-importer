import {AuthCredentials} from '../types';

export type AuthProvider = {
  /**
   *
   * @param authCredentials
   * @returns header as key value pairs
   */
  getAuthHeaders: (authCredentials: AuthCredentials) => Record<string, any>;
  [key: string]: any;
};

export type QueryExecutor = {
  /**
   * @param query
   * @param step
   * @param start
   * @param end
   * @param host
   * @param authCredentials
   * @returns json api response
   */
  getMetricsFor: (
    query: string,
    step: string,
    start: string,
    end: string,
    host: string,
    authCredentials: AuthCredentials
  ) => Object;
  [key: string]: any;
};

export type DataTransformer = {
  /**
   *
   * @param rawResponse
   * @param metricLabels
   * @param metricName
   * @param defaultLabels
   * @returns metrics in a standard format which is easy to read by other plugins
   */
  parseMetrics: (
    rawResponse: Record<string, any>,
    metricLabels: Array<string>,
    metricName: string,
    defaultLabels: Record<string, any>
  ) => Promise<Array<Record<string, any>>>;
  [key: string]: any;
};
