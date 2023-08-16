import {
  ListDirectoriesOptions,
  SerializedListDirectoriesOptions,
} from '../interfaces';

export const serializeListDirectoriesOptions = (
  options: ListDirectoriesOptions,
): SerializedListDirectoriesOptions => ({
  domain: options.domain,
  organization_id: options.organizationId,
  search: options.search,
  limit: options.limit,
  before: options.before,
  after: options.after,
  order: options.order,
});
