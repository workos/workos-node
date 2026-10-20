import {
  ListUserApiKeysOptions,
  SerializedListUserApiKeysOptions,
} from '../interfaces/list-user-api-keys-options.interface';

export function serializeListUserApiKeysOptions(
  options: ListUserApiKeysOptions,
): SerializedListUserApiKeysOptions {
  return {
    limit: options.limit,
    before: options.before,
    after: options.after,
    order: options.order,
    organization_id: options.organizationId,
  };
}
