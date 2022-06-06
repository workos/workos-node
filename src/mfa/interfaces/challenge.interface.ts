export interface Challenge {
  object: 'authentication_challenge';
  id: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  code: string;
  authentication_factor_id: string;
}
