import {
  AuthenticateUserWithCodeCredentials,
  AuthenticateUserWithCodeOptions,
  SerializedAuthenticateUserWithCodeOptions,
} from '../interfaces';

export const serializeAuthenticateUserWithCodeOptions = (
  options: AuthenticateUserWithCodeOptions &
    AuthenticateUserWithCodeCredentials,
): SerializedAuthenticateUserWithCodeOptions => ({
  grant_type: 'authorization_code',
  client_id: options.clientId,
  client_secret: options.clientSecret,
  code: options.code,
});
