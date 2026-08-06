export interface Waitlist {
  /** Distinguishes the waitlist object. */
  object: 'waitlist';
  /** The unique ID of the waitlist. */
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
