import {
  SerializedValidateApiKeyResponse,
  ValidateApiKeyResponse,
} from '../interfaces/validate-api-key.interface';
import { deserializeApiKey } from './api-key.serializer';

export function deserializeValidateApiKeyResponse(
  response: SerializedValidateApiKeyResponse,
): ValidateApiKeyResponse {
  return {
    apiKey: response.api_key ? deserializeApiKey(response.api_key) : null,
  };
}
