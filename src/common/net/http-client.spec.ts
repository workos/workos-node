import { HttpClient } from './http-client';

describe('HttpClient', () => {
  describe('getResourceURL', () => {
    const baseURL = 'https://api.workos.com';

    it('joins the path and query string onto the base URL', () => {
      expect(
        HttpClient.getResourceURL(baseURL, '/organizations/org_01ABC', {
          limit: 10,
          after: undefined,
        }),
      ).toBe('https://api.workos.com/organizations/org_01ABC?limit=10');
    });

    it('keeps an encoded identifier inside its own segment', () => {
      expect(
        HttpClient.getResourceURL(
          baseURL,
          `/api_keys/${encodeURIComponent('../../user_management/users/user_01VICTIM')}`,
        ),
      ).toBe(
        'https://api.workos.com/api_keys/..%2F..%2Fuser_management%2Fusers%2Fuser_01VICTIM',
      );
    });

    it.each(['.', '..', '%2e', '%2E%2e', '.%2e', '%2e.'])(
      'rejects the dot segment "%s" that the URL parser would collapse',
      (segment) => {
        // A bare `encodeURIComponent` leaves `.` and `..` unchanged, so a
        // generated module would otherwise send `/organizations/../api_keys`
        // and have the URL parser resolve it to `/api_keys`.
        expect(() =>
          HttpClient.getResourceURL(
            baseURL,
            `/organizations/${segment}/api_keys`,
          ),
        ).toThrow(TypeError);
        expect(() =>
          HttpClient.getResourceURL(baseURL, `/api_keys/${segment}`),
        ).toThrow(TypeError);
      },
    );

    it('allows segments that merely contain dots or encoded dots', () => {
      expect(() =>
        HttpClient.getResourceURL(baseURL, '/feature-flags/..foo/enable'),
      ).not.toThrow();
      expect(() =>
        HttpClient.getResourceURL(baseURL, '/feature-flags/v1.2.3'),
      ).not.toThrow();
      expect(() =>
        HttpClient.getResourceURL(baseURL, '/api_keys/%252e%252e'),
      ).not.toThrow();
      expect(() =>
        HttpClient.getResourceURL(baseURL, '/api_keys/a%2F..'),
      ).not.toThrow();
    });

    it('only inspects the path portion, not the query string', () => {
      expect(() =>
        HttpClient.getResourceURL(baseURL, '/audit_logs/events?after=..'),
      ).not.toThrow();
    });
  });
});
