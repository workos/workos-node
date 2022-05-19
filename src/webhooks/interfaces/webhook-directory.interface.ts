export type WebhookDirectoryState =
  | 'active'
  | 'validating'
  | 'invalid_credentials'
  | 'inactive'
  | 'deleting';

interface WebhookDirectoryDomain {
  object: 'organization_domain';
  id: string;
  domain: string;
}

export interface WebhookDirectory {
  object: 'directory';
  id: string;
  external_key: string;
  type: string;
  state: WebhookDirectoryState;
  name: string;
  organization_id?: string;
  domains: WebhookDirectoryDomain[];
  created_at: string;
  updated_at: string;
}
