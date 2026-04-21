import { Group, GroupResponse } from '../interfaces';

export const deserializeGroup = (group: GroupResponse): Group => ({
  object: group.object,
  id: group.id,
  organizationId: group.organization_id,
  name: group.name,
  description: group.description,
  createdAt: group.created_at,
  updatedAt: group.updated_at,
});
