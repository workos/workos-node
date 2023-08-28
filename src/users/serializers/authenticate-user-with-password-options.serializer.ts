import {
  AuthenticateUserWithPasswordCredentials,
  AuthenticateUserWithPasswordOptions,
  SerializedAuthenticateUserWithPasswordOptions,
} from '../interfaces';

export const serializeAuthenticateUserWithPasswordOptions = (
  options: AuthenticateUserWithPasswordOptions &
    AuthenticateUserWithPasswordCredentials,
): SerializedAuthenticateUserWithPasswordOptions => ({
  grant_type: 'password',
  client_id: options.clientId,
  client_secret: options.clientSecret,
  email: options.email,
  password: options.password,
  ip_address: options.ipAddress,
  user_agent: options.userAgent,
});
