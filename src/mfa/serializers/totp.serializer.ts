import {
  Totp,
  TotpResponse,
  TotpWithSecretsResponse,
  TotpWithSecrets,
} from '../interfaces';

export const deserializeTotp = (totp: TotpResponse): Totp => {
  return {
    issuer: totp.issuer,
    user: totp.user,
  };
};

export const deserializeTotpWithSecrets = (
  totp: TotpWithSecretsResponse,
): TotpWithSecrets => {
  return {
    issuer: totp.issuer,
    user: totp.user,
    qrCode: totp.qr_code,
    secret: totp.secret,
    uri: totp.uri,
  };
};
