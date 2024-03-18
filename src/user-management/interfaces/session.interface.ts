import { Impersonator } from './impersonator.interface';

export interface Session {
  object: 'session';
  id: string;
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
  organizationId?: string;
  impersonator?: Impersonator;
}

export interface SessionResponse {
  object: 'session';
  id: string;
  user_id: string;
  ip_address: string | null;
  user_agent: string | null;
  organization_id?: string;
  impersonator?: Impersonator;
}
