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
        describe('with projectID instead of clientID', () => {
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
          const {
            access_token: accessToken,
            profile,
          } = await workos.sso.getProfileAndToken({
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
      describe('with a projectID instead of clientID', () => {
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
          const {
            access_token: accessToken,
            profile,
          } = await workos.sso.getProfileAndToken({
            code: 'authorization_code',
            projectID: 'proj_123',
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

    describe('promoteDraftConnection', () => {
      describe('with valid token', () => {
        it('responds with a 201 CREATED status', async () => {
          const token = 'wOrkOStoKeN';
          const endpoint = `/draft_connections/${token}/activate`;

          const mock = new MockAdapter(axios);
          mock.onPost(endpoint).reply(201);

          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
          await workos.sso.promoteDraftConnection({ token });

          expect(mock.history.post.length).toBe(1);
          const post = mock.history.post[0];
          expect(post.url).toEqual(endpoint);
        });
      });

      describe('with invalid token', () => {
        it('responds with a 404 NOT FOUND status', async () => {
          const token = 'wOrkOStoKeN';
          const endpoint = `/draft_connections/${token}/activate`;

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
            await workos.sso.promoteDraftConnection({ token });
            throw 'should not be called';
          } catch (err) {
            const post = mock.history.post[0];
            expect(post.url).toEqual(endpoint);
            expect(err.status).toEqual(404);
          }
        });
      });
    });

    describe('createConnection', () => {
      describe('with valid token', () => {
        it('responds with a 201 CREATED status', async () => {
          const source = 'wOrkOStoKeN';

          const mock = new MockAdapter(axios);
          mock.onPost('/connections').reply(201);

          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
          await workos.sso.createConnection({ source });

          expect(mock.history.post.length).toBe(1);
          const post = mock.history.post[0];
          expect(post.url).toEqual('/connections');
        });
      });

      describe('with invalid token', () => {
        it('responds with a 404 NOT FOUND status', async () => {
          const source = 'wOrkOStoKeN';

          const mock = new MockAdapter(axios);
          mock.onPost('/connections').reply(
            404,
            {
              message: 'Bad Request',
            },
            {
              'X-Request-ID': 'a-request-id',
            },
          );

          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

          try {
            await workos.sso.createConnection({ source });
            throw 'should not be called';
          } catch (err) {
            const post = mock.history.post[0];
            expect(post.url).toEqual('/connections');
            expect(err.status).toEqual(404);
          }
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
