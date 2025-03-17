import { SecretContext } from "../secret.interface";

export interface UpdateSecretEntity {
  value: string;
  key_context: SecretContext;
  version_check?: string;
}

export interface UpdateSecretOptions {
  id: string;
  value: string;
  context: SecretContext;
  versionCheck?: string;
}
