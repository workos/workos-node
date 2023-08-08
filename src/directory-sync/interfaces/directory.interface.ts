export type DirectoryType =
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

export type EventDirectoryState =
  | 'active'
  | 'validating'
  | 'invalid_credentials'
  | 'inactive'
  | 'deleting';

interface EventDirectoryDomain {
  object: 'organization_domain';
  id: string;
  domain: string;
}

export interface EventDirectory {
  object: 'directory';
  id: string;
  externalKey: string;
  type: DirectoryType;
  state: EventDirectoryState;
  name: string;
  organizationId?: string;
  domains: EventDirectoryDomain[];
  createdAt: string;
  updatedAt: string;
}

export interface EventDirectoryResponse {
  object: 'directory';
  id: string;
  external_key: string;
  type: DirectoryType;
  state: EventDirectoryState;
  name: string;
  organization_id?: string;
  domains: EventDirectoryDomain[];
  created_at: string;
  updated_at: string;
}
