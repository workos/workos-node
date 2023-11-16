export interface Invitation {
  object: 'invitation';
  id: string;
  email: string;
  state: 'pending' | 'accepted' | 'expired' | 'revoked';
  acceptedAt: string | null;
  revokedAt: string | null;
  expiresAt: string;
  organizationId: string | null;
  token: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvitationResponse {
  object: 'invitation';
  id: string;
  email: string;
  state: 'pending' | 'accepted' | 'expired' | 'revoked';
  accepted_at: string | null;
  revoked_at: string | null;
  expires_at: string;
  organization_id: string | null;
  token: string;
  created_at: string;
  updated_at: string;
}
