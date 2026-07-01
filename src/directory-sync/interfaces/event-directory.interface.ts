import type { DirectoryType } from './directory-type.interface';
import type { DirectoryState } from './directory-state.interface';

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
