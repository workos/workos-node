
import { AutoPaginatable } from '../common/utils/pagination';
import { List, ListResponse, PaginationOptions } from '../common/interfaces';
import { deserializeList } from '../common/serializers';
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
} from './serializers';

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

  private setDefaultOptions(options?: PaginationOptions): PaginationOptions {
    return {
      ...options,
      order: options?.order || 'desc',
    };
  }

  private async fetchAndDeserialize<T, U>(
    endpoint: string,
    deserializeFn: (data: T) => U,
    options: PaginationOptions,
  ): Promise<List<U>> {
    const { data } = await this.workos.get<ListResponse<T>>(endpoint, {
      query: options,
    });

    return deserializeList(data, deserializeFn);
  }

  async listConnections(
    options?: ListConnectionsOptions,
  ): Promise<AutoPaginatable<Connection>> {
    const defaultOptions = this.setDefaultOptions(options);

    return new AutoPaginatable(
      await this.fetchAndDeserialize<ConnectionResponse, Connection>(
        '/connections',
        deserializeConnection,
        defaultOptions,
      ),
      (params) =>
        this.fetchAndDeserialize<ConnectionResponse, Connection>(
          '/connections',
          deserializeConnection,
          params,
        ),
      defaultOptions,
    );
  }
  async deleteConnection(id: string) {
    await this.workos.delete(`/connections/${id}`);
  }

  getAuthorizationURL({
    connection,
    clientID,
    domain,
    domainHint,
    loginHint,
    organization,
    provider,
    redirectURI,
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
      client_id: clientID,
      redirect_uri: redirectURI,
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

  async getProfileAndToken({
    code,
    clientID,
  }: GetProfileAndTokenOptions): Promise<ProfileAndToken> {
    const form = new URLSearchParams({
      client_id: clientID,
      client_secret: this.workos.key as string,
      grant_type: 'authorization_code',
      code,
    });

    const { data } = await this.workos.post<ProfileAndTokenResponse>(
      '/sso/token',
      form,
    );

    return deserializeProfileAndToken(data);
  }

  async getProfile({ accessToken }: GetProfileOptions): Promise<Profile> {
    const { data } = await this.workos.get<ProfileResponse>('/sso/profile', {
      accessToken,
    });

    return deserializeProfile(data);
  }

}
