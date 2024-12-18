import { RoleResponse } from '../../roles/interfaces/';
import {
  DirectoryGroup,
  DirectoryGroupResponse,
} from './directory-group.interface';

export type DefaultCustomAttributes = Record<string, unknown>;

export interface DirectoryUser<
  TCustomAttributes extends object = DefaultCustomAttributes,
  TRawAttributes = any,
  TRole extends string = string,
> {
  object: 'directory_user';
  id: string;
  directoryId: string;
  organizationId: string | null;
  rawAttributes: TRawAttributes;
  customAttributes: TCustomAttributes;
  idpId: string;
  firstName: string | null;
  emails: {
    type?: string;
    value?: string;
    primary?: boolean;
  }[];
  username: string | null;
  lastName: string | null;
  jobTitle: string | null;
  state: 'active' | 'inactive';
  role?: RoleResponse<TRole>;
  createdAt: string;
  updatedAt: string;
}

export interface DirectoryUserResponse<
  TCustomAttributes extends object = DefaultCustomAttributes,
  TRawAttributes = any,
  TRole extends string = string,
> {
  object: 'directory_user';
  id: string;
  directory_id: string;
  organization_id: string | null;
  raw_attributes: TRawAttributes;
  custom_attributes: TCustomAttributes;
  idp_id: string;
  first_name: string | null;
  emails: {
    type?: string;
    value?: string;
    primary?: boolean;
  }[];
  username: string | null;
  last_name: string | null;
  job_title: string | null;
  state: 'active' | 'inactive';
  role?: RoleResponse<TRole>;
  created_at: string;
  updated_at: string;
}

export interface DirectoryUserWithGroups<
  TCustomAttributes extends object = DefaultCustomAttributes,
  TRawAttributes = any, 
  TRole extends string = string,
> extends DirectoryUser<TCustomAttributes, TRawAttributes, TRole> {
  groups: DirectoryGroup[];
}

export interface DirectoryUserWithGroupsResponse<
  TCustomAttributes extends object = DefaultCustomAttributes,
  TRawAttributes = any,
  TRole extends string = string,
> extends DirectoryUserResponse<TCustomAttributes, TRawAttributes, TRole> {
  groups: DirectoryGroupResponse[];
}
