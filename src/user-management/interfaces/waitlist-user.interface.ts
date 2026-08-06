export type WaitlistUserState = 'pending' | 'approved' | 'denied';

export interface WaitlistUser {
  /** Distinguishes the waitlist user object. */
  object: 'waitlist_user';
  /** The unique ID of the waitlist user. */
  id: string;
  /** The email address of the waitlist user. */
  email: string;
  /** The state of the waitlist user. */
  state: WaitlistUserState;
  /** The timestamp when the waitlist user was approved, or null if not yet approved. */
  approvedAt: string | null;
  /** The ID of the waitlist the user joined, or null for legacy waitlist users on the default waitlist. */
  waitlistId: string | null;
  /** An ISO 8601 timestamp. */
  createdAt: string;
  /** An ISO 8601 timestamp. */
  updatedAt: string;
}

export interface WaitlistUserResponse {
  object: 'waitlist_user';
  id: string;
  email: string;
  state: WaitlistUserState;
  approved_at: string | null;
  waitlist_id?: string | null;
  created_at: string;
  updated_at: string;
}
