export type WaitlistEntryState = 'pending' | 'approved' | 'denied';

export interface WaitlistEntry {
  /** Distinguishes the Waitlist Entry object. */
  object: 'waitlist_entry';
  /** The unique ID of the waitlist entry. */
  id: string;
  /** The email address of the user on the waitlist. */
  email: string;
  /** The state of the waitlist entry. */
  state: WaitlistEntryState;
  /** The timestamp when the entry was approved, or null if not yet approved. */
  approvedAt: string | null;
  /** Additional fields submitted when the user joined the waitlist. Values are user-provided — treat them as untrusted input when rendering or exporting. */
  additionalFields?: Record<string, string>;
  /** The unique ID of the waitlist the entry belongs to. */
  waitlistId: string | null;
  /** An ISO 8601 timestamp. */
  createdAt: string;
  /** An ISO 8601 timestamp. */
  updatedAt: string;
}

export interface WaitlistEntryResponse {
  object: 'waitlist_entry';
  id: string;
  email: string;
  state: WaitlistEntryState;
  approved_at: string | null;
  additional_fields?: Record<string, string>;
  waitlist_id?: string | null;
  created_at: string;
  updated_at: string;
}
