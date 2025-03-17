import { PaginationOptions } from '../../index.worker';

export interface SecretContext {
  [key: string]: any;
}

export interface SecretDigest {
  id: string;
  name: string;
  updatedAt: Date;
}

export interface SecretUpdateBy {
  id: string;
  name: string;
}

export interface SecretMetadata {
  context: SecretContext;
  environmentId: string;
  id: string;
  keyId: string;
  updatedAt: Date;
  updatedBy: SecretUpdateBy;
  versionId: string;
}

export interface VaultSecret {
  id: string;
  metadata: SecretMetadata;
  name: string;
  value?: string;
}

export interface SecretVersion {
  createdAt: Date;
  currentVersion: boolean;
  id: string;
}

export interface SecretList {
  secrets: SecretDigest[];
  pagination: PaginationOptions;
}
