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
  accessToken: AccessToken;
}

export interface GetAccessTokenFailureResponse {
  accessToken: null;
  reason: 'not_installed' | 'needs_reauthorization';
}

export type GetAccessTokenResponse =
  | GetAccessTokenSuccessResponse
  | GetAccessTokenFailureResponse;

export type SerializedGetAccessTokenResponse = SerializedAccessToken;
