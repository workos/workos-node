import { Identity, IdentityResponse } from '../interfaces/identity.interface';

// The API returns 'GithubOAuth' but getAuthorizationUrl expects 'GitHubOAuth'.
// Normalize here so callers can pass identity.provider directly.
// See: https://github.com/workos/workos-node/issues/1227
const normalizeProvider = (
  provider: IdentityResponse['provider'],
): Identity['provider'] => {
  if (provider === 'GithubOAuth') {
    return 'GitHubOAuth';
  }
  return provider;
};

export const deserializeIdentities = (
  identities: IdentityResponse[],
): Identity[] => {
  return identities.map((identity) => {
    return {
      idpId: identity.idp_id,
      type: identity.type,
      provider: normalizeProvider(identity.provider),
    };
  });
};
