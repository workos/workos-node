export interface ApiKey {
  object: 'api_key';
  id: string;
  owner: {
    type: 'organization';
    id: string;
  };
  name: string;
  obfuscatedValue: string;
  lastUsedAt: string | null;
  permissions: string[];
  createdAt: string;
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
