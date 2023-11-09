import { PostOptions } from '../../common/interfaces';

export interface CreateOrganizationOptions {
  name: string;
  allowProfilesOutsideOrganization?: boolean;
}

export interface SerializedCreateOrganizationOptions {
  name: string;
  allow_profiles_outside_organization?: boolean;
}

export interface CreateOrganizationRequestOptions
  extends Pick<PostOptions, 'idempotencyKey'> {}
