export interface UserApiKey {
  object: 'api_key';
  id: string;
  owner: {
    type: 'user';
    id: string;
    organizationId: string;
  };
  name: string;
  obfuscatedValue: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SerializedUserApiKey {
  object: 'api_key';
  id: string;
  owner: {
    type: 'user';
    id: string;
    organization_id: string;
  };
  name: string;
  obfuscated_value: string;
  last_used_at: string | null;
  expires_at: string | null;
  permissions: string[];
  created_at: string;
  updated_at: string;
}
