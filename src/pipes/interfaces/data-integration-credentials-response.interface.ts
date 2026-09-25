// @oagen-ignore-file
// Preserve legacy property access on the generated active/inactive union.

import type {
  DataIntegrationVendedCredential,
  DataIntegrationVendedCredentialResponse,
} from './data-integration-vended-credential.interface';
import type { DataIntegrationCredentialsResponseError } from './data-integration-credentials-response-error.interface';

// Keep absent fields readable without requiring consumers to narrow first.
export type DataIntegrationCredentialsResponse =
  | {
      active: true;
      credential: DataIntegrationVendedCredential;
      error?: undefined;
    }
  | {
      active: false;
      error: DataIntegrationCredentialsResponseError;
      credential?: undefined;
    };

export type DataIntegrationCredentialsResponseWire =
  | {
      active: true;
      credential: DataIntegrationVendedCredentialResponse;
      error?: undefined;
    }
  | {
      active: false;
      error: DataIntegrationCredentialsResponseError;
      credential?: undefined;
    };
