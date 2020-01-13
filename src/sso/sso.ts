import queryString from 'query-string';

import { AuthorizationURLOptions } from './interfaces/authorization-url-options.interface';
import { GetProfileOptions } from './interfaces/get-profile-options.interface';
import { Profile } from './interfaces/profile.interface';
import WorkOS from '../workos';

export class SSO {
  constructor(private readonly workos: WorkOS) {}

  getAuthorizationURL({
    domain,
    projectID,
    redirectURI,
    state,
  }: AuthorizationURLOptions): string {
    const query = queryString.stringify({
      domain,
      client_id: projectID,
      redirect_uri: redirectURI,
      response_type: 'code',
      state,
    });

    return `${this.workos.baseURL}/sso/authorize?${query}`;
  }

  async getProfile({ code, projectID }: GetProfileOptions): Promise<Profile> {
    const { data } = await this.workos.post('/sso/token', null, {
      query: {
        client_id: projectID,
        client_secret: this.workos.key,
        grant_type: 'authorization_code',
        code,
      },
    });

    return data.profile as Profile;
  }
}
