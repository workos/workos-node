import { ProfileAndToken, ProfileAndTokenResponse } from '../interfaces';
import { deserializeProfile } from './profile.serializer';

export const deserializeProfileAndToken = <
  CustomAttributesType extends Record<string, unknown>,
>(
  profileAndToken: ProfileAndTokenResponse<CustomAttributesType>,
): ProfileAndToken<CustomAttributesType> => ({
  accessToken: profileAndToken.access_token,
  profile: deserializeProfile(profileAndToken.profile),
});
