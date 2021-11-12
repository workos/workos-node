import { Group } from './group.interface';

export type DefaultCustomAttributes = Record<string, unknown>;

export interface User<
  TCustomAttributes extends object = DefaultCustomAttributes,
> {
  id: string;
  directory_id: string;
  raw_attributes: any;
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
  state: 'active' | 'inactive' | 'suspended';
}

export interface UserWithGroups<
  TCustomAttributes extends object = DefaultCustomAttributes,
> extends User<TCustomAttributes> {
  groups: Group[];
}
