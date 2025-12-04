import { AccessToken, SerializedAccessToken } from './access-token.interface';

export interface GetAccessTokenOptions {
  userId: string;
  organizationId?: string | null;
}

export interface SerializedGetAccessTokenOptions {
  user_id: string;
  organization_id?: string | null;
}

export interface GetAccessTokenSuccessResponse {
  active: true;
  accessToken: AccessToken;
}

export interface GetAccessTokenFailureResponse {
  active: false;
  error: 'not_installed' | 'needs_reauthorization';
}

export type GetAccessTokenResponse =
  | GetAccessTokenSuccessResponse
  | GetAccessTokenFailureResponse;

export interface SerializedGetAccessTokenSuccessResponse {
  active: true;
  access_token: SerializedAccessToken;
}

export interface SerializedGetAccessTokenFailureResponse {
  active: false;
  error: 'not_installed' | 'needs_reauthorization';
}

export type SerializedGetAccessTokenResponse =
  | SerializedGetAccessTokenSuccessResponse
  | SerializedGetAccessTokenFailureResponse;
