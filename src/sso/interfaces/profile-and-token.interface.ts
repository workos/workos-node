import { UnknownRecord } from '../../common/interfaces/unknown-record.interface';
import { Profile, ProfileResponse } from './profile.interface';

export interface ProfileAndToken<CustomAttributesType extends UnknownRecord> {
  accessToken: string;
  profile: Profile<CustomAttributesType>;
}

export interface ProfileAndTokenResponse<
  CustomAttributesType extends UnknownRecord,
> {
  access_token: string;
  profile: ProfileResponse<CustomAttributesType>;
}
