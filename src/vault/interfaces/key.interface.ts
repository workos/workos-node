import { SecretContext } from './secret.interface';

export interface DataKeyPair {
  context: SecretContext;
  dataKey: DataKey;
  encryptedKeys: string;
}

export interface DataKey {
  key: string;
  id: string;
}
