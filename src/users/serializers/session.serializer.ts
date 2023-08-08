import {
  Session,
  SessionResponse,
  UnauthorizedOrganization,
  UnauthorizedOrganizationReason,
  UnauthorizedOrganizationReasonResponse,
  UnauthorizedOrganizationResponse,
} from '../interfaces/session.interface';

export const deserializeSession = (session: SessionResponse): Session => ({
  id: session.id,
  createdAt: session.created_at,
  expiresAt: session.expires_at,
  authorizedOrganizations: session.authorized_organizations,
  unauthorizedOrganizations: session.unauthorized_organizations.map(
    deserializeUnauthorizedOrganization,
  ),
  token: session.token,
});

export const deserializeUnauthorizedOrganization = (
  unauthorizedOrganization: UnauthorizedOrganizationResponse,
): UnauthorizedOrganization => ({
  organization: unauthorizedOrganization.organization,
  reasons: unauthorizedOrganization.reasons.map(
    deserializeUnauthorizedOrganizationReason,
  ),
});

export const deserializeUnauthorizedOrganizationReason = (
  unauthorizedOrganizationReason: UnauthorizedOrganizationReasonResponse,
): UnauthorizedOrganizationReason => ({
  type: unauthorizedOrganizationReason.type,
  allowedAuthenticationMethods:
    unauthorizedOrganizationReason.allowed_authentication_methods,
});
