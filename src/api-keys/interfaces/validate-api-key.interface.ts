import { ApiKey, SerializedApiKey } from './api-key.interface';

export interface ValidateApiKeyOptions {
  value: string;
}

export interface ValidateApiKeyResponse {
  apiKey: ApiKey | null;
  /**
   * The ID of the agent registration this API key was issued for. Present only
   * when the API key is assigned to an agent registration.
   */
  agentRegistrationId?: string;
}

export interface SerializedValidateApiKeyResponse {
  api_key: SerializedApiKey | null;
  agent_registration_id?: string;
}
