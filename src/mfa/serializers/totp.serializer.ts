import { Totp, TotpResponse } from '../interfaces';

export const deserializeTotp = (totp: TotpResponse): Totp => {
  if ('qr_code' in totp && 'secret' in totp && 'uri' in totp) {
    return {
      issuer: totp.issuer,
      user: totp.user,
      qrCode: totp.qr_code,
      secret: totp.secret,
      uri: totp.uri,
    };
  } else {
    return {
      issuer: totp.issuer,
      user: totp.user,
    };
  }
};
