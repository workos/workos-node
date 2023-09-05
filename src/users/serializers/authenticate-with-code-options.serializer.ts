import {
  AuthenticateUserWithCodeCredentials,
  AuthenticateWithCodeOptions,
  SerializedAuthenticateWithCodeOptions,
} from '../interfaces';

export const serializeAuthenticateWithCodeOptions = (
  options: AuthenticateWithCodeOptions & AuthenticateUserWithCodeCredentials,
): SerializedAuthenticateWithCodeOptions => ({
  grant_type: 'authorization_code',
  client_id: options.clientId,
  client_secret: options.clientSecret,
  code: options.code,
});
