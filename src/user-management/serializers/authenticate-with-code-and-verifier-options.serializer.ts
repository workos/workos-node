import {
  AuthenticateUserWithPKCECredentials,
  AuthenticateWithCodeAndVerifierOptions,
  SerializedAuthenticateWithCodeAndVerifierOptions,
} from '../interfaces';

export const serializeAuthenticateWithCodeAndVerifierOptions = (
  options: AuthenticateWithCodeAndVerifierOptions & AuthenticateUserWithPKCECredentials,
): SerializedAuthenticateWithCodeAndVerifierOptions => ({
  grant_type: 'authorization_code',
  client_id: options.clientId,
  code: options.code,
  code_verifier: options.codeVerifier,
  invitation_token: options.invitationToken,
  ip_address: options.ipAddress,
  user_agent: options.userAgent,
});