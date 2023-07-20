import { List } from '../common/interfaces/list.interface';
import { WorkOS } from '../workos';
import { AuthorizationUrlOptions } from './interfaces/authorization-url-options.interface';
import { Connection } from './interfaces/connection.interface';
import { GetProfileAndTokenOptions } from './interfaces/get-profile-and-token-options.interface';
import { GetProfileOptions } from './interfaces/get-profile-options.interface';
import { ListConnectionsOptions } from './interfaces/list-connections-options.interface';
import { ProfileAndToken } from './interfaces/profile-and-token.interface';
import { Profile } from './interfaces/profile.interface';

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

  async deleteConnection(id: string) {
    await this.workos.delete(`/connections/${id}`);
  }

  getAuthorizationUrl({
    connection,
    client_id,
    domain,
    domain_hint,
    login_hint,
    organization,
    provider,
    redirect_uri,
    state,
  }: AuthorizationUrlOptions): string {
    if (!domain && !provider && !connection && !organization) {
      throw new Error(
        `Incomplete arguments. Need to specify either a 'connection', 'organization', 'domain', or 'provider'.`,
      );
    }

    if (domain) {
      this.workos.emitWarning(
        'The `domain` parameter for `getAuthorizationUrl` is deprecated. Please use `organization` instead.',
      );
    }

    const query = toQueryString({
      connection,
      organization,
      domain,
      domain_hint,
      login_hint,
      provider,
      client_id,
      redirect_uri,
      response_type: 'code',
      state,
    });

    return `${this.workos.baseURL}/sso/authorize?${query}`;
  }

  async getConnection(id: string): Promise<Connection> {
    const { data } = await this.workos.get(`/connections/${id}`);
    return data;
  }

  async getProfileAndToken({
    code,
    client_id,
  }: GetProfileAndTokenOptions): Promise<ProfileAndToken> {
    const form = new URLSearchParams({
      client_id,
      client_secret: this.workos.key as string,
      grant_type: 'authorization_code',
      code,
    });

    const { data } = await this.workos.post('/sso/token', form);
    return data;
  }

  async getProfile({ access_token }: GetProfileOptions): Promise<Profile> {
    const { data } = await this.workos.get('/sso/profile', {
      access_token,
    });

    return data;
  }

  async listConnections(
    options?: ListConnectionsOptions,
  ): Promise<List<Connection>> {
    const { data } = await this.workos.get(`/connections`, {
      query: options,
    });
    return data;
  }
}
