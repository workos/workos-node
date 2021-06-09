export interface Directory {
  object: 'directory';
  id: string;
  domain: string;
  external_key: string;
  name: string;
  environment_id: string;
  organization_id: string;
  state: 'unlinked' | 'linked' | 'invalid_credentials';
  type: string;
}
