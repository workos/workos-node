import queryString from 'query-string';

import { API_HOSTNAME } from '../common/constants';
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
    const { apiHostname = API_HOSTNAME } = this.workos.options;

    const query = queryString.stringify({
      domain,
      client_id: projectID,
      redirect_uri: redirectURI,
      response_type: 'code',
      state,
    });

    return `https://${apiHostname}/sso/authorize?${query}`;
  }

  async getProfile({
    code,
    projectID,
    redirectURI,
  }: GetProfileOptions): Promise<Profile> {
    const { data } = await this.workos.post('/sso/token', null, {
      client_id: projectID,
      client_secret: this.workos.key,
      redirect_uri: redirectURI,
      grant_type: 'authorization_code',
      code,
    });

    return data.profile as Profile;
  }
}
