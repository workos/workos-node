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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CreateOrganizationApiKeyRequestOptions extends Pick<
  PostOptions,
  'idempotencyKey'
> {}
