import { ListEventOptions, SerializedListEventOptions } from '../interfaces';

export const serializeListEventOptions = (
  options: ListEventOptions,
): SerializedListEventOptions => ({
  events: options.events,
  range_start: options.rangeStart,
  range_end: options.rangeEnd,
  limit: options.limit,
  after: options.after,
  before: options.before,
});
