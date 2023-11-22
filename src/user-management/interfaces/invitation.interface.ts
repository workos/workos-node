export interface Invitation {
  object: 'invitation';
  id: string;
  email: string;
  state: 'pending' | 'accepted' | 'expired' | 'revoked';
  acceptedAt?: string;
  revokedAt?: string;
  expiresAt: string;
  organizationId?: string;
  token: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvitationResponse {
  object: 'invitation';
  id: string;
  email: string;
  state: 'pending' | 'accepted' | 'expired' | 'revoked';
  accepted_at?: string;
  revoked_at?: string;
  expires_at: string;
  organization_id?: string;
  token: string;
  created_at: string;
  updated_at: string;
}
