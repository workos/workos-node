export interface AuthenticateWithSessionOptions {
  cookiePassword?: string;
  sealSession: boolean;
}

export interface AuthenticateWithOptionsBase {
  clientId?: string;
  ipAddress?: string;
  userAgent?: string;
  session?: AuthenticateWithSessionOptions;
}

export interface SerializedAuthenticateWithOptionsBase {
  client_id: string;
  client_secret: string | undefined;
  ip_address?: string;
  user_agent?: string;
}

/** Base for serialized auth options that don't require client_secret (public clients) */
export interface SerializedAuthenticatePublicClientBase {
  client_id: string;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Utility type for serializer input signatures.
 *
 * Since `clientId` is optional in user-facing interfaces (allowing fallback to
 * the constructor-provided value), but serializers require a resolved string,
 * this type overrides the optional `clientId` with a required one.
 *
 * Usage in serializers:
 * ```
 * const serialize = (options: WithResolvedClientId<SomeOptions>) => ...
 * ```
 */
export type WithResolvedClientId<T> = Omit<T, 'clientId'> & {
  clientId: string;
};
