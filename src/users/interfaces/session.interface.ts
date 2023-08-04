export interface Session {
  id: string;
  createdAt: string;
  expiresAt: string;
  token: string;
}

export interface SessionResponse {
  id: string;
  created_at: string;
  expires_at: string;
  token: string;
}
