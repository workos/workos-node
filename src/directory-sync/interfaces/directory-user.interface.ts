import {
  DirectoryGroup,
  DirectoryGroupResponse,
} from './directory-group.interface';

export type DefaultCustomAttributes = Record<string, unknown>;

export interface DirectoryUser<
  TCustomAttributes extends object = DefaultCustomAttributes,
  TRawAttributes = any,
> {
  id: string;
  directoryId: string;
  organizationId: string | null;
  rawAttributes: TRawAttributes;
  customAttributes: TCustomAttributes;
  idpId: string;
  firstName: string;
  emails: {
    type: string;
    value: string;
    primary: boolean;
  }[];
  username: string;
  lastName: string;
  jobTitle: string | null;
  state: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface DirectoryUserResponse<
  TCustomAttributes extends object = DefaultCustomAttributes,
  TRawAttributes = any,
> {
  id: string;
  directory_id: string;
  organization_id: string | null;
  raw_attributes: TRawAttributes;
  custom_attributes: TCustomAttributes;
  idp_id: string;
  first_name: string;
  emails: {
    type: string;
    value: string;
    primary: boolean;
  }[];
  username: string;
  last_name: string;
  job_title: string | null;
  state: 'active' | 'inactive' | 'suspended';
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
