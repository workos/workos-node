import {
  AuthenticateWithOptionsBase,
  SerializedAuthenticatePublicClientBase,
} from './authenticate-with-options-base.interface';

/** Options for refreshing tokens as a public client (no client_secret required) */
export interface AuthenticateWithRefreshTokenPublicClientOptions extends AuthenticateWithOptionsBase {
  refreshToken: string;
  organizationId?: string;
}

export interface SerializedAuthenticateWithRefreshTokenPublicClientOptions extends SerializedAuthenticatePublicClientBase {
  grant_type: 'refresh_token';
  refresh_token: string;
  organization_id: string | undefined;
}
