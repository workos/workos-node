import { Group } from './group.interface';

export interface User {
  id: string;
  raw_attributes: any;
  first_name: string;
  emails: {
    type: string;
    value: string;
    primary: boolean;
  }[];
  username: string;
  last_name: string;
  state: 'active' | 'suspended';
}

export interface UserWithGroups extends User {
  groups: Group[];
}
