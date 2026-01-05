import {
  AuthenticateWithOptionsBase,
  SerializedAuthenticateWithPKCEBase,
} from './authenticate-with-options-base.interface';

export interface AuthenticateWithRefreshTokenPKCEOptions
  extends AuthenticateWithOptionsBase {
  refreshToken: string;
  organizationId?: string;
}

export interface SerializedAuthenticateWithRefreshTokenPKCEOptions
  extends SerializedAuthenticateWithPKCEBase {
  grant_type: 'refresh_token';
  refresh_token: string;
  organization_id: string | undefined;
}
