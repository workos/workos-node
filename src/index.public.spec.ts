import { WorkOS } from './index.public';

describe('WorkOS Public API', () => {
  let workosPublic: WorkOS;

  beforeEach(() => {
    workosPublic = new WorkOS({
      clientId: 'client_123',
      apiHostname: 'api.workos.dev',
    });
  });

  describe('instantiation', () => {
    it('should instantiate without requiring an API key', () => {
      expect(() => new WorkOS()).not.toThrow();
    });

    it('should accept public configuration options', () => {
      const client = new WorkOS({
        clientId: 'test_client',
        apiHostname: 'test.api.com',
        https: false,
        port: 3000,
      });

      expect(client).toBeDefined();
      expect(client.version).toBeDefined();
    });
  });

  describe('exposed services', () => {
    it('should expose webhooks service', () => {
      expect(workosPublic.webhooks).toBeDefined();
      expect(workosPublic.webhooks.verifyHeader).toBeDefined();
      expect(workosPublic.webhooks.computeSignature).toBeDefined();
      expect(workosPublic.webhooks.constructEvent).toBeDefined();
    });

    it('should expose actions service', () => {
      expect(workosPublic.actions).toBeDefined();
      expect(workosPublic.actions.verifyHeader).toBeDefined();
      expect(workosPublic.actions.signResponse).toBeDefined();
      expect(workosPublic.actions.constructAction).toBeDefined();
    });

    it('should expose client-safe user management methods', () => {
      expect(workosPublic.userManagement).toBeDefined();
      expect(
        workosPublic.userManagement.authenticateWithCodeAndVerifier,
      ).toBeDefined();
      expect(workosPublic.userManagement.getAuthorizationUrl).toBeDefined();
      expect(workosPublic.userManagement.getLogoutUrl).toBeDefined();
      expect(workosPublic.userManagement.getJwksUrl).toBeDefined();
    });

    it('should expose client-safe SSO methods', () => {
      expect(workosPublic.sso).toBeDefined();
      expect(workosPublic.sso.getAuthorizationUrl).toBeDefined();
    });

    it('should expose version', () => {
      expect(workosPublic.version).toBeDefined();
      expect(typeof workosPublic.version).toBe('string');
    });
  });

  describe('method behavior', () => {
    it('should be able to call URL generation methods', () => {
      const authUrl = workosPublic.userManagement.getAuthorizationUrl({
        clientId: 'client_123',
        redirectUri: 'https://example.com/callback',
        provider: 'GoogleOAuth',
      });

      expect(authUrl).toContain('api.workos.dev');
      expect(authUrl).toContain('client_id=client_123');
      expect(authUrl).toContain('provider=GoogleOAuth');
    });

    it('should be able to call JWKS URL generation', () => {
      const jwksUrl = workosPublic.userManagement.getJwksUrl('client_123');
      expect(jwksUrl).toBe('https://api.workos.dev/sso/jwks/client_123');
    });

    it('should be able to call logout URL generation', () => {
      const logoutUrl = workosPublic.userManagement.getLogoutUrl({
        sessionId: 'session_123',
        returnTo: 'https://example.com',
      });

      expect(logoutUrl).toContain('api.workos.dev');
      expect(logoutUrl).toContain('session_id=session_123');
    });

    it('should be able to call SSO authorization URL generation', () => {
      const authUrl = workosPublic.sso.getAuthorizationUrl({
        clientId: 'client_123',
        redirectUri: 'https://example.com/callback',
        provider: 'GoogleOAuth',
      });

      expect(authUrl).toContain('api.workos.dev');
      expect(authUrl).toContain('client_id=client_123');
    });
  });

  describe('server-only methods should not be exposed', () => {
    it('should not expose getUser on userManagement', () => {
      expect((workosPublic.userManagement as any).getUser).toBeUndefined();
    });

    it('should not expose createUser on userManagement', () => {
      expect((workosPublic.userManagement as any).createUser).toBeUndefined();
    });

    it('should not expose listUsers on userManagement', () => {
      expect((workosPublic.userManagement as any).listUsers).toBeUndefined();
    });

    it('should not expose updateUser on userManagement', () => {
      expect((workosPublic.userManagement as any).updateUser).toBeUndefined();
    });

    it('should not expose server-only authentication methods', () => {
      expect(
        (workosPublic.userManagement as any).authenticateWithPassword,
      ).toBeUndefined();
      expect(
        (workosPublic.userManagement as any).authenticateWithMagicAuth,
      ).toBeUndefined();
      expect(
        (workosPublic.userManagement as any).authenticateWithRefreshToken,
      ).toBeUndefined();
    });
  });

  describe('type safety', () => {
    it('should provide proper TypeScript types for exposed methods', () => {
      // These should compile without errors
      const authUrl: string = workosPublic.userManagement.getAuthorizationUrl({
        clientId: 'test',
        redirectUri: 'https://example.com',
        provider: 'GoogleOAuth',
      });

      const jwksUrl: string =
        workosPublic.userManagement.getJwksUrl('client_id');

      expect(typeof authUrl).toBe('string');
      expect(typeof jwksUrl).toBe('string');
    });
  });
});
