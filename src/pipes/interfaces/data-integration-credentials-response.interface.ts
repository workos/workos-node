// @oagen-ignore-file
// Hand-maintained to preserve the spec's nested credential discriminants.

import type {
  DataIntegrationCredentialsResponseCredential,
  DataIntegrationCredentialsResponseCredentialResponse,
} from './data-integration-credentials-response-credential.interface';
import type { DataIntegrationCredentialsResponseError } from './data-integration-credentials-response-error.interface';

export type DataIntegrationCredentialsResponse =
  | { active: true; credential: DataIntegrationCredentialsResponseCredential }
  | { active: false; error: DataIntegrationCredentialsResponseError };

export type DataIntegrationCredentialsResponseWire =
  | {
      active: true;
      credential: DataIntegrationCredentialsResponseCredentialResponse;
    }
  | { active: false; error: DataIntegrationCredentialsResponseError };
