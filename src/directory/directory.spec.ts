import WorkOS from '../workos';

describe('SSO', () => {
  describe('getAuthorizationURL', () => {
    it('generates an authorize url with the directory sync flag set', () => {
      const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
        apiHostname: 'api.workos.dev',
      });

      const url = workos.directory.getAuthorizationURL({
        domain: 'lyft.com',
        projectID: 'proj_123',
        redirectURI: 'example.com/sso/workos/callback',
      });

      expect(url).toMatchSnapshot();
    });
  });
});
