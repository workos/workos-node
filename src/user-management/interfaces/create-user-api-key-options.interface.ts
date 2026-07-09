import { PostOptions } from '../../common/interfaces';

export interface CreateUserApiKeyOptions {
  name: string;
  organizationId: string;
  permissions?: string[];
  expiresAt?: Date;
}

export interface SerializedCreateUserApiKeyOptions {
  name: string;
  organization_id: string;
  permissions?: string[];
  expires_at?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CreateUserApiKeyRequestOptions extends Pick<
  PostOptions,
  'idempotencyKey'
> {}
