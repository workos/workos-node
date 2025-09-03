import { getAuthorizationUrl } from './sso';

describe('Public SSO Methods', () => {
  describe('getAuthorizationUrl', () => {
    it('builds correct URL with provider', () => {
      const url = getAuthorizationUrl({
        clientId: 'client_123',
        redirectUri: 'https://app.com/callback',
        provider: 'GoogleOAuth',
      });

      expect(url).toContain('https://api.workos.com/sso/authorize');
      expect(url).toContain('client_id=client_123');
      expect(url).toContain('redirect_uri=https%3A%2F%2Fapp.com%2Fcallback');
      expect(url).toContain('provider=GoogleOAuth');
      expect(url).toContain('response_type=code');
    });

    it('builds URL with organization', () => {
      const url = getAuthorizationUrl({
        clientId: 'client_123',
        redirectUri: 'https://app.com/callback',
        organization: 'org_123',
      });

      expect(url).toContain('organization=org_123');
    });

    it('builds URL with connection', () => {
      const url = getAuthorizationUrl({
        clientId: 'client_123',
        redirectUri: 'https://app.com/callback',
        connection: 'conn_123',
      });

      expect(url).toContain('connection=conn_123');
    });

    it('includes state parameter', () => {
      const url = getAuthorizationUrl({
        clientId: 'client_123',
        redirectUri: 'https://app.com/callback',
        provider: 'GoogleOAuth',
        state: 'custom state',
      });

      expect(url).toContain('state=custom+state');
    });

    it('includes domainHint and loginHint', () => {
      const url = getAuthorizationUrl({
        clientId: 'client_123',
        redirectUri: 'https://app.com/callback',
        provider: 'GoogleOAuth',
        domainHint: 'example.com',
        loginHint: 'user@example.com',
      });

      expect(url).toContain('domain_hint=example.com');
      expect(url).toContain('login_hint=user%40example.com');
    });

    it('includes provider scopes', () => {
      const url = getAuthorizationUrl({
        clientId: 'client_123',
        redirectUri: 'https://app.com/callback',
        provider: 'GoogleOAuth',
        providerScopes: ['read_api', 'read_repository'],
      });

      expect(url).toContain('provider_scopes=read_api');
      expect(url).toContain('provider_scopes=read_repository');
    });

    it('includes provider query params', () => {
      const url = getAuthorizationUrl({
        clientId: 'client_123',
        redirectUri: 'https://app.com/callback',
        provider: 'GoogleOAuth',
        providerQueryParams: {
          foo: 'bar',
          baz: 123,
          bool: true,
        },
      });

      expect(url).toContain('provider_query_params%5Bfoo%5D=bar');
      expect(url).toContain('provider_query_params%5Bbaz%5D=123');
      expect(url).toContain('provider_query_params%5Bbool%5D=true');
    });

    it('uses custom baseURL when provided', () => {
      const url = getAuthorizationUrl({
        clientId: 'client_123',
        redirectUri: 'https://app.com/callback',
        provider: 'GoogleOAuth',
        baseURL: 'https://api.workos.dev',
      });

      expect(url).toContain('https://api.workos.dev/sso/authorize');
    });

    it('throws error when no provider, connection, or organization specified', () => {
      expect(() => {
        getAuthorizationUrl({
          clientId: 'client_123',
          redirectUri: 'https://app.com/callback',
        });
      }).toThrow(
        "Incomplete arguments. Need to specify either a 'connection', 'organization', or 'provider'.",
      );
    });
  });
});
