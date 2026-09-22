// @oagen-ignore-file
// Hand-maintained to preserve the spec's nested credential discriminants.

import type {
  DataIntegrationCredentialsResponse,
  DataIntegrationCredentialsResponseWire,
} from '../interfaces/data-integration-credentials-response.interface';
import { deserializeDataIntegrationCredentialsResponseCredential } from './data-integration-credentials-response-credential.serializer';

export const deserializeDataIntegrationCredentialsResponse = (
  response: DataIntegrationCredentialsResponseWire,
): DataIntegrationCredentialsResponse => {
  switch (response.active) {
    case true:
      return {
        active: true,
        credential: deserializeDataIntegrationCredentialsResponseCredential(
          response.credential,
        ),
      };
    case false:
      return { active: false, error: response.error };
    default:
      throw new Error(
        `Unknown active: ${String((response as Record<string, unknown>).active)}`,
      );
  }
};
