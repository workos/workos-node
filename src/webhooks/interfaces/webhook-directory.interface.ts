export type WebhookDirectoryType =
  | 'okta scim v1.1'
  | 'okta scim v2.0'
  | 'azure scim v2.0'
  | 'bamboohr'
  | 'breathe hr'
  | 'cyberark scim v2.0'
  | 'fourth hr'
  | 'gsuite directory'
  | 'generic scim v1.1'
  | 'generic scim v2.0'
  | 'gusto'
  | 'hibob'
  | 'jump cloud scim v2.0'
  | 'onelogin scim v2.0'
  | 'people hr'
  | 'pingfederate scim v2.0'
  | 'rippling'
  | 's3'
  | 'workday';

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
  externalKey: string;
  type: WebhookDirectoryType;
  state: WebhookDirectoryState;
  name: string;
  organizationId?: string;
  domains: WebhookDirectoryDomain[];
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDirectoryResponse {
  object: 'directory';
  id: string;
  external_key: string;
  type: WebhookDirectoryType;
  state: WebhookDirectoryState;
  name: string;
  organization_id?: string;
  domains: WebhookDirectoryDomain[];
  created_at: string;
  updated_at: string;
}
