import { OrganizationRoleResponse } from './role.interface';

export type { RoleList } from './role.interface';

export interface RoleListResponse {
  object: 'list';
  data: OrganizationRoleResponse[];
}
