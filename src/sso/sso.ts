import { AutoPaginatable } from '../common/utils/pagination';
import { WorkOS } from '../workos';
import {
  AuthorizationURLOptions,
  Connection,
  ConnectionResponse,
  GetProfileAndTokenOptions,
  GetProfileOptions,
  ListConnectionsOptions,
  Profile,
  ProfileAndToken,
  ProfileAndTokenResponse,
  ProfileResponse,
} from './interfaces';
import {
  deserializeConnection,
  deserializeProfile,
  deserializeProfileAndToken,
  serializeListConnectionsOptions,
} from './serializers';
import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';
import { UnknownRecord } from '../common/interfaces/unknown-record.interface';

const toQueryString = (options: Record<string, string | undefined>): string => {
  const searchParams = new URLSearchParams();
  const keys = Object.keys(options).sort();

  for (const key of keys) {
    const value = options[key];

    if (value) {
      searchParams.append(key, value);
    }
  }

  return searchParams.toString();
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
    domain,
    domainHint,
    loginHint,
    organization,
    provider,
    redirectUri,
    state,
  }: AuthorizationURLOptions): string {
    if (!domain && !provider && !connection && !organization) {
      throw new Error(
        `Incomplete arguments. Need to specify either a 'connection', 'organization', 'domain', or 'provider'.`,
      );
    }

    if (domain) {
      this.workos.emitWarning(
        'The `domain` parameter for `getAuthorizationURL` is deprecated. Please use `organization` instead.',
      );
    }

    const query = toQueryString({
      connection,
      organization,
      domain,
      domain_hint: domainHint,
      login_hint: loginHint,
      provider,
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
