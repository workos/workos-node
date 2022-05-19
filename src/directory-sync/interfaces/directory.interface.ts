export interface Directory {
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
