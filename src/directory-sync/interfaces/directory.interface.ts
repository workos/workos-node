export interface Directory {
  object: 'directory';
  id: string;
  domain: string;
  externalKey: string;
  name: string;
  organizationId?: string;
  state: 'unlinked' | 'linked' | 'invalid_credentials';
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface DirectoryResponse {
  object: 'directory';
  id: string;
  domain: string;
  external_key: string;
  name: string;
  organization_id?: string;
  state: 'unlinked' | 'linked' | 'invalid_credentials';
  type: string;
  created_at: string;
  updated_at: string;
}
