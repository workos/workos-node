import { ProfileAndToken, ProfileAndTokenResponse } from '../interfaces';
import { deserializeProfile } from './profile.serializer';

export const deserializeProfileAndToken = (
  profileAndToken: ProfileAndTokenResponse,
): ProfileAndToken => ({
  accessToken: profileAndToken.access_token,
  profile: deserializeProfile(profileAndToken.profile),
});
