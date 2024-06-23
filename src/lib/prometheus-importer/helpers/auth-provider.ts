import {AuthProvider} from '../interfaces';
import {AuthCredentials} from '../types';

export const AuthenticationProvider = (): AuthProvider => {
  const usernameKey = 'USERNAME';
  const passwordKey = 'PASSWORD';
  const bearerTokenKey = 'BEARER_TOKEN';
  const basicAuthType = 'basic-auth';
  const bearerTokenType = 'bearer-token';
  const noAiuthType = 'none';

  const getAuthHeaders = (authCredentials: AuthCredentials) => {
    const authType = getAuthType(authCredentials);
    if (authType === basicAuthType) {
      const basicAuthToken = Buffer.from(
        authCredentials[usernameKey] + ':' + authCredentials[passwordKey]
      ).toString('base64');
      return {
        Authorization: 'Basic ' + basicAuthToken,
      };
    } else if (authType === bearerTokenType) {
      return {
        Authorization: 'Bearer ' + authCredentials[bearerTokenKey],
      };
    } else {
      return {};
    }
  };

  const getAuthType = (authCredentials: AuthCredentials) => {
    if (usernameKey in authCredentials && passwordKey in authCredentials) {
      return basicAuthType;
    } else if (bearerTokenKey in authCredentials) {
      return bearerTokenType;
    } else {
      return noAiuthType;
    }
  };

  return {
    getAuthHeaders,
  };
};
