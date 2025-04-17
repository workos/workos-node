import { Profile, ProfileResponse } from './profile.interface';

export interface ProfileAndToken<
  CustomAttributesType extends Record<string, unknown>,
> {
  accessToken: string;
  profile: Profile<CustomAttributesType>;
}

export interface ProfileAndTokenResponse<
  CustomAttributesType extends Record<string, unknown>,
> {
  access_token: string;
  profile: ProfileResponse<CustomAttributesType>;
}
