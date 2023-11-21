import {
  AuthenticateUserWithEmailVerificationCredentials,
  AuthenticateWithEmailVerificationOptions,
  SerializedAuthenticateWithEmailVerificationOptions,
} from '../interfaces/authenticate-with-email-verification-options.interface';

export const serializeAuthenticateWithEmailVerificationOptions = (
  options: AuthenticateWithEmailVerificationOptions &
    AuthenticateUserWithEmailVerificationCredentials,
): SerializedAuthenticateWithEmailVerificationOptions => ({
  grant_type: 'urn:workos:oauth:grant-type:email-verification:code',
  client_id: options.clientId,
  client_secret: options.clientSecret,
  pending_authentication_token: options.pendingAuthenticationToken,
  code: options.code,
  ip_address: options.ipAddress,
  user_agent: options.userAgent,
});
