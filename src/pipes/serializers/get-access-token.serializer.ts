import {
  GetAccessTokenOptions,
  SerializedGetAccessTokenOptions,
  GetAccessTokenSuccessResponse,
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
): GetAccessTokenSuccessResponse {
  return {
    accessToken: deserializeAccessToken(response),
  };
}
