import { PostOptions } from '../../common/interfaces';

export interface CreateOrganizationApiKeyOptions {
  organizationId: string;
  name: string;
  permissions?: string[];
}

export interface SerializedCreateOrganizationApiKeyOptions {
  name: string;
  permissions?: string[];
}

export interface CreateOrganizationApiKeyRequestOptions
  extends Pick<PostOptions, 'idempotencyKey'> {}
