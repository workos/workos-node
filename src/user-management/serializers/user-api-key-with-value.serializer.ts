import {
  SerializedUserApiKeyWithValue,
  UserApiKeyWithValue,
} from '../interfaces/user-api-key-with-value.interface';
import { deserializeUserApiKey } from './user-api-key.serializer';

export function deserializeUserApiKeyWithValue(
  apiKey: SerializedUserApiKeyWithValue,
): UserApiKeyWithValue {
  return {
    ...deserializeUserApiKey(apiKey),
    value: apiKey.value,
  };
}
