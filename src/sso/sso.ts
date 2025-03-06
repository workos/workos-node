import qs from 'qs';
import { UnknownRecord } from '../common/interfaces/unknown-record.interface';
import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';
import { AutoPaginatable } from '../common/utils/pagination';
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
} from './interfaces';
import {
  deserializeConnection,
  deserializeProfile,
  deserializeProfileAndToken,
  serializeListConnectionsOptions,
} from './serializers';

const toQueryString = (
  options: Record<
    string,
    string | string[] | Record<string, string | boolean | number> | undefined
  >,
): string => {
  return qs.stringify(options, {
    arrayFormat: 'repeat',
    // sorts the keys alphabetically to maintain backwards compatibility
    sort: (a, b) => a.localeCompare(b),
    // encodes space as + instead of %20 to maintain backwards compatibility
    format: 'RFC1738',
  });
};

export class SSO {
  constructor(private readonly workos: WorkOS) {}

  async listConnections(
    options?: ListConnectionsOptions,
  ): Promise<AutoPaginatable<Connection>> {
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

  getAuthorizationUrl({
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
  }: SSOAuthorizationURLOptions): string {
    if (!provider && !connection && !organization) {
      throw new Error(
        `Incomplete arguments. Need to specify either a 'connection', 'organization', or 'provider'.`,
      );
    }

    const query = toQueryString({
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

  async getConnection(id: string): Promise<Connection> {
    const { data } = await this.workos.get<ConnectionResponse>(
      `/connections/${id}`,
    );

    return deserializeConnection(data);
  }

  async getProfileAndToken<
    CustomAttributesType extends UnknownRecord = UnknownRecord,
  >({
    code,
    clientId,
  }: GetProfileAndTokenOptions): Promise<
    ProfileAndToken<CustomAttributesType>
  > {
    const form = new URLSearchParams({
      client_id: clientId,
      client_secret: this.workos.key as string,
      grant_type: 'authorization_code',
      code,
    });

    const { data } = await this.workos.post<
      ProfileAndTokenResponse<CustomAttributesType>
    >('/sso/token', form);

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
