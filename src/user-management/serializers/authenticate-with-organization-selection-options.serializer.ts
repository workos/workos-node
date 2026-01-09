import {
  AuthenticateUserWithOrganizationSelectionCredentials,
  AuthenticateWithOrganizationSelectionOptions,
  SerializedAuthenticateWithOrganizationSelectionOptions,
} from '../interfaces/authenticate-with-organization-selection.interface';
import { WithResolvedClientId } from '../interfaces';

export const serializeAuthenticateWithOrganizationSelectionOptions = (
  options: WithResolvedClientId<AuthenticateWithOrganizationSelectionOptions> &
    AuthenticateUserWithOrganizationSelectionCredentials,
): SerializedAuthenticateWithOrganizationSelectionOptions => ({
  grant_type: 'urn:workos:oauth:grant-type:organization-selection',
  client_id: options.clientId,
  client_secret: options.clientSecret,
  pending_authentication_token: options.pendingAuthenticationToken,
  organization_id: options.organizationId,
  ip_address: options.ipAddress,
  user_agent: options.userAgent,
});
