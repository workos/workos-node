import {
  AuthenticateWithRefreshTokenPublicClientOptions,
  SerializedAuthenticateWithRefreshTokenPublicClientOptions,
  WithResolvedClientId,
} from '../interfaces';

export const serializeAuthenticateWithRefreshTokenPublicClientOptions = (
  options: WithResolvedClientId<AuthenticateWithRefreshTokenPublicClientOptions>,
): SerializedAuthenticateWithRefreshTokenPublicClientOptions => ({
  grant_type: 'refresh_token',
  client_id: options.clientId,
  refresh_token: options.refreshToken,
  organization_id: options.organizationId,
  ip_address: options.ipAddress,
  user_agent: options.userAgent,
});
