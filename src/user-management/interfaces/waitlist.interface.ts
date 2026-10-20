export interface Waitlist {
  /** Distinguishes the Waitlist object. */
  object: 'waitlist';
  /** The unique ID of the Waitlist. */
  id: string;
  /** An ISO 8601 timestamp. */
  createdAt: string;
  /** An ISO 8601 timestamp. */
  updatedAt: string;
}

export interface WaitlistResponse {
  object: 'waitlist';
  id: string;
  created_at: string;
  updated_at: string;
}
