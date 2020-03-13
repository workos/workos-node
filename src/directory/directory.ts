import queryString from 'query-string';

import { AuthorizationURLOptions } from '../sso/interfaces/authorization-url-options.interface';
import WorkOS from '../workos';

export class Directory {
  constructor(private readonly workos: WorkOS) {}

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
      is_directory_sync: true,
      redirect_uri: redirectURI,
      response_type: 'code',
      state,
    });

    return `${this.workos.baseURL}/sso/authorize?${query}`;
  }
}
