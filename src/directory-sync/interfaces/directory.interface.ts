export type DirectoryType =
  | 'azure scim v2.0'
  | 'bamboohr'
  | 'breathe hr'
  | 'cezanne hr'
  | 'cyberark scim v2.0'
  | 'fourth hr'
  | 'gsuite directory'
  | 'generic scim v2.0'
  | 'hibob'
  | 'jump cloud scim v2.0'
  | 'okta scim v2.0'
  | 'onelogin scim v2.0'
  | 'people hr'
  | 'personio'
  | 'pingfederate scim v2.0'
  | 'rippling scim v2.0'
  | 'sftp'
  | 'sftp workday'
  | 'workday';

export type DirectoryState =
  | 'active'
  | 'deleting'
  | 'inactive'
  | 'invalid_credentials'
  | 'validating';

export type DirectoryStateResponse =
  | 'deleting'
  | 'invalid_credentials'
  | 'linked'
  | 'unlinked'
  | 'validating';

export interface Directory {
  /** Distinguishes the Directory object. */
  object: 'directory';
  /** Unique identifier for the Directory. */
  id: string;
  /** The URL associated with an Enterprise Client. */
  domain: string;
  /** External Key for the Directory. */
  externalKey: string;
  /** The name of the directory. */
  name: string;
  /** The unique identifier for the Organization in which the directory resides. */
  organizationId?: string;
  /** Describes whether the Directory has been successfully connected to an external provider. */
  state: DirectoryState;
  /** The type of external Directory Provider integrated with. */
  type: DirectoryType;
  /** An ISO 8601 timestamp. */
  createdAt: string;
  /** An ISO 8601 timestamp. */
  updatedAt: string;
}

export interface DirectoryResponse {
  object: 'directory';
  id: string;
  domain: string;
  external_key: string;
  name: string;
  organization_id?: string;
  state: DirectoryStateResponse;
  type: DirectoryType;
  created_at: string;
  updated_at: string;
}
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
  state: DirectoryState;
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
  state: DirectoryState;
  name: string;
  organization_id?: string;
  domains: EventDirectoryDomain[];
  created_at: string;
  updated_at: string;
}
