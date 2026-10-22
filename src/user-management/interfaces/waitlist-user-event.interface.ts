import { WaitlistEntryState } from './waitlist-entry.interface';

/** The waitlist entry as delivered on `waitlist_user.*` events. */
export interface WaitlistUserEventData {
  object: 'waitlist_user';
  id: string;
  email: string;
  state: WaitlistEntryState;
  approvedAt: Date | null;
  additionalFields?: Record<string, string>;
  waitlistId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WaitlistUserEventResponseData {
  object: 'waitlist_user';
  id: string;
  email: string;
  state: WaitlistEntryState;
  approved_at: string | null;
  additional_fields?: Record<string, string>;
  waitlist_id?: string | null;
  created_at: string;
  updated_at: string;
}
