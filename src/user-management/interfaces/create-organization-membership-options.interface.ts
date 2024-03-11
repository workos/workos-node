import { RoleResponse } from "./role.interface";

export interface CreateOrganizationMembershipOptions {
  organizationId: string;
  userId: string;
  roleSlug: string;
}

export interface SerializedCreateOrganizationMembershipOptions {
  organization_id: string;
  user_id: string;
  role: RoleResponse;
}
