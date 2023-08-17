import {
  EnrollUserInMfaFactorOptions,
  SerializedEnrollUserInMfaFactorOptions,
} from '../interfaces';

export const serializeEnrollUserInMfaFactorOptions = (
  options: EnrollUserInMfaFactorOptions,
): SerializedEnrollUserInMfaFactorOptions => ({
  type: options.type,
  totp_issuer: options.totpIssuer,
  totp_user: options.totpUser,
});
