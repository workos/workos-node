export interface VaultSecretContext {
  [key: string]: any;
}

export interface VaultSecretMetadata {
  id: string;
  timestamp: Date;
  environmentId: string;
  keyId: string;
  updatedBy: string;
  context: VaultSecretContext;
}

export interface VaultSecret {
  id: string;
  metadata: VaultSecretMetadata;
  name: string;
  value: string;
}
