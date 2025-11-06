import { userManagement, sso } from './index.client';

describe('Client Exports', () => {
  describe('userManagement exports', () => {
    it('should generate authorization URLs correctly', () => {
      const url = userManagement.getAuthorizationUrl({
        clientId: 'client_123',
        redirectUri: 'https://example.com/callback',
        provider: 'authkit',
      });

      expect(url).toContain('client_id=client_123');
      expect(url).toContain(
        'redirect_uri=https%3A%2F%2Fexample.com%2Fcallback',
      );
      expect(url).toContain('provider=authkit');
    });

    it('should generate logout URLs correctly', () => {
      const url = userManagement.getLogoutUrl({
        sessionId: 'session_123',
        returnTo: 'https://example.com',
      });

      expect(url).toContain('session_id=session_123');
      expect(url).toContain('return_to=https%3A%2F%2Fexample.com');
    });

    it('should generate JWKS URLs correctly', () => {
      const url = userManagement.getJwksUrl('client_123');
      expect(url).toBe('https://api.workos.com/sso/jwks/client_123');
    });
  });

  describe('sso exports', () => {
    it('should generate SSO authorization URLs correctly', () => {
      const url = sso.getAuthorizationUrl({
        clientId: 'client_123',
        redirectUri: 'https://example.com/callback',
        provider: 'GoogleOAuth',
      });

      expect(url).toContain('client_id=client_123');
      expect(url).toContain('provider=GoogleOAuth');
    });
  });
});
