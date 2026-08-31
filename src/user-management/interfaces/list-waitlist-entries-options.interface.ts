import { PaginationOptions } from '../../common/interfaces';
import { WaitlistEntryState } from './waitlist-entry.interface';

export interface ListWaitlistEntriesOptions extends PaginationOptions {
  /** Filter entries by state. */
  state?: WaitlistEntryState;
  /** Filter entries by email address. */
  email?: string;
}

export interface SerializedListWaitlistEntriesOptions extends PaginationOptions {
  state?: WaitlistEntryState;
  email?: string;
}
