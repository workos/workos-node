import { RoleListResponse } from '../interfaces/role-list.interface';
import { RoleList } from '../interfaces/role.interface';
import { deserializeRole } from './role.serializer';

export const deserializeRoleList = (list: RoleListResponse): RoleList => ({
  object: list.object,
  data: list.data.map(deserializeRole),
});
