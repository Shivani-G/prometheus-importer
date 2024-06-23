import {QueryExecutor} from '../interfaces';
import fetch from 'node-fetch-commonjs';
import {AuthCredentials} from '../types';
import {AuthenticationProvider} from './auth-provider';

export const RangeQueryExecutor = (): QueryExecutor => {
  const getMetricsFor = async (
    query: string,
    step: string,
    start: string,
    end: string,
    host: string,
    authCredentials: AuthCredentials
  ) => {
    const connectionUrl = host + '/api/v1/query_range';

    const contentHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    const authProvider = AuthenticationProvider();
    const authHeaders = authProvider.getAuthHeaders(authCredentials);

    const requestbody = {
      query: query,
      start: start,
      end: end,
      step: step,
    };

    const response = await fetch(connectionUrl, {
      method: 'POST',
      headers: {...contentHeaders, ...authHeaders},
      body: new URLSearchParams(requestbody).toString(),
    });
    if (response.ok) {
      const jsonResponse = (await response.json()) as Record<string, any>;
      if (jsonResponse.status !== 'success') {
        throw new Error(
          `Error while fetching metrics from url ${connectionUrl}`
        );
      }
      return jsonResponse;
    } else {
      throw new Error(
        `Error while fetching m,etrics from url ${connectionUrl}`
      );
    }
  };

  return {
    getMetricsFor,
  };
};
