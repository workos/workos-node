import { UnknownRecord } from '../../common/interfaces/unknown-record.interface';
import { ProfileAndToken, ProfileAndTokenResponse } from '../interfaces';
import { deserializeProfile } from './profile.serializer';

export const deserializeProfileAndToken = <
  CustomAttributesType extends UnknownRecord,
>(
  profileAndToken: ProfileAndTokenResponse<CustomAttributesType>,
): ProfileAndToken<CustomAttributesType> => ({
  accessToken: profileAndToken.access_token,
  profile: deserializeProfile(profileAndToken.profile),
});
