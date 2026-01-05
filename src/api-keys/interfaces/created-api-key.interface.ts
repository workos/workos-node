export interface CreatedApiKey {
  object: 'api_key';
  id: string;
  owner: {
    type: 'organization';
    id: string;
  };
  name: string;
  obfuscatedValue: string;
  value: string;
  lastUsedAt: string | null;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SerializedCreatedApiKey {
  object: 'api_key';
  id: string;
  owner: {
    type: 'organization';
    id: string;
  };
  name: string;
  obfuscated_value: string;
  value: string;
  last_used_at: string | null;
  permissions: string[];
  created_at: string;
  updated_at: string;
}
