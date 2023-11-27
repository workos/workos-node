export interface Totp {
  issuer: string;
  user: string;
  qrCode?: string;
  secret?: string;
  uri?: string;
}

export interface TotpResponse {
  issuer: string;
  user: string;
  qr_code?: string;
  secret?: string;
  uri?: string;
}
