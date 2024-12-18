import { Profile, ProfileResponse } from '../interfaces';

export const deserializeProfile = <TRole extends string = string>(
  profile: ProfileResponse<TRole>,
): Profile<TRole> => ({
  id: profile.id,
  idpId: profile.idp_id,
  organizationId: profile.organization_id,
  connectionId: profile.connection_id,
  connectionType: profile.connection_type,
  email: profile.email,
  firstName: profile.first_name,
  lastName: profile.last_name,
  role: profile.role,
  groups: profile.groups,
  rawAttributes: profile.raw_attributes,
});
