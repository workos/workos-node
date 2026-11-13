import { ApiKey, SerializedApiKey } from './api-key.interface';

export interface ApiKeyPreviousAttributes {
  expiresAt: Date | null;
}

export interface SerializedApiKeyPreviousAttributes {
  expires_at: string | null;
}

export interface ApiKeyUpdatedEventData extends ApiKey {
  previousAttributes: ApiKeyPreviousAttributes;
}

export interface SerializedApiKeyUpdatedEventData extends SerializedApiKey {
  previous_attributes: SerializedApiKeyPreviousAttributes;
}
