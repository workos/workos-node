import {
  UpdateOrganizationMembershipOptions,
  SerializedUpdateOrganizationMembershipOptions,
} from '../interfaces/update-organization-membership-options.interface';

export const serializeUpdateOrganizationMembershipOptions = <
  TRole extends string = string,
>(
  options: UpdateOrganizationMembershipOptions<TRole>,
): SerializedUpdateOrganizationMembershipOptions<TRole> => ({
  role_slug: options.roleSlug,
});
