import {
  UnauthorizedOrganization,
  UnauthorizedOrganizationReason,
  UnauthorizedOrganizationReasonResponse,
  UnauthorizedOrganizationResponse,
} from '../interfaces/user-authentication.interface';

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
