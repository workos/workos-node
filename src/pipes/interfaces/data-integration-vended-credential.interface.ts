// @oagen-ignore-file
// Preserve legacy property access and metadata typing on the generated variants.

/**
 * A vended credential, discriminated by its authentication method.
 * `config` contains provider-declared, non-secret snapshot values with live
 * defaults. It is optional for compatibility with older API responses.
 */
export type DataIntegrationVendedCredential =
  | {
      object: 'credential';
      authMethod: 'oauth';
      value: string;
      config?: Record<string, string>;
      expiresAt: string | null;
      scopes: string[];
      missingScopes: string[];
      metadata?: undefined;
    }
  | {
      object: 'credential';
      authMethod: 'api_key';
      value: string;
      config?: Record<string, string>;
      expiresAt?: undefined;
      scopes?: undefined;
      missingScopes?: undefined;
      metadata?: undefined;
    }
  | {
      object: 'credential';
      authMethod: 'client_credentials';
      value: string;
      config?: Record<string, string>;
      expiresAt: string | null;
      scopes: string[];
      missingScopes: string[];
      /** Non-sensitive provider token response fields, such as an instance URL. */
      metadata: Record<string, unknown>;
    };

export type DataIntegrationVendedCredentialResponse =
  | {
      object: 'credential';
      auth_method: 'oauth';
      value: string;
      config?: Record<string, string>;
      expires_at: string | null;
      scopes: string[];
      missing_scopes: string[];
      metadata?: undefined;
    }
  | {
      object: 'credential';
      auth_method: 'api_key';
      value: string;
      config?: Record<string, string>;
      expires_at?: undefined;
      scopes?: undefined;
      missing_scopes?: undefined;
      metadata?: undefined;
    }
  | {
      object: 'credential';
      auth_method: 'client_credentials';
      value: string;
      config?: Record<string, string>;
      expires_at: string | null;
      scopes: string[];
      missing_scopes: string[];
      metadata: Record<string, unknown>;
    };
