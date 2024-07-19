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

export type AuthenticateWithSessionCookieFailureReason =
  | 'invalid_jwt'
  | 'invalid_session_cookie'
  | 'no_session_cookie_provided';

export type AuthenticateWithSessionCookieFailedResponse = {
  authenticated: false;
  reason: AuthenticateWithSessionCookieFailureReason;
};

export type AuthenticateWithSessionCookieSuccessResponse = {
  authenticated: true;
  sessionId: string;
  organizationId?: string;
  role?: string;
  permissions?: string[];
};
