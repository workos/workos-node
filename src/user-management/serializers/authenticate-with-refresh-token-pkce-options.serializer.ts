import {
  AuthenticateWithRefreshTokenPKCEOptions,
  SerializedAuthenticateWithRefreshTokenPKCEOptions,
} from '../interfaces';

export const serializeAuthenticateWithRefreshTokenPKCEOptions = (
  options: AuthenticateWithRefreshTokenPKCEOptions,
): SerializedAuthenticateWithRefreshTokenPKCEOptions => ({
  grant_type: 'refresh_token',
  client_id: options.clientId,
  refresh_token: options.refreshToken,
  organization_id: options.organizationId,
  ip_address: options.ipAddress,
  user_agent: options.userAgent,
});
