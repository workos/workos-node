import {
  ListDirectoriesOptions,
  SerializedListDirectoriesOptions,
} from '../interfaces';

export const serializeListDirectoriesOptions = (
  options: ListDirectoriesOptions,
): SerializedListDirectoriesOptions => ({
  organization_id: options.organizationId,
  search: options.search,
  limit: options.limit,
  before: options.before,
  after: options.after,
  order: options.order,
});
