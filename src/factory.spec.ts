import {
  createWorkOS,
  type PublicUserManagement,
  type PublicSSO,
} from './factory';

describe('createWorkOS', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    delete process.env.WORKOS_API_KEY;
    delete process.env.WORKOS_CLIENT_ID;
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  describe('with only clientId (public client)', () => {
    it('returns a WorkOS instance with clientId', () => {
      const workos = createWorkOS({ clientId: 'client_123' });

      expect(workos.clientId).toBe('client_123');
      expect(workos.baseURL).toBeDefined();
    });

    it('has access to PKCE utilities', () => {
      const workos = createWorkOS({ clientId: 'client_123' });

      expect(workos.pkce).toBeDefined();
      expect(typeof workos.pkce.generate).toBe('function');
      expect(typeof workos.pkce.generateCodeVerifier).toBe('function');
      expect(typeof workos.pkce.generateCodeChallenge).toBe('function');
    });

    it('has access to public userManagement methods', () => {
      const workos = createWorkOS({ clientId: 'client_123' });

      expect(typeof workos.userManagement.getAuthorizationUrl).toBe('function');
      expect(typeof workos.userManagement.getAuthorizationUrlWithPKCE).toBe(
        'function',
      );
      expect(typeof workos.userManagement.authenticateWithCodeAndVerifier).toBe(
        'function',
      );
      expect(typeof workos.userManagement.authenticateWithRefreshToken).toBe(
        'function',
      );
      expect(typeof workos.userManagement.getLogoutUrl).toBe('function');
      expect(typeof workos.userManagement.getJwksUrl).toBe('function');
    });

    it('has access to public SSO methods', () => {
      const workos = createWorkOS({ clientId: 'client_123' });

      expect(typeof workos.sso.getAuthorizationUrl).toBe('function');
      expect(typeof workos.sso.getAuthorizationUrlWithPKCE).toBe('function');
    });
  });

  describe('with apiKey (confidential client)', () => {
    it('returns a WorkOS instance with API key', () => {
      const workos = createWorkOS({
        apiKey: 'sk_test_123',
        clientId: 'client_123',
      });

      expect(workos.key).toBe('sk_test_123');
      expect(workos.clientId).toBe('client_123');
      expect(workos.baseURL).toBeDefined();
    });

    it('has access to all services', () => {
      const workos = createWorkOS({
        apiKey: 'sk_test_123',
        clientId: 'client_123',
      });

      expect(workos.userManagement).toBeDefined();
      expect(workos.sso).toBeDefined();
      expect(workos.organizations).toBeDefined();
      expect(workos.directorySync).toBeDefined();
      expect(workos.auditLogs).toBeDefined();
    });
  });

  /**
   * Type-level tests - these verify compile-time behavior.
   * If these compile, the types are working correctly.
   */
  describe('type safety (compile-time verification)', () => {
    it('PublicWorkOS type has narrowed userManagement', () => {
      // This test verifies the type structure at compile time
      const workos = createWorkOS({ clientId: 'client_123' });

      // These should be available on PublicUserManagement
      const _getAuthUrl: PublicUserManagement['getAuthorizationUrl'] =
        workos.userManagement.getAuthorizationUrl;
      const _getAuthUrlPKCE: PublicUserManagement['getAuthorizationUrlWithPKCE'] =
        workos.userManagement.getAuthorizationUrlWithPKCE;
      const _authWithCodeAndVerifier: PublicUserManagement['authenticateWithCodeAndVerifier'] =
        workos.userManagement.authenticateWithCodeAndVerifier;
      const _authWithRefresh: PublicUserManagement['authenticateWithRefreshToken'] =
        workos.userManagement.authenticateWithRefreshToken;
      const _logoutUrl: PublicUserManagement['getLogoutUrl'] =
        workos.userManagement.getLogoutUrl;
      const _jwksUrl: PublicUserManagement['getJwksUrl'] =
        workos.userManagement.getJwksUrl;

      // Verify they exist
      expect(_getAuthUrl).toBeDefined();
      expect(_getAuthUrlPKCE).toBeDefined();
      expect(_authWithCodeAndVerifier).toBeDefined();
      expect(_authWithRefresh).toBeDefined();
      expect(_logoutUrl).toBeDefined();
      expect(_jwksUrl).toBeDefined();
    });

    it('PublicWorkOS type has narrowed SSO', () => {
      const workos = createWorkOS({ clientId: 'client_123' });

      const _getAuthUrl: PublicSSO['getAuthorizationUrl'] =
        workos.sso.getAuthorizationUrl;
      const _getAuthUrlPKCE: PublicSSO['getAuthorizationUrlWithPKCE'] =
        workos.sso.getAuthorizationUrlWithPKCE;

      expect(_getAuthUrl).toBeDefined();
      expect(_getAuthUrlPKCE).toBeDefined();
    });

    it('confidential client has full WorkOS type', () => {
      const workos = createWorkOS({
        apiKey: 'sk_test',
        clientId: 'client_123',
      });

      // Full WorkOS should have organizations, directorySync, etc.
      expect(workos.organizations).toBeDefined();
      expect(workos.directorySync).toBeDefined();
      expect(workos.auditLogs).toBeDefined();
      expect(workos.events).toBeDefined();

      // And full userManagement with all methods
      expect(typeof workos.userManagement.listUsers).toBe('function');
      expect(typeof workos.userManagement.createUser).toBe('function');
    });

    it('PublicWorkOS does not expose confidential methods', () => {
      const workos = createWorkOS({ clientId: 'client_123' });

      // These should cause TypeScript errors - proving type narrowing works
      // @ts-expect-error - listUsers not available on PublicWorkOS
      void workos.userManagement.listUsers;
      // @ts-expect-error - createUser not available on PublicWorkOS
      void workos.userManagement.createUser;
      // @ts-expect-error - organizations not available on PublicWorkOS
      void workos.organizations;
      // @ts-expect-error - directorySync not available on PublicWorkOS
      void workos.directorySync;
      // @ts-expect-error - auditLogs not available on PublicWorkOS
      void workos.auditLogs;
    });

    it('ignores WORKOS_API_KEY env var for type safety', () => {
      process.env.WORKOS_API_KEY = 'sk_from_env';

      // Factory should return PublicWorkOS based on explicit options, not env
      const workos = createWorkOS({ clientId: 'client_123' });

      // Type is PublicWorkOS, so these should error
      // @ts-expect-error - organizations not available on PublicWorkOS
      void workos.organizations;

      // Runtime: the underlying WorkOS may have picked up the env var,
      // but the TYPE is what matters for compile-time safety
      expect(workos.clientId).toBe('client_123');
    });
  });
});
