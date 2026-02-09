import {
  UpdateAuthorizationResourceOptions,
  SerializedUpdateAuthorizationResourceOptions,
} from '../interfaces/authorization-resource.interface';

/**
 * Serializes UpdateAuthorizationResourceOptions for the API request.
 * Only includes fields that are provided (name and/or description).
 * resourceId is excluded as it's used in the URL path.
 */
export const serializeUpdateResourceOptions = (
  options: UpdateAuthorizationResourceOptions,
): SerializedUpdateAuthorizationResourceOptions => ({
  name: options.name,
  description: options.description,
});
