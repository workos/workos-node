import { GroupMember, GroupMemberResponse } from '../interfaces';

export const deserializeGroupMember = (
  member: GroupMemberResponse,
): GroupMember => ({
  object: member.object,
  id: member.id,
  organizationId: member.organization_id,
  userId: member.user_id,
  status: member.status,
  directoryManaged: member.directory_managed ?? false,
  createdAt: member.created_at,
  updatedAt: member.updated_at,
  customAttributes: member.custom_attributes ?? {},
});
