import { PostOptions } from '../../common/interfaces';

export interface CreateOrganizationOptions {
  name: string;
}

export interface SerializedCreateOrganizationOptions {
  name: string;
}

export interface CreateOrganizationRequestOptions
  extends Pick<PostOptions, 'idempotencyKey'> {}
