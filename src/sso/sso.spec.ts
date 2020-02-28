import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import querystring from 'querystring';

import WorkOS from '../workos';

describe('SSO', () => {
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

      describe('with no domain or provider', () => {
        it('throws an error for incomplete arguments', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

          const urlFn = () =>
            workos.sso.getAuthorizationURL({
              projectID: 'proj_123',
              redirectURI: 'example.com/sso/workos/callback',
            });

          expect(urlFn).toThrowErrorMatchingSnapshot();
        });
      });

      describe('with a provider', () => {
        it('generates an authorize url with the provider', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
            apiHostname: 'api.workos.dev',
          });

          const url = workos.sso.getAuthorizationURL({
            provider: 'Google',
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
          const mock = new MockAdapter(axios);
          mock.onPost('/sso/token').reply(200, {
            profile: {
              id: 'prof_123',
              idp_id: '123',
              connection_type: 'OktaSAML',
              email: 'foo@test.com',
              first_name: 'foo',
              last_name: 'bar',
            },
          });

          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
          const profile = await workos.sso.getProfile({
            code: 'authorization_code',
            projectID: 'proj_123',
          });

          expect(mock.history.post.length).toBe(1);

          const post = mock.history.post[0];
          const requestURL = `${post.url}?${querystring.stringify(
            post.params,
          )}`;
          expect(requestURL).toMatchSnapshot();
          expect(post.headers).toMatchSnapshot();
          expect(profile).toMatchSnapshot();
        });
      });
    });

    describe('promoteDraftConnection', () => {
      it('send valid token', async () => {
        const id = 'wOrkOStoKeN';
        const endpoint = `/draft_connections/${id}/activate`;

        const mock = new MockAdapter(axios);
        mock.onPost(endpoint).reply(201);

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
        await workos.sso.promoteDraftConnection({ id });

        expect(mock.history.post.length).toBe(1);
        const post = mock.history.post[0];
        const expectedEndpoint = 'https://api.workos.com' + endpoint;
        expect(post.url).toEqual(expectedEndpoint);
      });

      it('send bad token', async () => {
        const id = 'wOrkOStoKeN';
        const endpoint = `/draft_connections/${id}/activate`;

        const mock = new MockAdapter(axios);
        mock
          .onPost(endpoint)
          .reply(
            404,
            { message: 'Bad Request' },
            { 'X-Request-ID': 'a-request-id' },
          );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        try {
          await workos.sso.promoteDraftConnection({ id });
          throw 'should not be called';
        } catch (err) {
          const post = mock.history.post[0];
          const expectedEndpoint = 'https://api.workos.com' + endpoint;
          expect(post.url).toEqual(expectedEndpoint);
          expect(err.status).toEqual(404);
        }
      });
    });
  });
});
