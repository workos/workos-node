import {
  EnrollAuthFactorOptions,
  SerializedEnrollUserInMfaFactorOptions,
} from '../interfaces';

export const serializeEnrollAuthFactorOptions = (
  options: EnrollAuthFactorOptions,
): SerializedEnrollUserInMfaFactorOptions => ({
  type: options.type,
  totp_issuer: options.totpIssuer,
  totp_user: options.totpUser,
  totp_secret: options.totpSecret,
});
