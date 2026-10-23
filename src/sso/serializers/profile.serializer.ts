import { UnknownRecord } from '../../common/interfaces/unknown-record.interface';
import { Profile, ProfileResponse } from '../interfaces';

export const deserializeProfile = <CustomAttributesType extends UnknownRecord>(
  profile: ProfileResponse<CustomAttributesType>,
): Profile<CustomAttributesType> => ({
  object: profile.object,
  id: profile.id,
  idpId: profile.idp_id,
  organizationId: profile.organization_id ?? null,
  connectionId: profile.connection_id,
  connectionType: profile.connection_type,
  email: profile.email,
  name: profile.name ?? null,
  firstName: profile.first_name ?? null,
  lastName: profile.last_name ?? null,
  ...(profile.role !== undefined && { role: profile.role }),
  ...(profile.roles !== undefined && { roles: profile.roles }),
  ...(profile.groups !== undefined && { groups: profile.groups }),
  ...(profile.custom_attributes !== undefined && {
    customAttributes: profile.custom_attributes,
  }),
  rawAttributes: profile.raw_attributes,
});
