import queryString from 'query-string';
import { List } from '../common/interfaces/list.interface';
import { WorkOS } from '../workos';
import { AuthorizationURLOptions } from './interfaces/authorization-url-options.interface';
import { Connection } from './interfaces/connection.interface';
import { CreateConnectionOptions } from './interfaces/create-connection-options.interface';
import { GetProfileAndTokenOptions } from './interfaces/get-profile-and-token-options.interface';
import { ListConnectionsOptions } from './interfaces/list-connections-options.interface';
import { ProfileAndToken } from './interfaces/profile-and-token.interface';
import { PromoteDraftConnectionOptions } from './interfaces/promote-draft-connection-options.interface';

export class SSO {
  constructor(private readonly workos: WorkOS) {}

  async createConnection({
    source,
  }: CreateConnectionOptions): Promise<Connection> {
    const { data } = await this.workos.post('/connections', { source });
    return data;
  }

  async deleteConnection(id: string) {
    await this.workos.delete(`/connections/${id}`);
  }

  getAuthorizationURL({
    connection,
    clientID,
    domain,
    provider,
    projectID,
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
      client_id: clientID ?? projectID,
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
    projectID,
  }: GetProfileAndTokenOptions): Promise<ProfileAndToken> {
    const form = new URLSearchParams();
    if (clientID) {
      form.set('client_id', clientID);
    } else if (projectID) {
      form.set('client_id', projectID);
    }
    form.set('client_secret', this.workos.key as string);
    form.set('grant_type', 'authorization_code');
    form.set('code', code);

    const { data } = await this.workos.post('/sso/token', form);
    return data;
  }

  async listConnections(
    options?: ListConnectionsOptions,
  ): Promise<List<Connection>> {
    const { data } = await this.workos.get(`/connections`, options);
    return data;
  }

  async promoteDraftConnection({ token }: PromoteDraftConnectionOptions) {
    this.workos.emitWarning(
      '[Deprecated] sso.promoteDraftConnection({ token }) is deprecated. Use sso.createConnection({ source }) instead.',
    );

    const endpoint = `/draft_connections/${token}/activate`;
    await this.workos.post(endpoint, null);
  }
}
