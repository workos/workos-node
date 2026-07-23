import { SerializedUserApiKey, UserApiKey } from './user-api-key.interface';

export interface UserApiKeyWithValue extends UserApiKey {
  value: string;
}

export interface SerializedUserApiKeyWithValue extends SerializedUserApiKey {
  value: string;
}
