export interface ItContact {
  /** Distinguishes the IT Contact object. */
  object: 'it_contact';
  /** Unique identifier of the IT Contact. */
  id: string;
  /** The email address of the IT Contact. */
  email: string;
  /** An ISO 8601 timestamp. */
  createdAt: string;
  /** An ISO 8601 timestamp. */
  updatedAt: string;
}

export interface ItContactResponse {
  object: 'it_contact';
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}
