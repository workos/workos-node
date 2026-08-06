import { PaginationOptions } from '../../common/interfaces';
import { WaitlistUserState } from './waitlist-user.interface';

export interface ListWaitlistUsersOptions extends PaginationOptions {
  /** Filter waitlist users by their state. */
  state?: WaitlistUserState;
  /** Filter waitlist users by their exact email address. */
  email?: string;
}

export interface SerializedListWaitlistUsersOptions extends PaginationOptions {
  state?: WaitlistUserState;
  email?: string;
}
