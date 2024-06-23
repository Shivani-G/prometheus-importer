import {ApiHeader} from '../types';

export type AuthProvider = {
  /**
   *
   * @returns auth type: None, BasicAuth, BearerTokenAuth
   */
  getAuthType: () => string;

  /**
   *
   * @param username
   * @param password
   * @returns header as key value pairs
   */
  getBasicAuthHeaders: (username: string, password: string) => ApiHeader;

  /**
   *
   * @param bearerToken
   * @returns header as key value pairs
   */
  getBearerTokenHeaders: (bearerToken: string) => ApiHeader;
  [key: string]: any;
};

export type QueryExecutor = {
  /**
   * @param query
   * @param step
   * @param start
   * @param end
   * @returns json api response
   */
  getMetricsFor: (
    query: string,
    step: string,
    start: string,
    end: string
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
