import { SecretContext } from '../secret.interface';

export interface CreateSecretEntity {
  name: string;
  value: string;
  key_context: SecretContext;
}

export interface CreateSecretOptions {
  name: string;
  value: string;
  context: SecretContext;
}
