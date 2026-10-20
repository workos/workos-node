import {
  ListWaitlistEntriesOptions,
  SerializedListWaitlistEntriesOptions,
} from '../interfaces/list-waitlist-entries-options.interface';

export const serializeListWaitlistEntriesOptions = (
  options: ListWaitlistEntriesOptions,
): SerializedListWaitlistEntriesOptions => ({
  state: options.state,
  email: options.email,
  limit: options.limit,
  before: options.before,
  after: options.after,
  order: options.order,
});
