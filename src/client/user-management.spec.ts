import {
  getAuthorizationUrl,
  getLogoutUrl,
  getJwksUrl,
} from './user-management';

describe('Public User Management Methods', () => {
  describe('getAuthorizationUrl', () => {
    it('builds correct URL with required params', () => {
      const url = getAuthorizationUrl({
        clientId: 'client_123',
        redirectUri: 'https://app.com/callback',
        provider: 'authkit',
      });

      expect(url).toContain('https://api.workos.com/user_management/authorize');
      expect(url).toContain('client_id=client_123');
      expect(url).toContain('redirect_uri=https%3A%2F%2Fapp.com%2Fcallback');
      expect(url).toContain('provider=authkit');
      expect(url).toContain('response_type=code');
    });

    it('builds URL with organization ID', () => {
      const url = getAuthorizationUrl({
        clientId: 'client_123',
        redirectUri: 'https://app.com/callback',
        organizationId: 'org_123',
      });

      expect(url).toContain('organization_id=org_123');
    });

    it('builds URL with connection ID', () => {
      const url = getAuthorizationUrl({
        clientId: 'client_123',
        redirectUri: 'https://app.com/callback',
        connectionId: 'conn_123',
      });

      expect(url).toContain('connection_id=conn_123');
    });

    it('includes code challenge for PKCE', () => {
      const url = getAuthorizationUrl({
        clientId: 'client_123',
        redirectUri: 'https://app.com/callback',
        provider: 'authkit',
        codeChallenge: 'challenge_123',
        codeChallengeMethod: 'S256',
      });

      expect(url).toContain('code_challenge=challenge_123');
      expect(url).toContain('code_challenge_method=S256');
    });

    it('includes screenHint for authkit provider', () => {
      const url = getAuthorizationUrl({
        clientId: 'client_123',
        redirectUri: 'https://app.com/callback',
        provider: 'authkit',
        screenHint: 'sign-up',
      });

      expect(url).toContain('screen_hint=sign-up');
    });

    it('throws error for screenHint with non-authkit provider', () => {
      expect(() => {
        getAuthorizationUrl({
          clientId: 'client_123',
          redirectUri: 'https://app.com/callback',
          provider: 'GoogleOAuth',
          screenHint: 'sign-up',
        });
      }).toThrow("'screenHint' is only supported for 'authkit' provider");
    });

    it('includes state parameter', () => {
      const url = getAuthorizationUrl({
        clientId: 'client_123',
        redirectUri: 'https://app.com/callback',
        provider: 'authkit',
        state: 'custom state',
      });

      expect(url).toContain('state=custom+state');
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
        provider: 'authkit',
        baseURL: 'https://api.workos.dev',
      });

      expect(url).toContain('https://api.workos.dev/user_management/authorize');
    });

    it('throws error when no provider, connection, or organization specified', () => {
      expect(() => {
        getAuthorizationUrl({
          clientId: 'client_123',
          redirectUri: 'https://app.com/callback',
        });
      }).toThrow(
        "Incomplete arguments. Need to specify either a 'connectionId', 'organizationId', or 'provider'.",
      );
    });
  });

  describe('getLogoutUrl', () => {
    it('builds correct logout URL', () => {
      const url = getLogoutUrl({
        sessionId: 'session_123',
      });

      expect(url).toBe(
        'https://api.workos.com/user_management/sessions/logout?session_id=session_123',
      );
    });

    it('includes returnTo parameter when provided', () => {
      const url = getLogoutUrl({
        sessionId: 'session_123',
        returnTo: 'https://app.com/home',
      });

      expect(url).toBe(
        'https://api.workos.com/user_management/sessions/logout?session_id=session_123&return_to=https%3A%2F%2Fapp.com%2Fhome',
      );
    });

    it('uses custom baseURL when provided', () => {
      const url = getLogoutUrl({
        sessionId: 'session_123',
        baseURL: 'https://api.workos.dev',
      });

      expect(url).toBe(
        'https://api.workos.dev/user_management/sessions/logout?session_id=session_123',
      );
    });

    it('throws error when sessionId is not provided', () => {
      expect(() => {
        getLogoutUrl({
          sessionId: '',
        });
      }).toThrow("Incomplete arguments. Need to specify 'sessionId'.");
    });
  });

  describe('getJwksUrl', () => {
    it('builds correct JWKS URL', () => {
      const url = getJwksUrl('client_123');

      expect(url).toBe('https://api.workos.com/sso/jwks/client_123');
    });

    it('uses custom baseURL when provided', () => {
      const url = getJwksUrl('client_123', 'https://api.workos.dev');

      expect(url).toBe('https://api.workos.dev/sso/jwks/client_123');
    });

    it('throws error when clientId is not provided', () => {
      expect(() => {
        getJwksUrl('');
      }).toThrow('clientId must be a valid clientId');
    });
  });
});
