import {
  CreateOrganizationMembershipOptions,
  SerializedCreateOrganizationMembershipOptions,
} from '../interfaces/create-organization-membership-options.interface';

export const serializeCreateOrganizationMembershipOptions = (
  options: CreateOrganizationMembershipOptions,
): SerializedCreateOrganizationMembershipOptions => ({
  organization_id: options.organizationId,
  user_id: options.userId,
  role_slug: options.roleSlug,
  role_slugs: options.roleSlugs,
});
