import queryString from 'query-string';

import { API_HOSTNAME } from '../common/constants';
import { AuthorizeURLOptions } from './interfaces/authorize-url-options.interface';
import WorkOS from '../workos';

export class SSO {
  constructor(private readonly workos: WorkOS) {}

  getAuthorizationURL({
    domain,
    projectID,
    redirectURI,
    state,
  }: AuthorizeURLOptions): string {
    const { apiHostname = API_HOSTNAME } = this.workos.options;

    const query = queryString.stringify({
      domain,
      client_id: projectID,
      redirect_uri: redirectURI,
      state,
    });

    return `https://${apiHostname}/sso/authorize?${query}`;
  }
}
