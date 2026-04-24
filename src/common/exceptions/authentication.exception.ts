import {
  GenericServerException,
  WorkOSErrorData,
} from './generic-server.exception';
import type { UserResponse } from '../../user-management/interfaces/user.interface';

export type AuthenticationErrorCode =
  | 'email_verification_required'
  | 'organization_selection_required'
  | 'mfa_enrollment'
  | 'mfa_challenge'
  | 'mfa_verification'
  | 'sso_required';

interface BaseAuthenticationErrorData extends WorkOSErrorData {
  pending_authentication_token?: string;
  user?: UserResponse;
  organizations?: Array<{ id: string; name: string }>;
  connection_ids?: string[];
}

export type AuthenticationErrorData =
  | (BaseAuthenticationErrorData & {
      code: Exclude<AuthenticationErrorCode, 'sso_required'>;
    })
  | (BaseAuthenticationErrorData & {
      error: 'sso_required';
      error_description: string;
    });

const AUTHENTICATION_ERROR_CODES: ReadonlySet<string> = new Set<string>([
  'email_verification_required',
  'organization_selection_required',
  'mfa_enrollment',
  'mfa_challenge',
  'mfa_verification',
  'sso_required',
]);

function parseAuthenticationErrorCode(
  value: unknown,
): AuthenticationErrorCode | undefined {
  if (typeof value !== 'string') {
    return;
  }

  if (!AUTHENTICATION_ERROR_CODES.has(value)) {
    return;
  }

  return value as AuthenticationErrorCode;
}

function getAuthenticationErrorCode(
  data: AuthenticationErrorData,
): AuthenticationErrorCode;
function getAuthenticationErrorCode(
  data: WorkOSErrorData,
): AuthenticationErrorCode | undefined;
function getAuthenticationErrorCode(
  data: WorkOSErrorData,
): AuthenticationErrorCode | undefined {
  return (
    parseAuthenticationErrorCode(data.code) ??
    parseAuthenticationErrorCode(data.error)
  );
}

export function isAuthenticationErrorData(
  data: WorkOSErrorData,
): data is AuthenticationErrorData {
  return getAuthenticationErrorCode(data) !== undefined;
}

export class AuthenticationException extends GenericServerException {
  readonly name = 'AuthenticationException';
  override readonly code: AuthenticationErrorCode;
  readonly pendingAuthenticationToken: string | undefined;

  constructor(
    status: number,
    readonly rawData: AuthenticationErrorData,
    requestID: string,
  ) {
    const code = getAuthenticationErrorCode(rawData);

    super(
      status,
      rawData.message ?? (rawData.error_description as string | undefined),
      rawData,
      requestID,
    );
    this.code = code;
    this.pendingAuthenticationToken = rawData.pending_authentication_token;
  }
}
