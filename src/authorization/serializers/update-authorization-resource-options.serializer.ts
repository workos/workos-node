import {
  UpdateAuthorizationResourceOptions,
  SerializedUpdateAuthorizationResourceOptions,
} from '../interfaces/update-authorization-resource-options.interface';

/**
 * Serializes update resource options from SDK format to API request format.
 * Only includes fields that are explicitly provided (including null for clearing).
 */
export const serializeUpdateAuthorizationResourceOptions = (
  options: UpdateAuthorizationResourceOptions,
): SerializedUpdateAuthorizationResourceOptions => {
  const serialized: SerializedUpdateAuthorizationResourceOptions = {};

  if (options.name !== undefined) {
    serialized.name = options.name;
  }

  if (options.description !== undefined) {
    serialized.description = options.description;
  }

  return serialized;
};
