import { UnknownRecord } from '../../common/interfaces/unknown-record.interface';
import { deserializeOauthTokens } from '../../user-management/serializers/oauth-tokens.serializer';
import { ProfileAndToken, ProfileAndTokenResponse } from '../interfaces';
import { deserializeProfile } from './profile.serializer';

export const deserializeProfileAndToken = <
  CustomAttributesType extends UnknownRecord,
>(
  profileAndToken: ProfileAndTokenResponse<CustomAttributesType>,
): ProfileAndToken<CustomAttributesType> => ({
  accessToken: profileAndToken.access_token,
  profile: deserializeProfile(profileAndToken.profile),
  oauthTokens: deserializeOauthTokens(profileAndToken.oauth_tokens),
});
