import { DirectoryGroup } from './directory-group.interface';

export type DefaultCustomAttributes = Record<string, unknown>;

export interface DirectoryUser<
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
}

export interface DirectoryUserWithGroups<
  TCustomAttributes extends object = DefaultCustomAttributes,
> extends DirectoryUser<TCustomAttributes> {
  groups: DirectoryGroup[];
}
