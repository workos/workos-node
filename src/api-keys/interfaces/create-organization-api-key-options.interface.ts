import { PostOptions } from '../../common/interfaces';

export interface CreateOrganizationApiKeyOptions {
  organizationId: string;
  name: string;
  permissions?: string[];
  expiresAt?: Date;
}

export interface SerializedCreateOrganizationApiKeyOptions {
  name: string;
  permissions?: string[];
  expires_at?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CreateOrganizationApiKeyRequestOptions extends Pick<
  PostOptions,
  'idempotencyKey'
> {}
