import queryString from 'query-string';
import { List } from '../common/interfaces/list.interface';
import { WorkOS } from '../workos';
import { AuthorizationURLOptions } from './interfaces/authorization-url-options.interface';
import { Connection } from './interfaces/connection.interface';
import { GetProfileAndTokenOptions } from './interfaces/get-profile-and-token-options.interface';
import { ListConnectionsOptions } from './interfaces/list-connections-options.interface';
import { ProfileAndToken } from './interfaces/profile-and-token.interface';

export class SSO {
  constructor(private readonly workos: WorkOS) {}

  async deleteConnection(id: string) {
    await this.workos.delete(`/connections/${id}`);
  }

  getAuthorizationURL({
    connection,
    clientID,
    domain,
    provider,
    redirectURI,
    state,
  }: AuthorizationURLOptions): string {
    if (!domain && !provider && !connection) {
      throw new Error(
        `Incomplete arguments. Need to specify either a 'connection', 'domain', or 'provider'.`,
      );
    }

    const query = queryString.stringify({
      connection,
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

  async listConnections(
    options?: ListConnectionsOptions,
  ): Promise<List<Connection>> {
    const { data } = await this.workos.get(`/connections`, options);
    return data;
  }
}
