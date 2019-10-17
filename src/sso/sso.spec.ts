import WorkOS from '../workos';

describe('SSO', () => {
  describe('getAuthorizeURL', () => {
    describe('with no custom api hostname', () => {
      it('generates an authorize url with the default api hostname', () => {
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const url = workos.sso.authorizeURL({
          domain: 'lyft.com',
          projectID: 'proj_123',
          redirectURI: 'example.com/sso/workos/callback',
        });

        expect(url).toMatchSnapshot();
      });
    });

    describe('with a custom api hostname', () => {
      it('generates an authorize url with the custom api hostname', () => {
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
          apiHostname: 'api.workos.dev',
        });

        const url = workos.sso.authorizeURL({
          domain: 'lyft.com',
          projectID: 'proj_123',
          redirectURI: 'example.com/sso/workos/callback',
        });

        expect(url).toMatchSnapshot();
      });
    });

    describe('with state', () => {
      it('generates an authorize url the provided state', () => {
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const url = workos.sso.authorizeURL({
          domain: 'lyft.com',
          projectID: 'proj_123',
          redirectURI: 'example.com/sso/workos/callback',
          state: 'custom state',
        });

        expect(url).toMatchSnapshot();
      });
    });
  });
});
