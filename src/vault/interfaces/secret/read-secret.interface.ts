import { SecretContext, SecretUpdateBy } from '../secret.interface';

export interface ReadSecretOptions {
  id: string;
}

export interface ReadSecretMetadataResponse {
  context: SecretContext;
  environment_id: string;
  id: string;
  key_id: string;
  updated_at: string;
  updated_by: SecretUpdateBy;
  version_id: string;
}

export interface ReadSecretResponse {
  id: string;
  metadata: ReadSecretMetadataResponse;
  name: string;
  value: string;
}
