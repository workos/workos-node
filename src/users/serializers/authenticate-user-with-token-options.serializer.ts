import {
  AuthenticateUserWithTokenCredentials,
  AuthenticateUserWithTokenOptions,
  SerializedAuthenticateUserWithTokenOptions,
} from '../interfaces';

export const serializeAuthenticateUserWithTokenOptions = (
  options: AuthenticateUserWithTokenOptions &
    AuthenticateUserWithTokenCredentials,
): SerializedAuthenticateUserWithTokenOptions => ({
  client_id: options.clientId,
  client_secret: options.clientSecret,
  code: options.code,
  grant_type: options.grantType,
  start_session: options.startSession,
  expires_in: options.expiresIn,
});
