import queryString from 'query-string';

import { AuthorizationURLOptions } from './interfaces/authorization-url-options.interface';
import { Connection } from './interfaces/connection.interface';
import { CreateConnectionOptions } from './interfaces/create-connection-options.interface';
import { GetProfileOptions } from './interfaces/get-profile-options.interface';
import { Profile } from './interfaces/profile.interface';
import { PromoteDraftConnectionOptions } from './interfaces/promote-draft-connection-options.interface';
import { WorkOS } from '../workos';

export class SSO {
  constructor(private readonly workos: WorkOS) {}

  async createConnection({
    source,
  }: CreateConnectionOptions): Promise<Connection> {
    const { data } = await this.workos.post('/connections', { source });
    return data;
  }

  getAuthorizationURL({
    clientID,
    domain,
    provider,
    redirectURI,
    state,
  }: AuthorizationURLOptions): string {
    if (!domain && !provider) {
      throw new Error(
        `Incomplete arguments. Need to specify either a 'domain' or 'provider'.`,
      );
    }

    const query = queryString.stringify({
      domain,
      provider,
      client_id: clientID,
      redirect_uri: redirectURI,
      response_type: 'code',
      state,
    });

    return `${this.workos.baseURL}/sso/authorize?${query}`;
  }

  async getProfile({
    code,
    clientID,
    projectID,
  }: GetProfileOptions): Promise<Profile> {
    const form = new URLSearchParams();
    if (clientID) {
      form.set('client_id', clientID);
    } else if (projectID) {
      form.set('project_id', projectID);
      this.workos.emitWarning(
        `Use of project_id is deprecated; please use client_id in Dashboard2`,
      );
    } else {
      throw new Error(`You must enter a client_id or project_id`);
    }
    form.set('client_secret', this.workos.key as string);
    form.set('grant_type', 'authorization_code');
    form.set('code', code);
    const { data } = await this.workos.post('/sso/token', form);

    return data.profile as Profile;
  }

  async promoteDraftConnection({ token }: PromoteDraftConnectionOptions) {
    this.workos.emitWarning(
      '[Deprecated] sso.promoteDraftConnection({ token }) is deprecated. Use sso.createConnection({ source }) instead.',
    );

    const endpoint = `/draft_connections/${token}/activate`;
    await this.workos.post(endpoint, null);
  }
}
