// @oagen-ignore-file
// Hand-maintained to preserve the spec's nested credential discriminants.

import type {
  DataIntegrationCredentialsResponseCredential,
  DataIntegrationCredentialsResponseCredentialResponse,
} from '../interfaces/data-integration-credentials-response-credential.interface';

export const deserializeDataIntegrationCredentialsResponseCredential = (
  response: DataIntegrationCredentialsResponseCredentialResponse,
): DataIntegrationCredentialsResponseCredential => {
  switch (response.auth_method) {
    case 'api_key':
      return {
        object: response.object,
        authMethod: response.auth_method,
        value: response.value,
      };
    case 'oauth':
    case 'client_credentials':
      return {
        object: response.object,
        value: response.value,
        expiresAt: response.expires_at,
        scopes: response.scopes,
        missingScopes: response.missing_scopes,
        ...(response.auth_method === 'client_credentials'
          ? { authMethod: response.auth_method, metadata: response.metadata }
          : { authMethod: response.auth_method }),
      };
    default:
      throw new Error(
        `Unknown auth_method: ${String((response as Record<string, unknown>).auth_method)}`,
      );
  }
};
