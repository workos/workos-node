import {
  CreateOrganizationMembershipOptions,
  SerializedCreateOrganizationMembershipOptions,
} from '../interfaces/create-organization-membership-options.interface';

export const serializeCreateOrganizationMembershipOptions = <
  TRole extends string = string,
>(
  options: CreateOrganizationMembershipOptions<TRole>,
): SerializedCreateOrganizationMembershipOptions<TRole> => ({
  organization_id: options.organizationId,
  user_id: options.userId,
  role_slug: options.roleSlug,
});
