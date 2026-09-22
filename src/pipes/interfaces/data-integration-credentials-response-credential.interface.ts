// @oagen-ignore-file
// Hand-maintained to preserve the spec's nested credential discriminants.

/** A vended credential, discriminated by its authentication method. */
export type DataIntegrationCredentialsResponseCredential =
  | {
      object: 'credential';
      authMethod: 'oauth';
      value: string;
      expiresAt: string | null;
      scopes: string[];
      missingScopes: string[];
    }
  | {
      object: 'credential';
      authMethod: 'api_key';
      value: string;
    }
  | {
      object: 'credential';
      authMethod: 'client_credentials';
      value: string;
      expiresAt: string | null;
      scopes: string[];
      missingScopes: string[];
      /** Non-sensitive provider token response fields, such as an instance URL. */
      metadata: Record<string, unknown>;
    };

export type DataIntegrationCredentialsResponseCredentialResponse =
  | {
      object: 'credential';
      auth_method: 'oauth';
      value: string;
      expires_at: string | null;
      scopes: string[];
      missing_scopes: string[];
    }
  | {
      object: 'credential';
      auth_method: 'api_key';
      value: string;
    }
  | {
      object: 'credential';
      auth_method: 'client_credentials';
      value: string;
      expires_at: string | null;
      scopes: string[];
      missing_scopes: string[];
      metadata: Record<string, unknown>;
    };
