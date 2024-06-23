export type ConfigParams = Record<string, any>;
export type ApiHeader = Record<string, string>;
export type KeyValuePair = {
  key: string;
  value: string;
};
export type Env = {
  HOST: string;
  USERNAME: string;
  PASSWORD: string;
  BEARER_TOKEN: string;
};
