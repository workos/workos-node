import {
  ListResourcesOptions,
  SerializedListResourcesOptions,
} from '../interfaces';

export const serializeListResourceOptions = (
  options: ListResourcesOptions,
): SerializedListResourcesOptions => ({
  resource_type: options.resourceType,
  search: options.search,
  limit: options.limit,
  before: options.before,
  after: options.after,
  order: options.order,
});
