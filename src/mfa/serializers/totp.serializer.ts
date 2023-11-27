import { Totp, TotpResponse } from '../interfaces';

export const deserializeTotp = (totp: TotpResponse): Totp => {
  return {
    issuer: totp.issuer,
    user: totp.user,
    qrCode: totp.qr_code,
    secret: totp.secret,
    uri: totp.uri,
  };
};
