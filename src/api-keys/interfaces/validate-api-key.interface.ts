import { ApiKey, SerializedApiKey } from './api-key.interface';

export interface ValidateApiKeyOptions {
  value: string;
}

export interface ValidateApiKeyResponse {
  apiKey: ApiKey | null;
}

export interface SerializedValidateApiKeyResponse {
  api_key: SerializedApiKey | null;
}
