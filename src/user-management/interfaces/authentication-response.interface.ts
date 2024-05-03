import { Impersonator, ImpersonatorResponse } from './impersonator.interface';
import { User, UserResponse } from './user.interface';

type AuthenticationMethod =
  | 'SSO'
  | 'Password'
  | 'GitHubOAuth'
  | 'GoogleOAuth'
  | 'MicrosoftOAuth'
  | 'MagicAuth'
  | 'Impersonation';
export interface AuthenticationResponse {
  user: User;
  organizationId?: string;
  accessToken: string;
  refreshToken: string;
  impersonator?: Impersonator;
  authenticationMethod?: AuthenticationMethod;
}

export interface AuthenticationResponseResponse {
  user: UserResponse;
  organization_id?: string;
  access_token: string;
  refresh_token: string;
  impersonator?: ImpersonatorResponse;
  authentication_method?: AuthenticationMethod;
}

export interface RefreshAuthenticationResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshAuthenticationResponseResponse {
  access_token: string;
  refresh_token: string;
}
