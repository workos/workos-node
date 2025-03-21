export interface UpdateSecretEntity {
  value: string;
  version_check?: string;
}

export interface UpdateSecretOptions {
  id: string;
  value: string;
  versionCheck?: string;
}
