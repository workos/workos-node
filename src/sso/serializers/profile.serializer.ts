import { UnknownRecord } from '../../common/interfaces/unknown-record.interface';
import { Profile, ProfileResponse } from '../interfaces';

export const deserializeProfile = <CustomAttributesType extends UnknownRecord>(
  profile: ProfileResponse<CustomAttributesType>,
): Profile<CustomAttributesType> => ({
  id: profile.id,
  idpId: profile.idp_id,
  ...(profile.organization_id !== undefined && {
    organizationId: profile.organization_id,
  }),
  connectionId: profile.connection_id,
  connectionType: profile.connection_type,
  email: profile.email,
  ...(profile.first_name !== undefined && { firstName: profile.first_name }),
  ...(profile.last_name !== undefined && { lastName: profile.last_name }),
  ...(profile.role !== undefined && { role: profile.role }),
  ...(profile.roles !== undefined && { roles: profile.roles }),
  ...(profile.groups !== undefined && { groups: profile.groups }),
  ...(profile.custom_attributes !== undefined && {
    customAttributes: profile.custom_attributes,
  }),
  ...(profile.raw_attributes !== undefined && {
    rawAttributes: profile.raw_attributes,
  }),
});
