import { ListEventOptions, SerializedListEventOptions } from '../interfaces';

export const serializeListEventOptions = (
  options: ListEventOptions,
): SerializedListEventOptions => ({
  events: options.events,
  organization_id: options.organizationId,
  range_start: options.rangeStart,
  range_end: options.rangeEnd,
  limit: options.limit,
  after: options.after,
});
