import axios from 'axios';

import WorkOS from '../workos';

describe('SSO', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('SSO', () => {
    describe('getAuthorizationURL', () => {
      describe('with no custom api hostname', () => {
        it('generates an authorize url with the default api hostname', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

          const url = workos.sso.getAuthorizationURL({
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

          const url = workos.sso.getAuthorizationURL({
            domain: 'lyft.com',
            projectID: 'proj_123',
            redirectURI: 'example.com/sso/workos/callback',
          });

          expect(url).toMatchSnapshot();
        });
      });

      describe('with state', () => {
        it('generates an authorize url with the provided state', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

          const url = workos.sso.getAuthorizationURL({
            domain: 'lyft.com',
            projectID: 'proj_123',
            redirectURI: 'example.com/sso/workos/callback',
            state: 'custom state',
          });

          expect(url).toMatchSnapshot();
        });
      });
    });

    describe('getProfile', () => {
      describe('with all information provided', () => {
        it('sends a request to the WorkOS api for a profile', async () => {
          const post = jest
            .spyOn(axios, 'post')
            .mockImplementationOnce(async () => {
              return {
                data: {
                  profile: {
                    id: 'prof_123',
                    idp_id: '123',
                    connection_type: 'OktaSAML',
                    email: 'foo@test.com',
                    first_name: 'foo',
                    last_name: 'bar',
                  },
                },
              };
            });

          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
          const profile = await workos.sso.getProfile({
            code: 'authorization_code',
            projectID: 'proj_123',
            redirectURI: 'https://exmaple.com/sso/workos/callback',
          });

          expect(post).toBeCalledTimes(1);
          expect(post.mock.calls[0][0]).toMatchSnapshot();
          expect(post.mock.calls[0][1]).toEqual(null);
          expect(post.mock.calls[0][2]).toMatchSnapshot();

          expect(profile).toMatchSnapshot();
        });
      });
    });
  });
});
