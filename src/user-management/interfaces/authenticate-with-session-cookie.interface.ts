import { User } from './user.interface';

export interface AccessToken {
  sid: string;
  org_id?: string;
  role?: string;
  permissions?: string[];
}

export type SessionCookieData = {
  user: User;
  accessToken: string;
  refreshToken: string;
  impersonator: string;
};

export type AuthenticateWithSessionCookieFailedResponse = {
  authenticated: false;
};

export type AuthenticateWithSessionCookieSuccessResponse = {
  authenticated: true;
  sessionId: string;
  organizationId?: string;
  role?: string;
  permissions?: string[];
};
