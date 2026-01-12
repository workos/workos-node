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

export class SSO {
  constructor(private readonly workos: WorkOS) {}

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
  async deleteConnection(id: string) {
    await this.workos.delete(`/connections/${id}`);
  }

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

  async getConnection(id: string): Promise<Connection> {
    const { data } = await this.workos.get<ConnectionResponse>(
      `/connections/${id}`,
    );

    return deserializeConnection(data);
  }

  /**
   * Exchange an authorization code for a profile and access token.
   *
   * Auto-detects public vs confidential client mode:
   * - If codeVerifier is provided: Uses PKCE flow (public client)
   * - If no codeVerifier: Uses client_secret from API key (confidential client)
   * - If both: Uses both client_secret AND codeVerifier (confidential client with PKCE)
   *
   * Using PKCE with confidential clients is recommended by OAuth 2.1 for defense
   * in depth and provides additional CSRF protection on the authorization flow.
   *
   * @throws Error if neither codeVerifier nor API key is available
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
