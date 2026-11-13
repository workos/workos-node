import {
  ApiKeyUpdatedEventData,
  SerializedApiKeyUpdatedEventData,
} from '../interfaces/api-key-event.interface';
import { deserializeApiKey } from './api-key.serializer';

export function deserializeApiKeyUpdatedEvent(
  data: SerializedApiKeyUpdatedEventData,
): ApiKeyUpdatedEventData {
  return {
    ...deserializeApiKey(data),
    previousAttributes: {
      expiresAt:
        data.previous_attributes.expires_at != null
          ? new Date(data.previous_attributes.expires_at)
          : null,
    },
  };
}
