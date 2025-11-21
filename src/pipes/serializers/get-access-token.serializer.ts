import {
  GetAccessTokenOptions,
  GetAccessTokenResponse,
  SerializedGetAccessTokenOptions,
  SerializedGetAccessTokenResponse,
} from '../interfaces/get-access-token.interface';
import { deserializeAccessToken } from './access-token.serializer';

export function serializeGetAccessTokenOptions(
  options: GetAccessTokenOptions,
): SerializedGetAccessTokenOptions {
  return {
    user_id: options.userId,
    organization_id: options.organizationId,
  };
}

export function deserializeGetAccessTokenResponse(
  response: SerializedGetAccessTokenResponse,
): GetAccessTokenResponse {
  if (response.active) {
    return {
      active: true,
      accessToken: deserializeAccessToken(response.access_token),
    };
  }

  return {
    active: false,
    error: response.error,
  };
}
