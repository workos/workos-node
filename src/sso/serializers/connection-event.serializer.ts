import {
  ConnectionEventConnection,
  ConnectionEventConnectionResponse,
  ConnectionSamlCertificateRenewalRequiredEventData,
  ConnectionSamlCertificateRenewalRequiredEventResponseData,
  ConnectionSamlCertificateRenewedEventData,
  ConnectionSamlCertificateRenewedEventResponseData,
} from '../interfaces/connection-event.interface';

const deserializeConnectionEventConnection = (
  connection: ConnectionEventConnectionResponse,
): ConnectionEventConnection => ({
  id: connection.id,
  ...(connection.organization_id !== undefined && {
    organizationId: connection.organization_id,
  }),
});

export const deserializeConnectionSamlCertificateRenewalRequiredEvent = (
  data: ConnectionSamlCertificateRenewalRequiredEventResponseData,
): ConnectionSamlCertificateRenewalRequiredEventData => ({
  connection: deserializeConnectionEventConnection(data.connection),
  certificate: {
    certificateType: data.certificate.certificate_type,
    expiryDate: new Date(data.certificate.expiry_date),
    isExpired: data.certificate.is_expired,
  },
  daysUntilExpiry: data.days_until_expiry,
});

export const deserializeConnectionSamlCertificateRenewedEvent = (
  data: ConnectionSamlCertificateRenewedEventResponseData,
): ConnectionSamlCertificateRenewedEventData => ({
  connection: deserializeConnectionEventConnection(data.connection),
  certificate: {
    certificateType: data.certificate.certificate_type,
    expiryDate: new Date(data.certificate.expiry_date),
  },
  renewedAt: new Date(data.renewed_at),
});
