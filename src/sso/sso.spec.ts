import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { WorkOS } from '../workos';
import { ConnectionResponse, ConnectionType } from './interfaces';

describe('SSO', () => {
  const connectionResponse: ConnectionResponse = {
    object: 'connection',
    id: 'conn_123',
    organization_id: 'org_123',
    name: 'Connection',
    connection_type: ConnectionType.OktaSAML,
    state: 'active',
    domains: [],
    created_at: '2023-07-17T20:07:20.055Z',
    updated_at: '2023-07-17T20:07:20.055Z',
  };

  describe('SSO', () => {
    describe('getAuthorizationUrl', () => {
      describe('with no custom api hostname', () => {
        it('generates an authorize url with the default api hostname', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

          const url = workos.sso.getAuthorizationUrl({
            domain: 'lyft.com',
            clientId: 'proj_123',
            redirectUri: 'example.com/sso/workos/callback',
          });

          expect(url).toMatchSnapshot();
        });
      });

      describe('with no domain or provider', () => {
        it('throws an error for incomplete arguments', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

          const urlFn = () =>
            workos.sso.getAuthorizationUrl({
              clientId: 'proj_123',
              redirectUri: 'example.com/sso/workos/callback',
            });

          expect(urlFn).toThrowErrorMatchingSnapshot();
        });
      });

      describe('with a provider', () => {
        it('generates an authorize url with the provider', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
            apiHostname: 'api.workos.dev',
          });

          const url = workos.sso.getAuthorizationUrl({
            provider: 'Google',
            clientId: 'proj_123',
            redirectUri: 'example.com/sso/workos/callback',
          });

          expect(url).toMatchSnapshot();
        });
      });

      describe('with a connection', () => {
        it('generates an authorize url with the connection', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
            apiHostname: 'api.workos.dev',
          });

          const url = workos.sso.getAuthorizationUrl({
            connection: 'connection_123',
            clientId: 'proj_123',
            redirectUri: 'example.com/sso/workos/callback',
          });

          expect(url).toMatchSnapshot();
        });
      });

      describe('with an `organization`', () => {
        it('generates an authorization URL with the organization', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
            apiHostname: 'api.workos.dev',
          });

          const url = workos.sso.getAuthorizationUrl({
            organization: 'organization_123',
            clientId: 'proj_123',
            redirectUri: 'example.com/sso/workos/callback',
          });

          expect(url).toMatchSnapshot();
        });
      });

      describe('with a custom api hostname', () => {
        it('generates an authorize url with the custom api hostname', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
            apiHostname: 'api.workos.dev',
          });

          const url = workos.sso.getAuthorizationUrl({
            domain: 'lyft.com',
            clientId: 'proj_123',
            redirectUri: 'example.com/sso/workos/callback',
          });

          expect(url).toMatchSnapshot();
        });
      });

      describe('with state', () => {
        it('generates an authorize url with the provided state', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

          const url = workos.sso.getAuthorizationUrl({
            domain: 'lyft.com',
            clientId: 'proj_123',
            redirectUri: 'example.com/sso/workos/callback',
            state: 'custom state',
          });

          expect(url).toMatchSnapshot();
        });
      });

      describe('with domainHint', () => {
        it('generates an authorize url with the provided domain hint', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

          const url = workos.sso.getAuthorizationUrl({
            domainHint: 'lyft.com',
            connection: 'connection_123',
            clientId: 'proj_123',
            redirectUri: 'example.com/sso/workos/callback',
            state: 'custom state',
          });

          expect(url).toMatchInlineSnapshot(
            `"https://api.workos.com/sso/authorize?client_id=proj_123&connection=connection_123&domain_hint=lyft.com&redirect_uri=example.com%2Fsso%2Fworkos%2Fcallback&response_type=code&state=custom+state"`,
          );
        });
      });

      describe('with loginHint', () => {
        it('generates an authorize url with the provided login hint', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

          const url = workos.sso.getAuthorizationUrl({
            loginHint: 'foo@workos.com',
            connection: 'connection_123',
            clientId: 'proj_123',
            redirectUri: 'example.com/sso/workos/callback',
            state: 'custom state',
          });

          expect(url).toMatchInlineSnapshot(
            `"https://api.workos.com/sso/authorize?client_id=proj_123&connection=connection_123&login_hint=foo%40workos.com&redirect_uri=example.com%2Fsso%2Fworkos%2Fcallback&response_type=code&state=custom+state"`,
          );
        });
      });
    });

    describe('getProfileAndToken', () => {
      describe('with all information provided', () => {
        it('sends a request to the WorkOS api for a profile', async () => {
          const mock = new MockAdapter(axios);

          const expectedBody = new URLSearchParams({
            client_id: 'proj_123',
            client_secret: 'sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU',
            code: 'authorization_code',
            grant_type: 'authorization_code',
          });
          expectedBody.sort();

          mock.onPost('/sso/token').replyOnce((config) => {
            const actualBody = new URLSearchParams(config.data);
            actualBody.sort();

            if (actualBody.toString() === expectedBody.toString()) {
              return [
                200,
                {
                  access_token: '01DMEK0J53CVMC32CK5SE0KZ8Q',
                  profile: {
                    id: 'prof_123',
                    idp_id: '123',
                    organization_id: 'org_123',
                    connection_id: 'conn_123',
                    connection_type: 'OktaSAML',
                    email: 'foo@test.com',
                    first_name: 'foo',
                    last_name: 'bar',
                    groups: ['Admins', 'Developers'],
                    raw_attributes: {
                      email: 'foo@test.com',
                      first_name: 'foo',
                      last_name: 'bar',
                      groups: ['Admins', 'Developers'],
                    },
                  },
                },
              ];
            }

            return [404];
          });

          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
          const { accessToken, profile } = await workos.sso.getProfileAndToken({
            code: 'authorization_code',
            clientId: 'proj_123',
          });

          expect(mock.history.post.length).toBe(1);
          const { data, headers } = mock.history.post[0];

          expect(data).toMatchSnapshot();
          expect(headers).toMatchSnapshot();
          expect(accessToken).toBe('01DMEK0J53CVMC32CK5SE0KZ8Q');
          expect(profile).toMatchSnapshot();
        });
      });

      describe('without a groups attribute', () => {
        it('sends a request to the WorkOS api for a profile', async () => {
          const mock = new MockAdapter(axios);

          const expectedBody = new URLSearchParams({
            client_id: 'proj_123',
            client_secret: 'sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU',
            code: 'authorization_code',
            grant_type: 'authorization_code',
          });
          expectedBody.sort();

          mock.onPost('/sso/token').replyOnce((config) => {
            const actualBody = new URLSearchParams(config.data);
            actualBody.sort();

            if (actualBody.toString() === expectedBody.toString()) {
              return [
                200,
                {
                  access_token: '01DMEK0J53CVMC32CK5SE0KZ8Q',
                  profile: {
                    id: 'prof_123',
                    idp_id: '123',
                    organization_id: 'org_123',
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
                },
              ];
            }

            return [404];
          });

          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
          const { accessToken, profile } = await workos.sso.getProfileAndToken({
            code: 'authorization_code',
            clientId: 'proj_123',
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

    describe('getProfile', () => {
      it('calls the `/sso/profile` endpoint with the provided access token', async () => {
        const mock = new MockAdapter(axios);

        mock
          .onGet('/sso/profile', {
            accessToken: 'access_token',
          })
          .replyOnce(200, {
            id: 'prof_123',
            idp_id: '123',
            organization_id: 'org_123',
            connection_id: 'conn_123',
            connection_type: 'OktaSAML',
            email: 'foo@test.com',
            first_name: 'foo',
            last_name: 'bar',
            groups: ['Admins', 'Developers'],
            raw_attributes: {
              email: 'foo@test.com',
              first_name: 'foo',
              last_name: 'bar',
              groups: ['Admins', 'Developers'],
            },
          });

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
        const profile = await workos.sso.getProfile({
          accessToken: 'access_token',
        });

        expect(mock.history.get.length).toBe(1);
        const { headers } = mock.history.get[0];
        expect(headers?.Authorization).toBe(`Bearer access_token`);

        expect(profile.id).toBe('prof_123');
      });
    });

    describe('deleteConnection', () => {
      it('sends request to delete a Connection', async () => {
        const mock = new MockAdapter(axios);
        mock.onDelete('/connections/conn_123').replyOnce(200, {});

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await workos.sso.deleteConnection('conn_123');

        expect(mock.history.delete[0].url).toEqual('/connections/conn_123');
      });
    });

    describe('getConnection', () => {
      it(`requests a Connection`, async () => {
        const mock = new MockAdapter(axios);
        mock.onGet('/connections/conn_123').replyOnce(200, connectionResponse);

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const subject = await workos.sso.getConnection('conn_123');

        expect(mock.history.get[0].url).toEqual('/connections/conn_123');

        expect(subject.connectionType).toEqual('OktaSAML');
      });
    });

    describe('listConnections', () => {
      it(`requests a list of Connections`, async () => {
        const mock = new MockAdapter(axios);
        mock.onGet('/connections').replyOnce(200, {
          data: [connectionResponse],
          list_metadata: {},
        });

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const subject = await workos.sso.listConnections({
          organizationId: 'org_1234',
        });

        expect(mock.history.get[0].url).toEqual('/connections');

        expect(subject.data).toHaveLength(1);
      });
    });
  });
});
