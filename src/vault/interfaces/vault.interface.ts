export interface SecretContext {
  [key: string]: any;
}

export interface SecretMetadata {
  context: SecretContext;
  environmentId: string;
  id: string;
  keyId: string;
  updatedAt: Date;
  versionId: string;
}

export interface VaultSecret {
  id: string;
  metadata: SecretMetadata;
  name: string;
  value: string;
}

export interface SecretVersion {
  createdAt: Date;
  currentVersion: boolean;
  id: string;
}

export interface SecretListMetadata {
  after: string;
  before: string;
}

export interface SecretList {
  secrets: string[];
  metadata: SecretListMetadata;
}
