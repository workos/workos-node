import { User, UserResponse } from './user.interface';

export interface AuthenticationResponse {
  user: User;
  organizationId?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface AuthenticationResponseResponse {
  user: UserResponse;
  organization_id?: string;
  access_token?: string;
  refresh_token?: string;
}

export interface RefreshAuthenticationResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshAuthenticationResponseResponse {
  access_token: string;
  refresh_token: string;
}
