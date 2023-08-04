import {
  AuthenticateUserWithTokenCredentials,
  AuthenticateUserWithTokenOptions,
  SerializedAuthenticateUserWithTokenOptions,
} from '../interfaces';

export const serializeAuthenticateUserWithTokenOptions = (
  options: AuthenticateUserWithTokenOptions &
    AuthenticateUserWithTokenCredentials,
): SerializedAuthenticateUserWithTokenOptions => ({
  grant_type: 'authorization_code',
  client_id: options.clientId,
  client_secret: options.clientSecret,
  code: options.code,
  start_session: options.startSession,
  expires_in: options.expiresIn,
});
