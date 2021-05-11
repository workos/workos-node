import { Profile } from './profile.interface';

export interface ProfileAndToken {
  access_token: string;
  profile: Profile;
}
