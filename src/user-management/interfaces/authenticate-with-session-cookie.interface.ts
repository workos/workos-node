import { AuthenticationResponse } from './authentication-response.interface';
import { Impersonator } from './impersonator.interface';
import { User } from './user.interface';

export interface AuthenticateWithSessionCookieOptions {
  sessionData: string;
  cookiePassword?: string;
}

export interface AccessToken<TRole extends string = string, TPermission extends string = string> {
  sid: string;
  org_id?: string;
  role?: TRole;
  permissions?: TPermission[];
  entitlements?: string[];
}

export type SessionCookieData<
  TRole extends string = string,
  TPermission extends string = string
> = Omit<
  Pick<
    AuthenticationResponse,
    'accessToken' | 'impersonator' | 'organizationId' | 'refreshToken' | 'user'
  >,
  'accessToken'
> & {
  accessToken: AccessToken<TRole, TPermission>;
};

export enum AuthenticateWithSessionCookieFailureReason {
  INVALID_JWT = 'invalid_jwt',
  INVALID_SESSION_COOKIE = 'invalid_session_cookie',
  NO_SESSION_COOKIE_PROVIDED = 'no_session_cookie_provided',
}

export type AuthenticateWithSessionCookieFailedResponse = {
  authenticated: false;
  reason: AuthenticateWithSessionCookieFailureReason;
};

export type AuthenticateWithSessionCookieSuccessResponse<
  TRole extends string = string,
  TPermission extends string = string
> = {
  authenticated: true;
  sessionId: string;
  organizationId?: string;
  role?: TRole;
  permissions?: TPermission[];
  entitlements?: string[];
  user: User;
  impersonator?: Impersonator;
  accessToken: string;
};
