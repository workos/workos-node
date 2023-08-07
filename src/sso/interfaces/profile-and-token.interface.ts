import { Profile, ProfileResponse } from './profile.interface';

export interface ProfileAndToken {
  accessToken: string;
  profile: Profile;
}

export interface ProfileAndTokenResponse {
  access_token: string;
  profile: ProfileResponse;
}
