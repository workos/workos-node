export interface Directory {
  object: 'directory';
  id: string;
  bearer_token?: string;
  domain: string;
  external_key: string;
  name: string;
  environment_id: string;
  state: 'unlinked' | 'linked';
  type: string;
}
