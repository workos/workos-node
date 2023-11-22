interface TotpObject {
  issuer: string;
  user: string;
  qrCode: string;
  secret: string;
  uri: string;
}

type TotpObjectWithOnlyIssuerAndUser = Pick<TotpObject, 'issuer' | 'user'>;

export type Totp = TotpObject | TotpObjectWithOnlyIssuerAndUser;

interface TotpResponseObject {
  issuer: string;
  user: string;
  qr_code: string;
  secret: string;
  uri: string;
}

type TotpResponseObjectWithOnlyIssuerAndUser = Pick<
  TotpResponseObject,
  'issuer' | 'user'
>;

export type TotpResponse =
  | TotpResponseObject
  | TotpResponseObjectWithOnlyIssuerAndUser;
