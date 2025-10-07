import { RoleResponse } from '../../roles/interfaces/';
import {
  DirectoryGroup,
  DirectoryGroupResponse,
} from './directory-group.interface';

export type DefaultCustomAttributes = Record<string, unknown>;

export interface DirectoryUser<
  TCustomAttributes extends object = DefaultCustomAttributes,
  TRawAttributes = any,
> {
  object: 'directory_user';
  id: string;
  directoryId: string;
  organizationId: string | null;
  rawAttributes: TRawAttributes;
  customAttributes: TCustomAttributes;
  idpId: string;
  firstName: string | null;
  email: string | null;
  lastName: string | null;
  state: 'active' | 'inactive';
  role?: RoleResponse;
  roles?: RoleResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface DirectoryUserResponse<
  TCustomAttributes extends object = DefaultCustomAttributes,
  TRawAttributes = any,
> {
  object: 'directory_user';
  id: string;
  directory_id: string;
  organization_id: string | null;
  raw_attributes: TRawAttributes;
  custom_attributes: TCustomAttributes;
  idp_id: string;
  first_name: string | null;
  email: string | null;
  last_name: string | null;
  state: 'active' | 'inactive';
  role?: RoleResponse;
  roles?: RoleResponse[];
  created_at: string;
  updated_at: string;
}

export interface DirectoryUserWithGroups<
  TCustomAttributes extends object = DefaultCustomAttributes,
> extends DirectoryUser<TCustomAttributes> {
  groups: DirectoryGroup[];
}

export interface DirectoryUserWithGroupsResponse<
  TCustomAttributes extends object = DefaultCustomAttributes,
> extends DirectoryUserResponse<TCustomAttributes> {
  groups: DirectoryGroupResponse[];
}
