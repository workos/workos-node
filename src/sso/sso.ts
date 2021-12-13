import queryString from 'query-string';
import { List } from '../common/interfaces/list.interface';
import { WorkOS } from '../workos';
import { AuthorizationURLOptions } from './interfaces/authorization-url-options.interface';
import { Connection } from './interfaces/connection.interface';
import { GetProfileAndTokenOptions } from './interfaces/get-profile-and-token-options.interface';
import { GetProfileOptions } from './interfaces/get-profile-options.interface';
import { ListConnectionsOptions } from './interfaces/list-connections-options.interface';
import { ProfileAndToken } from './interfaces/profile-and-token.interface';
import { Profile } from './interfaces/profile.interface';

export class SSO {
  constructor(private readonly workos: WorkOS) {}

  async deleteConnection(id: string) {
    await this.workos.delete(`/connections/${id}`);
  }

  getAuthorizationURL({
    connection,
    clientID,
    domain,
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

    const query = queryString.stringify({
      connection,
      organization,
      domain,
      provider,
      client_id: clientID,
      redirect_uri: redirectURI,
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
    clientID,
  }: GetProfileAndTokenOptions): Promise<ProfileAndToken> {
    const form = new URLSearchParams({
      client_id: clientID,
      client_secret: this.workos.key as string,
      grant_type: 'authorization_code',
      code,
    });

    const { data } = await this.workos.post('/sso/token', form);
    return data;
  }

  async getProfile({ accessToken }: GetProfileOptions): Promise<Profile> {
    const { data } = await this.workos.get('/sso/profile', {
      accessToken,
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
