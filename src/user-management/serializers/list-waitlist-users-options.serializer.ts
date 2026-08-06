import {
  ListWaitlistUsersOptions,
  SerializedListWaitlistUsersOptions,
} from '../interfaces/list-waitlist-users-options.interface';

export const serializeListWaitlistUsersOptions = (
  options: ListWaitlistUsersOptions,
): SerializedListWaitlistUsersOptions => ({
  state: options.state,
  email: options.email,
  limit: options.limit,
  before: options.before,
  after: options.after,
  order: options.order,
});
