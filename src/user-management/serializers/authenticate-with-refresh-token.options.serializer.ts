import {
  AuthenticateUserWithCodeCredentials,
  AuthenticateWithRefreshTokenOptions,
  SerializedAuthenticateWithRefreshTokenOptions,
  WithResolvedClientId,
} from '../interfaces';

export const serializeAuthenticateWithRefreshTokenOptions = (
  options: WithResolvedClientId<AuthenticateWithRefreshTokenOptions> &
    AuthenticateUserWithCodeCredentials,
): SerializedAuthenticateWithRefreshTokenOptions => ({
  grant_type: 'refresh_token',
  client_id: options.clientId,
  client_secret: options.clientSecret,
  refresh_token: options.refreshToken,
  organization_id: options.organizationId,
  ip_address: options.ipAddress,
  user_agent: options.userAgent,
});
