import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { WorkOS } from '../workos';

describe('SSO', () => {
  describe('SSO', () => {
    describe('getAuthorizationURL', () => {
      describe('with no custom api hostname', () => {
        it('generates an authorize url with the default api hostname', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

          const url = workos.sso.getAuthorizationURL({
            domain: 'lyft.com',
            clientID: 'proj_123',
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
              clientID: 'proj_123',
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
            clientID: 'proj_123',
            redirectURI: 'example.com/sso/workos/callback',
          });

          expect(url).toMatchSnapshot();
        });
      });

      describe('with a connection', () => {
        it('generates an authorize url with the connection', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
            apiHostname: 'api.workos.dev',
          });

          const url = workos.sso.getAuthorizationURL({
            connection: 'connection_123',
            clientID: 'proj_123',
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
            clientID: 'proj_123',
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
            clientID: 'proj_123',
            redirectURI: 'example.com/sso/workos/callback',
            state: 'custom state',
          });

          expect(url).toMatchSnapshot();
        });
      });
    });

    describe('getProfileAndToken', () => {
      describe('with all information provided', () => {
        it('sends a request to the WorkOS api for a profile', async () => {
          const mock = new MockAdapter(axios);
          mock.onPost('/sso/token').reply(200, {
            access_token: '01DMEK0J53CVMC32CK5SE0KZ8Q',
            profile: {
              id: 'prof_123',
              idp_id: '123',
              connection_id: 'conn_123',
              connection_type: 'OktaSAML',
              email: 'foo@test.com',
              first_name: 'foo',
              last_name: 'bar',
              raw_attributes: {
                email: 'foo@test.com',
                first_name: 'foo',
                last_name: 'bar',
              },
            },
          });

          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
          const { access_token: accessToken, profile } =
            await workos.sso.getProfileAndToken({
              code: 'authorization_code',
              clientID: 'proj_123',
            });

          expect(mock.history.post.length).toBe(1);
          const { data, headers } = mock.history.post[0];

          expect(data).toMatchSnapshot();
          expect(headers).toMatchSnapshot();
          expect(accessToken).toBe('01DMEK0J53CVMC32CK5SE0KZ8Q');
          expect(profile).toMatchSnapshot();
        });
      });
    });

    describe('deleteConnection', () => {
      it('sends request to delete a Connection', async () => {
        const mock = new MockAdapter(axios);
        mock.onDelete().reply(200, {});
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await workos.sso.deleteConnection('conn_123');

        expect(mock.history.delete[0].url).toEqual('/connections/conn_123');
      });
    });

    describe('getConnection', () => {
      it(`requests a Connection`, async () => {
        const mock = new MockAdapter(axios);
        mock.onGet().reply(200, {});
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await workos.sso.getConnection('conn_123');

        expect(mock.history.get[0].url).toEqual('/connections/conn_123');
      });
    });

    describe('listConnections', () => {
      it(`requests a list of Connections`, async () => {
        const mock = new MockAdapter(axios);
        mock.onGet().reply(200, {});
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await workos.sso.listConnections();

        expect(mock.history.get[0].url).toEqual('/connections');
      });
    });
  });
});
