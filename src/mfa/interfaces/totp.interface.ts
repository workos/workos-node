export interface Totp {
  issuer: string;
  user: string;
  qr_code: string;
  secret: string;
  uri: string;
}
