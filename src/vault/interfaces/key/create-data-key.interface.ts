import { SecretContext } from '../secret.interface';

export interface CreateDataKeyOptions {
  context: SecretContext;
}

export interface CreateDataKeyResponse {
  context: SecretContext;
  data_key: string;
  encryption_keys: string;
  id: string;
}
