import { UnknownRecord } from '../common/interfaces/unknown-record.interface';
import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';
import { AutoPaginatable } from '../common/utils/pagination';
import { toQueryString } from '../common/utils/query-string';
import { WorkOS } from '../workos';
import {
  Connection,
  ConnectionResponse,
  GetProfileAndTokenOptions,
  GetProfileOptions,
  ListConnectionsOptions,
  Profile,
  ProfileAndToken,
  ProfileAndTokenResponse,
  ProfileResponse,
  SSOAuthorizationURLOptions,
  SSOPKCEAuthorizationURLResult,
  SerializedListConnectionsOptions,
} from './interfaces';
import {
  deserializeConnection,
  deserializeProfile,
  deserializeProfileAndToken,
  serializeListConnectionsOptions,
} from './serializers';
import type { SSOProvider } from './interfaces/sso-provider.interface';

export class SSO {
  constructor(private readonly workos: WorkOS) {}

  /**
   * List Connections
   *
   * Get a list of all of your existing connections matching the criteria specified.
   * @param options - Pagination and filter options.
   * @returns {AutoPaginatable<Connection>}
   * @throws {AuthorizationException} 403
   * @throws {UnprocessableEntityException} 422
   */
  async listConnections(
    options?: ListConnectionsOptions,
  ): Promise<AutoPaginatable<Connection, SerializedListConnectionsOptions>> {
    return new AutoPaginatable(
      await fetchAndDeserialize<ConnectionResponse, Connection>(
        this.workos,
        '/connections',
        deserializeConnection,
        options ? serializeListConnectionsOptions(options) : undefined,
      ),
      (params) =>
        fetchAndDeserialize<ConnectionResponse, Connection>(
          this.workos,
          '/connections',
          deserializeConnection,
          params,
        ),
      options ? serializeListConnectionsOptions(options) : undefined,
    );
  }
  /**
   * Delete a Connection
   *
   * Permanently deletes an existing connection. It cannot be undone.
   * @param id - Unique identifier for the Connection.
   * @example "conn_01E4ZCR3C56J083X43JQXF3JK5"
   * @returns {void}
   * @throws {AuthorizationException} 403
   * @throws {NotFoundException} 404
   */
  async deleteConnection(id: string) {
    await this.workos.delete(`/connections/${id}`);
  }

  /**
   * Initiate SSO
   *
   * Initiates the single sign-on flow.
   * @param options.providerScopes - Additional OAuth scopes to request from the identity provider. Only applicable when using OAuth connections.
   * @example ["openid","profile","email"]
   * @param options.providerQueryParams - Key/value pairs of query parameters to pass to the OAuth provider. Only applicable when using OAuth connections.
   * @example {"hd":"example.com","access_type":"offline"}
   * @param options.domain - (deprecated) Deprecated. Use `connection` or `organization` instead. Used to initiate SSO for a connection by domain. The domain must be associated with a connection in your WorkOS environment.
   * @example "example.com"
   * @param options.provider - Used to initiate OAuth authentication with Google, Microsoft, GitHub, or Apple.
   * @example "GoogleOAuth"
   * @param options.redirectUri - Where to redirect the user after they complete the authentication process. You must use one of the redirect URIs configured via the [Redirects](https://dashboard.workos.com/redirects) page on the dashboard.
   * @example "https://example.com/callback"
   * @param options.state - An optional parameter that can be used to encode arbitrary information to help restore application state between redirects. If included, the redirect URI received from WorkOS will contain the exact `state` that was passed.
   * @example "dj1kUXc0dzlXZ1hjUQ=="
   * @param options.connection - Used to initiate SSO for a connection. The value should be a WorkOS connection ID.
   *
   * You can persist the WorkOS connection ID with application user or team identifiers. WorkOS will use the connection indicated by the connection parameter to direct the user to the corresponding IdP for authentication.
   * @example "conn_01E4ZCR3C56J083X43JQXF3JK5"
   * @param options.organization - Used to initiate SSO for an organization. The value should be a WorkOS organization ID.
   *
   * You can persist the WorkOS organization ID with application user or team identifiers. WorkOS will use the organization ID to determine the appropriate connection and the IdP to direct the user to for authentication.
   * @example "org_01EHQMYV6MBK39QC5PZXHY59C3"
   * @param options.domainHint - Can be used to pre-fill the domain field when initiating authentication with Microsoft OAuth or with a Google SAML connection type.
   * @example "example.com"
   * @param options.loginHint - Can be used to pre-fill the username/email address field of the IdP sign-in page for the user, if you know their username ahead of time. Currently supported for OAuth, OpenID Connect, Okta, and Entra ID connections.
   * @example "user@example.com"
   * @param options.nonce - A random string generated by the client that is used to mitigate replay attacks.
   * @example "abc123def456"
   * @param options - Additional query options.
   * @returns {SSOAuthorizeUrlResponse}
   */
  getAuthorizationUrl(options: SSOAuthorizationURLOptions): string {
    const {
      codeChallenge,
      codeChallengeMethod,
      connection,
      clientId,
      domainHint,
      loginHint,
      organization,
      provider,
      providerQueryParams,
      providerScopes,
      redirectUri,
      state,
    } = options;

    if (!provider && !connection && !organization) {
      throw new TypeError(
        `Incomplete arguments. Need to specify either a 'connection', 'organization', or 'provider'.`,
      );
    }

    const query = toQueryString({
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
      connection,
      organization,
      domain_hint: domainHint,
      login_hint: loginHint,
      provider,
      provider_query_params: providerQueryParams,
      provider_scopes: providerScopes,
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
    });

    return `${this.workos.baseURL}/sso/authorize?${query}`;
  }

  /**
   * Generates an authorization URL with PKCE parameters automatically generated.
   * Use this for public clients (CLI apps, Electron, mobile) that cannot
   * securely store a client secret.
   *
   * @returns Object containing url, state, and codeVerifier
   *
   * @example
   * ```typescript
   * const { url, state, codeVerifier } = await workos.sso.getAuthorizationUrlWithPKCE({
   *   connection: 'conn_123',
   *   clientId: 'client_123',
   *   redirectUri: 'myapp://callback',
   * });
   *
   * // Store state and codeVerifier securely, then redirect user to url
   * // After callback, exchange the code:
   * const { profile, accessToken } = await workos.sso.getProfileAndToken({
   *   code: authorizationCode,
   *   codeVerifier,
   *   clientId: 'client_123',
   * });
   * ```
   */
  async getAuthorizationUrlWithPKCE(
    options: Omit<
      SSOAuthorizationURLOptions,
      'codeChallenge' | 'codeChallengeMethod' | 'state'
    >,
  ): Promise<SSOPKCEAuthorizationURLResult> {
    const {
      connection,
      clientId,
      domainHint,
      loginHint,
      organization,
      provider,
      providerQueryParams,
      providerScopes,
      redirectUri,
    } = options;

    if (!provider && !connection && !organization) {
      throw new TypeError(
        `Incomplete arguments. Need to specify either a 'connection', 'organization', or 'provider'.`,
      );
    }

    // Generate PKCE parameters
    const pkce = await this.workos.pkce.generate();

    // Generate secure random state
    const state = this.workos.pkce.generateCodeVerifier(43);

    const query = toQueryString({
      code_challenge: pkce.codeChallenge,
      code_challenge_method: 'S256',
      connection,
      organization,
      domain_hint: domainHint,
      login_hint: loginHint,
      provider,
      provider_query_params: providerQueryParams,
      provider_scopes: providerScopes,
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
    });

    const url = `${this.workos.baseURL}/sso/authorize?${query}`;

    return { url, state, codeVerifier: pkce.codeVerifier };
  }

  /**
   * Get a Connection
   *
   * Get the details of an existing connection.
   * @param id - Unique identifier for the Connection.
   * @example "conn_01E4ZCR3C56J083X43JQXF3JK5"
   * @returns {Connection}
   * @throws {AuthorizationException} 403
   * @throws {NotFoundException} 404
   */
  async getConnection(id: string): Promise<Connection> {
    const { data } = await this.workos.get<ConnectionResponse>(
      `/connections/${id}`,
    );

    return deserializeConnection(data);
  }

  /**
   * Get a Profile and Token
   *
   * Get an access token along with the user [Profile](https://workos.com/docs/reference/sso/profile) using the code passed to your [Redirect URI](https://workos.com/docs/reference/sso/get-authorization-url/redirect-uri).
   * @param payload - Object containing clientId, clientSecret, code, grantType.
   * @param options - Additional query options.
   * @returns {SSOTokenResponse}
   * @throws {BadRequestException} 400
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   */
  async getProfileAndToken<
    CustomAttributesType extends UnknownRecord = UnknownRecord,
  >({
    code,
    clientId,
    codeVerifier,
  }: GetProfileAndTokenOptions): Promise<
    ProfileAndToken<CustomAttributesType>
  > {
    // Validate codeVerifier is not an empty string (common mistake)
    if (codeVerifier !== undefined && codeVerifier.trim() === '') {
      throw new TypeError(
        'codeVerifier cannot be an empty string. ' +
          'Generate a valid PKCE pair using workos.pkce.generate().',
      );
    }

    const hasApiKey = !!this.workos.key;
    const hasPKCE = !!codeVerifier;

    if (!hasPKCE && !hasApiKey) {
      throw new TypeError(
        'getProfileAndToken requires either a codeVerifier (for public clients) ' +
          'or an API key configured on the WorkOS instance (for confidential clients).',
      );
    }

    const form = new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
    });

    // Support PKCE with confidential clients (OAuth 2.1 best practice)
    // Both can be sent together for defense in depth
    if (hasPKCE) {
      form.set('code_verifier', codeVerifier);
    }
    if (hasApiKey) {
      form.set('client_secret', this.workos.key as string);
    }

    const { data } = await this.workos.post<
      ProfileAndTokenResponse<CustomAttributesType>
    >('/sso/token', form, { skipApiKeyCheck: !hasApiKey });

    return deserializeProfileAndToken(data);
  }

  /**
   * Get a User Profile
   *
   * Exchange an access token for a user's [Profile](https://workos.com/docs/reference/sso/profile). Because this profile is returned in the [Get a Profile and Token endpoint](https://workos.com/docs/reference/sso/profile/get-profile-and-token) your application usually does not need to call this endpoint. It is available for any authentication flows that require an additional endpoint to retrieve a user's profile.
   * @returns {Profile}
   * @throws {UnauthorizedException} 401
   * @throws {NotFoundException} 404
   */
  async getProfile<CustomAttributesType extends UnknownRecord = UnknownRecord>({
    accessToken,
  }: GetProfileOptions): Promise<Profile<CustomAttributesType>> {
    const { data } = await this.workos.get<
      ProfileResponse<CustomAttributesType>
    >('/sso/profile', {
      accessToken,
    });

    return deserializeProfile(data);
  }
}

export interface AuthorizeOptions {
  /** Additional OAuth scopes to request from the identity provider. Only applicable when using OAuth connections. */
  providerScopes?: string[];
  /** Key/value pairs of query parameters to pass to the OAuth provider. Only applicable when using OAuth connections. */
  providerQueryParams?: Record<string, string>;
  /** The unique identifier of the WorkOS environment client. */
  clientId: string;
  /**
   * Deprecated. Use `connection` or `organization` instead. Used to initiate SSO for a connection by domain. The domain must be associated with a connection in your WorkOS environment.
   * @deprecated
   */
  domain?: string;
  /** Used to initiate OAuth authentication with Google, Microsoft, GitHub, or Apple. */
  provider?: 'AppleOAuth' | 'GitHubOAuth' | 'GoogleOAuth' | 'MicrosoftOAuth';
  /** Where to redirect the user after they complete the authentication process. You must use one of the redirect URIs configured via the [Redirects](https://dashboard.workos.com/redirects) page on the dashboard. */
  redirectUri: string;
  /**
   * The only valid option for the response type parameter is `"code"`.
   *
   * The `"code"` parameter value initiates an [authorization code grant type](https://tools.ietf.org/html/rfc6749#section-4.1). This grant type allows you to exchange an authorization code for an access token during the redirect that takes place after a user has authenticated with an identity provider.
   */
  responseType: 'code';
  /** An optional parameter that can be used to encode arbitrary information to help restore application state between redirects. If included, the redirect URI received from WorkOS will contain the exact `state` that was passed. */
  state?: string;
  /**
   * Used to initiate SSO for a connection. The value should be a WorkOS connection ID.
   *
   * You can persist the WorkOS connection ID with application user or team identifiers. WorkOS will use the connection indicated by the connection parameter to direct the user to the corresponding IdP for authentication.
   */
  connection?: string;
  /**
   * Used to initiate SSO for an organization. The value should be a WorkOS organization ID.
   *
   * You can persist the WorkOS organization ID with application user or team identifiers. WorkOS will use the organization ID to determine the appropriate connection and the IdP to direct the user to for authentication.
   */
  organization?: string;
  /** Can be used to pre-fill the domain field when initiating authentication with Microsoft OAuth or with a Google SAML connection type. */
  domainHint?: string;
  /** Can be used to pre-fill the username/email address field of the IdP sign-in page for the user, if you know their username ahead of time. Currently supported for OAuth, OpenID Connect, Okta, and Entra ID connections. */
  loginHint?: string;
  /** A random string generated by the client that is used to mitigate replay attacks. */
  nonce?: string;
}

export interface LogoutOptions {
  /** The logout token returned from the [Logout Authorize](https://workos.com/docs/reference/sso/logout/authorize) endpoint. */
  token: string;
}

export interface GetAuthorizationUrlOptions {
  /** Additional OAuth scopes to request from the identity provider. Only applicable when using OAuth connections. */
  providerScopes?: string[];
  /** Key/value pairs of query parameters to pass to the OAuth provider. Only applicable when using OAuth connections. */
  providerQueryParams?: Record<string, string>;
  /** The unique identifier of the WorkOS environment client. */
  clientId: string;
  /**
   * Deprecated. Use `connection` or `organization` instead. Used to initiate SSO for a connection by domain. The domain must be associated with a connection in your WorkOS environment.
   * @deprecated
   */
  domain?: string;
  /** Used to initiate OAuth authentication with Google, Microsoft, GitHub, or Apple. */
  provider?: SSOProvider;
  /** Where to redirect the user after they complete the authentication process. You must use one of the redirect URIs configured via the [Redirects](https://dashboard.workos.com/redirects) page on the dashboard. */
  redirectUri: string;
  /**
   * The only valid option for the response type parameter is `"code"`.
   *
   * The `"code"` parameter value initiates an [authorization code grant type](https://tools.ietf.org/html/rfc6749#section-4.1). This grant type allows you to exchange an authorization code for an access token during the redirect that takes place after a user has authenticated with an identity provider.
   */
  responseType: 'code';
  /** An optional parameter that can be used to encode arbitrary information to help restore application state between redirects. If included, the redirect URI received from WorkOS will contain the exact `state` that was passed. */
  state?: string;
  /**
   * Used to initiate SSO for a connection. The value should be a WorkOS connection ID.
   *
   * You can persist the WorkOS connection ID with application user or team identifiers. WorkOS will use the connection indicated by the connection parameter to direct the user to the corresponding IdP for authentication.
   */
  connection?: string;
  /**
   * Used to initiate SSO for an organization. The value should be a WorkOS organization ID.
   *
   * You can persist the WorkOS organization ID with application user or team identifiers. WorkOS will use the organization ID to determine the appropriate connection and the IdP to direct the user to for authentication.
   */
  organization?: string;
  /** Can be used to pre-fill the domain field when initiating authentication with Microsoft OAuth or with a Google SAML connection type. */
  domainHint?: string;
  /** Can be used to pre-fill the username/email address field of the IdP sign-in page for the user, if you know their username ahead of time. Currently supported for OAuth, OpenID Connect, Okta, and Entra ID connections. */
  loginHint?: string;
  /** A random string generated by the client that is used to mitigate replay attacks. */
  nonce?: string;
}

export interface GetLogoutUrlOptions {
  /** The logout token returned from the [Logout Authorize](https://workos.com/docs/reference/sso/logout/authorize) endpoint. */
  token: string;
}
