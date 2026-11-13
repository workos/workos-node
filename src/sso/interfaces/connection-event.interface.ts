export type SamlCertificateType =
  'ResponseSigning' | 'RequestSigning' | 'ResponseEncryption';

export interface ConnectionEventConnection {
  id: string;
  organizationId?: string;
}

export interface ConnectionEventConnectionResponse {
  id: string;
  organization_id?: string;
}

export interface SamlCertificateRenewalRequired {
  certificateType: SamlCertificateType;
  expiryDate: Date;
  isExpired: boolean;
}

export interface SamlCertificateRenewalRequiredResponse {
  certificate_type: SamlCertificateType;
  expiry_date: string;
  is_expired: boolean;
}

export interface SamlCertificateRenewed {
  certificateType: SamlCertificateType;
  expiryDate: Date;
}

export interface SamlCertificateRenewedResponse {
  certificate_type: SamlCertificateType;
  expiry_date: string;
}

export interface ConnectionSamlCertificateRenewalRequiredEventData {
  connection: ConnectionEventConnection;
  certificate: SamlCertificateRenewalRequired;
  daysUntilExpiry: number;
}

export interface ConnectionSamlCertificateRenewalRequiredEventResponseData {
  connection: ConnectionEventConnectionResponse;
  certificate: SamlCertificateRenewalRequiredResponse;
  days_until_expiry: number;
}

export interface ConnectionSamlCertificateRenewedEventData {
  connection: ConnectionEventConnection;
  certificate: SamlCertificateRenewed;
  renewedAt: Date;
}

export interface ConnectionSamlCertificateRenewedEventResponseData {
  connection: ConnectionEventConnectionResponse;
  certificate: SamlCertificateRenewedResponse;
  renewed_at: string;
}
