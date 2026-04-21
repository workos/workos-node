import { deserializeIdentities } from './identity.serializer';

describe('deserializeIdentities', () => {
  it('normalizes GithubOAuth to GitHubOAuth', () => {
    const result = deserializeIdentities([
      { idp_id: '123', type: 'OAuth', provider: 'GithubOAuth' },
    ]);

    expect(result).toEqual([
      { idpId: '123', type: 'OAuth', provider: 'GitHubOAuth' },
    ]);
  });

  it('leaves other providers unchanged', () => {
    const result = deserializeIdentities([
      { idp_id: '456', type: 'OAuth', provider: 'GoogleOAuth' },
      { idp_id: '789', type: 'OAuth', provider: 'AppleOAuth' },
    ]);

    expect(result).toEqual([
      { idpId: '456', type: 'OAuth', provider: 'GoogleOAuth' },
      { idpId: '789', type: 'OAuth', provider: 'AppleOAuth' },
    ]);
  });
});
