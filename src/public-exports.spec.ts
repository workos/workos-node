import { userManagement, sso } from './index.public';

describe('New Public Exports', () => {
  describe('userManagement exports', () => {
    it('exports getAuthorizationUrl function', () => {
      expect(userManagement.getAuthorizationUrl).toBeDefined();
      expect(typeof userManagement.getAuthorizationUrl).toBe('function');
    });

    it('exports getLogoutUrl function', () => {
      expect(userManagement.getLogoutUrl).toBeDefined();
      expect(typeof userManagement.getLogoutUrl).toBe('function');
    });

    it('exports getJwksUrl function', () => {
      expect(userManagement.getJwksUrl).toBeDefined();
      expect(typeof userManagement.getJwksUrl).toBe('function');
    });

    it('can generate authorization URL directly', () => {
      const url = userManagement.getAuthorizationUrl({
        clientId: 'client_123',
        redirectUri: 'https://app.com/callback',
        provider: 'authkit',
      });

      expect(url).toContain('https://api.workos.com/user_management/authorize');
      expect(url).toContain('client_id=client_123');
    });
  });

  describe('sso exports', () => {
    it('exports getAuthorizationUrl function', () => {
      expect(sso.getAuthorizationUrl).toBeDefined();
      expect(typeof sso.getAuthorizationUrl).toBe('function');
    });

    it('can generate SSO authorization URL directly', () => {
      const url = sso.getAuthorizationUrl({
        clientId: 'client_123',
        redirectUri: 'https://app.com/callback',
        provider: 'GoogleOAuth',
      });

      expect(url).toContain('https://api.workos.com/sso/authorize');
      expect(url).toContain('provider=GoogleOAuth');
    });
  });
});
