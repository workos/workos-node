export interface Directory {
  object: 'directory_endpoint';
  id: string;
  bearer_token?: string;
  domain: string;
  external_key: string;
  name: string;
  project_id: string;
  state: 'unlinked' | 'linked';
  type: string;
}
