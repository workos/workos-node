import { ListObjectOptions, SerializedListObjectOptions } from "../interfaces";

export const serializeListObjectOptions = (
  options: ListObjectOptions,
): SerializedListObjectOptions => ({
  object_type: options.objectType,
  search: options.search,
  limit: options.limit,
  before: options.before,
  after: options.after,
  order: options.order,
});
