import queryString from 'query-string';

import { AuthorizationURLOptions } from './interfaces/authorization-url-options.interface';
import { Connection } from './interfaces/connection.interface';
import { CreateConnectionOptions } from './interfaces/create-connection-options.interface';
import { GetProfileOptions } from './interfaces/get-profile-options.interface';
import { Profile } from './interfaces/profile.interface';
import { PromoteDraftConnectionOptions } from './interfaces/promote-draft-connection-options.interface';
import WorkOS from '../workos';

export class SSO {
  constructor(private readonly workos: WorkOS) {}

  async createConnection({
    source,
  }: CreateConnectionOptions): Promise<Connection> {
    const { data } = await this.workos.post('/connections', { source });
    return data;
  }

  getAuthorizationURL({
    domain,
    projectID,
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
      client_id: projectID,
      redirect_uri: redirectURI,
      response_type: 'code',
      state,
    });

    return `${this.workos.baseURL}/sso/authorize?${query}`;
  }

  async getProfile({ code, projectID }: GetProfileOptions): Promise<Profile> {
    const form = new URLSearchParams();
    form.set('client_id', projectID);
    form.set('client_secret', this.workos.key as string);
    form.set('grant_type', 'authorization_code');
    form.set('code', code);
    const { data } = await this.workos.post('/sso/token', form);

    return data.profile as Profile;
  }

  async promoteDraftConnection({ token }: PromoteDraftConnectionOptions) {
    console.error(
      '[Deprecated] sso.promoteDraftConnection({ token }) is deprecated. Use sso.createConnection({ source }) instead.',
    );

    const endpoint = `/draft_connections/${token}/activate`;
    await this.workos.post(endpoint, null);
  }
}
