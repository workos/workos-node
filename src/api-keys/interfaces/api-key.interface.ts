/** The API Key object if the value is valid, or `null` if invalid. */
export interface ApiKey {
  /** Distinguishes the API Key object. */
  object: 'api_key';
  /** Unique identifier of the API Key. */
  id: string;
  /** The entity that owns the API Key. */
  owner: {
    type: 'organization';
    id: string;
  };
  /** A descriptive name for the API Key. */
  name: string;
  /** An obfuscated representation of the API Key value. */
  obfuscatedValue: string;
  /** Timestamp of when the API Key was last used. */
  lastUsedAt: string | null;
  /** The permission slugs assigned to the API Key. */
  permissions: string[];
  /** An ISO 8601 timestamp. */
  createdAt: string;
  /** An ISO 8601 timestamp. */
  updatedAt: string;
}

export interface SerializedApiKey {
  object: 'api_key';
  id: string;
  owner: {
    type: 'organization';
    id: string;
  };
  name: string;
  obfuscated_value: string;
  last_used_at: string | null;
  permissions: string[];
  created_at: string;
  updated_at: string;
}
