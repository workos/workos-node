import { SecretContext } from './vault.interface';

export interface UpdateSecretEntity {
  value: string;
  key_context: SecretContext;
  version_check: string | undefined;
}

export interface UpdateSecretOptions {
  name: string;
  value: string;
  context: SecretContext;
  versionCheck: string | undefined;
}
