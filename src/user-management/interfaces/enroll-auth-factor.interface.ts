export interface EnrollAuthFactorOptions {
  userId: string;
  type: 'totp';
  totpIssuer?: string;
  totpUser?: string;
}

export interface SerializedEnrollUserInMfaFactorOptions {
  type: 'totp';
  totp_issuer?: string;
  totp_user?: string;
}
