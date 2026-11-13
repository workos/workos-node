export interface MagicAuth {
  /** Distinguishes the Magic Auth object. */
  object: 'magic_auth';
  /** The unique ID of the Magic Auth code. */
  id: string;
  /** The unique ID of the user. */
  userId: string;
  /** The email address of the user. */
  email: string;
  /** The timestamp when the Magic Auth code expires. */
  expiresAt: Date;
  /** The code used to verify the Magic Auth code. */
  code: string;
  /** An ISO 8601 timestamp. */
  createdAt: Date;
  /** An ISO 8601 timestamp. */
  updatedAt: Date;
}

export interface MagicAuthEvent {
  object: 'magic_auth';
  id: string;
  userId: string;
  email: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MagicAuthResponse {
  object: 'magic_auth';
  id: string;
  user_id: string;
  email: string;
  expires_at: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMagicAuthResponse extends MagicAuth {
  radarAuthAttemptId?: string;
}

export interface CreateMagicAuthResponseResponse extends MagicAuthResponse {
  radar_auth_attempt_id?: string;
}

export interface MagicAuthEventResponse {
  object: 'magic_auth';
  id: string;
  user_id: string;
  email: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}
