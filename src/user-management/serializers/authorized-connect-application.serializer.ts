import { deserializeConnectApplication } from '../../connect/serializers/connect-application.serializer';
import type {
  AuthorizedConnectApplication,
  AuthorizedConnectApplicationResponse,
} from '../interfaces';

export const deserializeAuthorizedConnectApplication = (
  response: AuthorizedConnectApplicationResponse,
): AuthorizedConnectApplication => ({
  object: response.object,
  id: response.id,
  grantedScopes: response.granted_scopes,
  oauthResource: response.oauth_resource,
  application: deserializeConnectApplication(response.application),
});
