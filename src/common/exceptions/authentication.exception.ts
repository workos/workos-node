import {
  GenericServerException,
  WorkOSErrorData,
} from './generic-server.exception';

export type AuthenticationErrorCode =
  | 'email_verification_required'
  | 'organization_selection_required'
  | 'mfa_enrollment'
  | 'mfa_challenge'
  | 'mfa_verification'
  | 'sso_required';

export interface AuthenticationErrorData extends WorkOSErrorData {
  code: AuthenticationErrorCode;
  pending_authentication_token: string;
  user?: Record<string, unknown>;
  organizations?: Array<{ id: string; name: string }>;
}

const AUTHENTICATION_ERROR_CODES: ReadonlySet<string> = new Set<string>([
  'email_verification_required',
  'organization_selection_required',
  'mfa_enrollment',
  'mfa_challenge',
  'mfa_verification',
  'sso_required',
]);

export function isAuthenticationErrorData(
  data: WorkOSErrorData,
): data is AuthenticationErrorData {
  return (
    typeof data.code === 'string' &&
    AUTHENTICATION_ERROR_CODES.has(data.code) &&
    typeof data.pending_authentication_token === 'string'
  );
}

export class AuthenticationException extends GenericServerException {
  readonly name = 'AuthenticationException';
  readonly code: AuthenticationErrorCode;
  readonly pendingAuthenticationToken: string;

  constructor(
    status: number,
    readonly rawData: AuthenticationErrorData,
    requestID: string,
  ) {
    super(status, rawData.message, rawData, requestID);
    this.code = rawData.code;
    this.pendingAuthenticationToken = rawData.pending_authentication_token;
  }
}
