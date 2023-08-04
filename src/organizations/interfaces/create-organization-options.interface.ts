import { PostOptions } from '../../common/interfaces';

export interface CreateOrganizationOptions {
  name: string;
  allowProfilesOutsideOrganization?: boolean;
  domains?: string[];
}

export interface SerializedCreateOrganizationOptions {
  name: string;
  allow_profiles_outside_organization?: boolean;
  domains?: string[];
}

export interface CreateOrganizationRequestOptions
  extends Pick<PostOptions, 'idempotencyKey'> {}
